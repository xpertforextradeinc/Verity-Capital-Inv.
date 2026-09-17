const fs = require('fs');
let code = fs.readFileSync('src/components/public/HowItWorks.tsx', 'utf8');

code = code.replace(
  "import OrbImage from '../../assets/bitcoin_orb.jpg';",
  "import OrbImage from '../../assets/images/bitcoin_orb_1788676652641.jpg';"
);
code = code.replace(
  "import IceImage from '../../assets/bitcoin_ice.jpg';",
  "import IceImage from '../../assets/images/bitcoin_ice_1788676669279.jpg';"
);
code = code.replace(
  "import NeonImage from '../../assets/bitcoin_neon.jpg';",
  "import NeonImage from '../../assets/images/bitcoin_neon_1788676683129.jpg';"
);

fs.writeFileSync('src/components/public/HowItWorks.tsx', code);
