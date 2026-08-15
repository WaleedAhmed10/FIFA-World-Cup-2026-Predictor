// Minimal dependency-free logger. Swap for winston/pino in a larger deployment.
const level = process.env.LOG_LEVEL || 'info';

const timestamp = () => new Date().toISOString();

module.exports = {
  info: (...args) => console.log(`[INFO] ${timestamp()} -`, ...args),
  warn: (...args) => console.warn(`[WARN] ${timestamp()} -`, ...args),
  error: (...args) => console.error(`[ERROR] ${timestamp()} -`, ...args),
  debug: (...args) => { if (level === 'debug') console.debug(`[DEBUG] ${timestamp()} -`, ...args); }
};
