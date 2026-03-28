import { spawn } from "child_process";

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

const getBestMoveFromStockfish = ({ fen, movetime = 2000, depth }) => {
  return new Promise((resolve, reject) => {
    const enginePath = process.env.STOCKFISH_PATH || "stockfish";
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
      rejectOnce(
        new Error(
          `Failed to start Stockfish. Set STOCKFISH_PATH or install stockfish in PATH. ${err.message}`
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
          engine.stdin.write("isready\n");
          continue;
        }

        if (line === "readyok" && !readyForSearch) {
          readyForSearch = true;
          engine.stdin.write(`position fen ${fen}\n`);
          if (typeof depth === "number") {
            engine.stdin.write(`go depth ${depth}\n`);
          } else {
            engine.stdin.write(`go movetime ${movetime}\n`);
          }
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
    const { fen, movetime, depth } = req.body ?? {};

    if (typeof fen !== "string" || !fen.trim()) {
      return res.status(400).json({ error: "fen is required." });
    }

    const parsedMoveTime = Number.isFinite(Number(movetime))
      ? Math.max(100, Math.min(10000, Number(movetime)))
      : 2000;

    const parsedDepth = Number.isFinite(Number(depth))
      ? Math.max(1, Math.min(40, Number(depth)))
      : undefined;

    const result = await getBestMoveFromStockfish({
      fen: fen.trim(),
      movetime: parsedMoveTime,
      depth: parsedDepth,
    });

    const from = result.bestMoveUci.slice(0, 2);
    const to = result.bestMoveUci.slice(2, 4);

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
