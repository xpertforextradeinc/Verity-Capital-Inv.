const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { LandingPage } from './components/public/LandingPage.tsx';",
  "import { LandingPage } from './components/public/LandingPage.tsx';\nimport { HowItWorks } from './components/public/HowItWorks.tsx';"
);

fs.writeFileSync('src/App.tsx', code);
