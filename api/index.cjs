// Force Vercel to include backend/package.json in the deployment to preserve "type": "commonjs"
require('../backend/package.json');
const app = require('../backend/server.js');
module.exports = app;
