const fs = require('fs');
let code = fs.readFileSync('src/components/auth/AuthModal.tsx', 'utf8');

code = code.replace(
  "setInfoMsg('In this paper trading demo, you can log in directly using the 1-click demo buttons below.');",
  "setInfoMsg('Institutional access requires full verification.');"
);
code = code.replace(
  "Open Demo Account",
  "Institutional Onboarding"
);

fs.writeFileSync('src/components/auth/AuthModal.tsx', code);
console.log('AuthModal patched');
