// api/index.js
// Vercel usará este archivo solo como punto de entrada hacia tu código ya compilado
const app = require('../dist/app.js').default;
module.exports = app;