import config from "../config/appConfig.js";

export const applySecurityMiddleware = (app) => {
  app.disable("x-powered-by");

  if (config.isProd) {
    app.set("trust proxy", 1);
  }

  app.use((req, res, next) => {
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Cross-Origin-Resource-Policy", "same-site");

    if (req.path.startsWith("/api/auth")) {
      res.setHeader("Cache-Control", "no-store");
    }

    next();
  });
};