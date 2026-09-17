const fs = require('fs');
const file = 'src/components/layout/InstitutionalLayout.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `      if (['dashboard', 'portfolio', 'asset-vault'].includes(id)) {`;
const replaceStr = `      if (['dashboard', 'asset-vault'].includes(id)) {`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log('Fixed navigate function');
} else {
  console.log('Target string not found');
}
