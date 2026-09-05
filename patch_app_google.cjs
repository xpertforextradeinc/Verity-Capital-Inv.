const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const funcStart = code.indexOf('const handleGoogleSignIn = async');
if (funcStart !== -1) {
  const funcEnd = code.indexOf('};', funcStart) + 2;
  code = code.substring(0, funcStart) + code.substring(funcEnd);
}

code = code.replace('onGoogleSignIn={handleGoogleSignIn}', '');
code = code.replace('onGoogleSignIn={handleGoogleSignIn}', '');

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx Google Sign in removed');
