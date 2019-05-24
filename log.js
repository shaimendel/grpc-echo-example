module.exports = function log(line) {
  console.log(`[${new Date().toISOString()}] ${line}`);
}