import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../config.env"),
  override: false,
});

const normalizeUrl = (value) => value.replace(/\/+$/, "");

const readEnv = (name) => {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
};

const parseInteger = (value, fallback, { min, max } = {}) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) {
    return fallback;
  }

  const lowerBound = typeof min === "number" ? Math.max(parsed, min) : parsed;
  return typeof max === "number" ? Math.min(lowerBound, max) : lowerBound;
};

const warnIfWeakSecret = (name, value) => {
  const weakValues = [
    "changeme",
    "replace_with",
    "secret",
    "your_jwt_secret_key_here",
    "my_refersh_token",
  ];

  const normalized = value.toLowerCase();
  if (weakValues.some((candidate) => normalized.includes(candidate))) {
    console.warn(`[config] ${name} appears to use a placeholder or weak secret. Rotate it before deployment.`);
  }
};

const nodeEnv = readEnv("NODE_ENV") || "development";
const allowedOrigins = Array.from(
  new Set(
    (readEnv("CLIENT_ORIGIN") || "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
      .map(normalizeUrl)
  )
);
const clientOrigin = allowedOrigins[0] || "http://localhost:5173";

const mongoUri = readEnv("MONGODB_URI") || readEnv("ATLAS_URI");
if (!mongoUri) {
  throw new Error("Missing MongoDB connection string. Set MONGODB_URI or ATLAS_URI in chess/server/config.env.");
}

const jwtSecret = readEnv("JWT_SECRET");
const jwtRefreshSecret = readEnv("JWT_REFRESH_SECRET");

if (jwtSecret) {
  warnIfWeakSecret("JWT_SECRET", jwtSecret);
}

if (!jwtRefreshSecret) {
  throw new Error("Missing JWT_REFRESH_SECRET in chess/server/config.env.");
}

warnIfWeakSecret("JWT_REFRESH_SECRET", jwtRefreshSecret);

const refreshTokenTTLms = parseInteger(readEnv("REFRESH_TOKEN_TTL_MS"), 7 * 24 * 60 * 60 * 1000, {
  min: 60 * 1000,
  max: 30 * 24 * 60 * 60 * 1000,
});

const config = {
  nodeEnv,
  isProd: nodeEnv === "production",
  port: parseInteger(readEnv("PORT"), 5050, { min: 1, max: 65535 }),
  clientOrigin,
  allowedOrigins,
  requestBodyLimit: readEnv("REQUEST_BODY_LIMIT") || "32kb",
  mongoUri,
  mongoDbName: readEnv("MONGODB_DB_NAME") || "chessapp",
  jwtSecret,
  jwtRefreshSecret,
  refreshCookieName: readEnv("REFRESH_COOKIE_NAME") || "refreshToken",
  refreshTokenTTLms,
  bcryptSaltRounds: parseInteger(readEnv("BCRYPT_SALT_ROUNDS"), 12, { min: 10, max: 14 }),
  stockfishPath: readEnv("STOCKFISH_PATH"),
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: config.isProd,
  sameSite: config.isProd ? "none" : "lax",
  path: "/",
  maxAge: config.refreshTokenTTLms,
};

export default config;