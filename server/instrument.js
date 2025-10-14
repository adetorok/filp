// Initialize Sentry if available; otherwise provide no-op fallbacks so the API
// can run even when the dependency is not installed in the current environment.
let Sentry;
try {
  // This file must be imported before any other imports
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Sentry = require("@sentry/node");
  Sentry.init({
    dsn:
      process.env.SENTRY_DSN_BACKEND ||
      "https://bc9fd595b3761684158e312f0e7a023d@o4510179879092224.ingest.us.sentry.io/4510179922214913",
    environment: process.env.NODE_ENV || "development",
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
  });
} catch (err) {
  // No Sentry in this runtime; export minimal shims
  Sentry = {
    Handlers: {
      requestHandler: () => (req, res, next) => next(),
      errorHandler: () => (err, req, res, next) => next(err),
    },
    captureException: () => {},
  };
}

module.exports = Sentry;
