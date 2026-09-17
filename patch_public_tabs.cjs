const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const publicTabs = ['home', 'markets', 'investment-plans', 'about', 'features', 'testimonials', 'coverage', 'risk-disclosure', 'terms', 'privacy', 'security', 'login', 'onboarding', 'open-account'];",
  "const publicTabs = ['home', 'markets', 'how-it-works', 'investment-plans', 'about', 'features', 'testimonials', 'coverage', 'risk-disclosure', 'terms', 'privacy', 'security', 'login', 'onboarding', 'open-account'];"
);

fs.writeFileSync('src/App.tsx', code);
