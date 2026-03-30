import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bundledStockfishCandidates = [
  "stockfish-windows-x86-64-avx2.exe",
  "stockfish-windows-x86-64.exe",
  "stockfish-ubuntu-x86-64-avx2",
  "stockfish-macos-m1-apple-silicon",
  "stockfish-macos-x86-64-modern",
].map((fileName) => path.resolve(__dirname, "../stockfishengin", fileName));

const resolveStockfishPath = () => {
  const configuredPath = process.env.STOCKFISH_PATH?.trim();

  if (configuredPath && fs.existsSync(configuredPath)) {
    return { enginePath: configuredPath, configuredPath };
  }

  const bundledBinary = bundledStockfishCandidates.find((candidate) => fs.existsSync(candidate));
  if (bundledBinary) {
    return { enginePath: bundledBinary, configuredPath };
  }

  return { enginePath: "stockfish", configuredPath };
};

const parseStockfishInfoLine = (line) => {
  const depthMatch = line.match(/\bdepth\s+(\d+)/);
  const cpMatch = line.match(/\bscore\s+cp\s+(-?\d+)/);
  const mateMatch = line.match(/\bscore\s+mate\s+(-?\d+)/);
  const pvMatch = line.match(/\bpv\s+(.+)$/);

  return {
    depth: depthMatch ? Number(depthMatch[1]) : undefined,
    scoreCp: cpMatch ? Number(cpMatch[1]) : undefined,
    scoreMate: mateMatch ? Number(mateMatch[1]) : undefined,
    pv: pvMatch ? pvMatch[1] : undefined,
  };
};

const getBestMoveFromStockfish = ({
  fen,
  movetime = 2000,
  depth,
  nodes,
  skillLevel,
  useLimitStrength,
  uciElo,
}) => {
  return new Promise((resolve, reject) => {
    const { enginePath, configuredPath } = resolveStockfishPath();
    const engine = spawn(enginePath, []);

    let currentDepth;
    let scoreCp;
    let scoreMate;
    let pv;
    let readyForSearch = false;
    let settled = false;

    const cleanup = () => {
      if (!engine.killed) {
        engine.kill();
      }
    };

    const resolveOnce = (value) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };

    const rejectOnce = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const timeout = setTimeout(() => {
      rejectOnce(new Error("Stockfish timed out while searching for a move."));
    }, 15000);

    engine.on("error", (err) => {
      clearTimeout(timeout);
      const configuredPathMessage = configuredPath
        ? ` Configured STOCKFISH_PATH was '${configuredPath}'.`
        : "";
      const bundledPathMessage = ` Expected a bundled binary under '${path.resolve(__dirname, "../stockfishengin")}'.`;
      rejectOnce(
        new Error(
          `Failed to start Stockfish. Set STOCKFISH_PATH to a valid binary, place a Stockfish executable in the server/stockfishengin folder, or install stockfish in PATH.${configuredPathMessage}${bundledPathMessage} ${err.message}`
        )
      );
    });

    engine.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      if (text.trim()) {
        clearTimeout(timeout);
        rejectOnce(new Error(`Stockfish error: ${text.trim()}`));
      }
    });

    engine.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

      for (const line of lines) {
        if (line === "uciok") {
          if (typeof useLimitStrength === "boolean") {
            engine.stdin.write(`setoption name UCI_LimitStrength value ${useLimitStrength ? "true" : "false"}\n`);
          }
          if (typeof uciElo === "number") {
            engine.stdin.write(`setoption name UCI_Elo value ${uciElo}\n`);
          }
          if (typeof skillLevel === "number") {
            engine.stdin.write(`setoption name Skill Level value ${skillLevel}\n`);
          }
          engine.stdin.write("isready\n");
          continue;
        }

        if (line === "readyok" && !readyForSearch) {
          readyForSearch = true;
          engine.stdin.write(`position fen ${fen}\n`);
          const goParts = [];
          if (typeof movetime === "number") {
            goParts.push(`movetime ${movetime}`);
          }
          if (typeof depth === "number") {
            goParts.push(`depth ${depth}`);
          }
          if (typeof nodes === "number") {
            goParts.push(`nodes ${nodes}`);
          }
          engine.stdin.write(`go ${goParts.length ? goParts.join(" ") : `movetime ${movetime}`}\n`);
          continue;
        }

        if (line.startsWith("info ")) {
          const info = parseStockfishInfoLine(line);
          if (typeof info.depth === "number") currentDepth = info.depth;
          if (typeof info.scoreCp === "number") scoreCp = info.scoreCp;
          if (typeof info.scoreMate === "number") scoreMate = info.scoreMate;
          if (typeof info.pv === "string") pv = info.pv;
          continue;
        }

        if (line.startsWith("bestmove ")) {
          clearTimeout(timeout);
          const parts = line.split(" ");
          const bestMoveUci = parts[1];
          if (!bestMoveUci || bestMoveUci === "(none)") {
            rejectOnce(new Error("No legal move found for this position."));
            return;
          }

          resolveOnce({
            bestMoveUci,
            depth: currentDepth,
            scoreCp,
            scoreMate,
            pv,
          });
          return;
        }
      }
    });

    engine.stdin.write("uci\n");
  });
};

export const getNextMove = async (req, res) => {
  try {
    const { fen, movetime, depth, nodes, skillLevel, useLimitStrength, uciElo } = req.body ?? {};

    if (typeof fen !== "string" || !fen.trim()) {
      return res.status(400).json({ error: "fen is required." });
    }

    // Debug log: inbound board state from UI
    console.log("[chess][next-move] incoming fen:", fen.trim());

    const parsedMoveTime = Number.isFinite(Number(movetime))
      ? Math.max(100, Math.min(10000, Number(movetime)))
      : 2000;

    const parsedDepth = Number.isFinite(Number(depth))
      ? Math.max(1, Math.min(40, Number(depth)))
      : undefined;

    const parsedNodes = Number.isFinite(Number(nodes))
      ? Math.max(100, Math.min(50000, Number(nodes)))
      : undefined;

    const parsedSkillLevel = Number.isFinite(Number(skillLevel))
      ? Math.max(0, Math.min(20, Number(skillLevel)))
      : undefined;

    const parsedUseLimitStrength = typeof useLimitStrength === "boolean"
      ? useLimitStrength
      : undefined;

    const parsedUciElo = Number.isFinite(Number(uciElo))
      ? Math.max(1320, Math.min(3190, Number(uciElo)))
      : undefined;

    const result = await getBestMoveFromStockfish({
      fen: fen.trim(),
      movetime: parsedMoveTime,
      depth: parsedDepth,
      nodes: parsedNodes,
      skillLevel: parsedSkillLevel,
      useLimitStrength: parsedUseLimitStrength,
      uciElo: parsedUciElo,
    });

    const from = result.bestMoveUci.slice(0, 2);
    const to = result.bestMoveUci.slice(2, 4);

    // Debug log: outbound selected move to UI
    console.log("[chess][next-move] outgoing move:", result.bestMoveUci);

    return res.json({
      bestMoveUci: result.bestMoveUci,
      bestMoveText: `${from}-${to}`,
      depth: result.depth,
      scoreCp: result.scoreCp,
      scoreMate: result.scoreMate,
      pv: result.pv,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get next move.",
    });
  }
};
