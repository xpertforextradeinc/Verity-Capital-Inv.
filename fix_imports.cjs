const fs = require('fs');
const file = 'src/components/customer/PortfolioView.tsx';
let code = fs.readFileSync(file, 'utf8');

const importRegex = /import\s+\{([^}]+)\}\s+from\s+'lucide-react';/;
const match = code.match(importRegex);
if (match) {
    const inner = match[1];
    if (!inner.includes('Globe')) {
    const newInner = inner + ',\n  PieChart,\n  Globe,\n  BarChart4,\n  CheckCircle2';
    code = code.replace(match[0], `import {${newInner}} from 'lucide-react';`);
    fs.writeFileSync(file, code);
    console.log('Fixed imports using regex');
    } else {
    console.log('Imports already include Globe');
    }
} else {
    console.log('No lucide-react import found');
}
