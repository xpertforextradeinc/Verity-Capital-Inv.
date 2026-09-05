const fs = require('fs');
let code = fs.readFileSync('src/components/common/Header.tsx', 'utf8');

code = code.replace(
  "onSelectTab('google-drive')",
  "onSelectTab('media-vault')"
);
code = code.replace(
  "onSelectTab('google-drive')",
  "onSelectTab('media-vault')"
);
code = code.replace(
  "setCurrentTab('google-drive')",
  "setCurrentTab('media-vault')"
);
code = code.replace(
  ">Google Drive Sync<",
  ">3D Asset Vault<"
);
code = code.replace(
  "HardDrive",
  "Box"
);
code = code.replace(
  ">Google Drive Workspace<",
  ">3D Asset Vault<"
);

fs.writeFileSync('src/components/common/Header.tsx', code);
console.log('Header.tsx updated');
