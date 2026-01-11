function formatTimestamp(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function requestLogger(req, res, next) {
  const ts = formatTimestamp(new Date());
  console.log(`[${ts}] ${req.method} ${req.originalUrl || req.url}`);
  next();
}

module.exports = requestLogger;
