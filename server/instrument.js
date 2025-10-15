// Initialize Sentry if available; otherwise provide no-op fallbacks so the API
// can run even when the dependency is not installed in the current environment.
let Sentry;
try {
  // This file must be imported before any other imports
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Sentry = require("@sentry/node");
  if (process.env.SENTRY_DSN_BACKEND) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN_BACKEND,
      environment: process.env.NODE_ENV || "development",
      sendDefaultPii: true,
      tracesSampleRate: 1.0,
      integrations: [
        Sentry.httpIntegration(),
        Sentry.expressIntegration(),
      ],
    });
  } else {
    // If DSN is not provided, export shims below
    throw new Error("SENTRY_DSN_BACKEND not set");
  }
} catch (err) {
  // No Sentry in this runtime; export minimal shims
  Sentry = {
    expressRequestHandler: () => (req, res, next) => next(),
    expressErrorHandler: () => (err, req, res, next) => next(err),
    captureException: () => {},
  };
}

module.exports = Sentry;
