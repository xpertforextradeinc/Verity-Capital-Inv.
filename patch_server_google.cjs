const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const routeStart = code.indexOf("app.post('/api/v1/auth/google-sync'");
if (routeStart !== -1) {
  const routeEnd = code.indexOf('});', routeStart) + 3;
  code = code.substring(0, routeStart) + code.substring(routeEnd);
  fs.writeFileSync('server.ts', code);
  console.log('server.ts google-sync removed');
}
