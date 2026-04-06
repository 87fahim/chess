// server.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import auth from "./routes/auth.js";
import chess from "./routes/chess.js";
import connectDB from "./db/connection.js";
import config from "./config/appConfig.js";
import { applySecurityMiddleware } from "./middleware/security.js";

const app = express();
const allowedOrigins = new Set(config.allowedOrigins);

applySecurityMiddleware(app);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin '${origin}'.`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(cookieParser());
app.use(express.json({ limit: config.requestBodyLimit }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, env: config.nodeEnv });
});

app.use("/api/auth", auth);
app.use("/api/chess", chess);

try {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
} catch (error) {
  console.error("Failed to start server:", error);
  process.exit(1);
}
