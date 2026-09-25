const NODE_ENV = process.env.NODE_ENV || 'development';

function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info: (...args) => console.log(timestamp(), '[INFO]', ...args),
  warn: (...args) => console.warn(timestamp(), '[WARN]', ...args),
  error: (...args) => console.error(timestamp(), '[ERROR]', ...args),
  // Structured stream suitable for production log aggregators.
  json: (level, message, meta = {}) =>
    console.log(JSON.stringify({ ts: timestamp(), level, message, env: NODE_ENV, ...meta })),
};

module.exports = logger;