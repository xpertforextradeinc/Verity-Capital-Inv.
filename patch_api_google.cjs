const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf8');

const funcStart = code.indexOf('async syncGoogleUser');
if (funcStart !== -1) {
  const funcEnd = code.indexOf('}', code.indexOf('return data;', funcStart)) + 1;
  code = code.substring(0, funcStart) + code.substring(funcEnd);
}

fs.writeFileSync('src/services/api.ts', code);
console.log('api.ts Google sync removed');
