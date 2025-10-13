// This file must be imported before any other imports
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN_BACKEND || "https://bc9fd595b3761684158e312f0e7a023d@o4510179879092224.ingest.us.sentry.io/4510179922214913",
  environment: process.env.NODE_ENV || "development",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  // Performance Monitoring
  tracesSampleRate: 1.0,
});

module.exports = Sentry;
