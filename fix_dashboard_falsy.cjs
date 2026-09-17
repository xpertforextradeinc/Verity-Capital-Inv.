const fs = require('fs');
const file = 'src/components/customer/DashboardView.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/portfolio\?\.totalEquity \|\| 105898\.38/g, 'portfolio?.totalEquity ?? 0.00');
code = code.replace(/portfolio\?\.simulatedCashBalance \|\| 65000\.00/g, 'portfolio?.simulatedCashBalance ?? 0.00');
code = code.replace(/portfolio\?\.investedBalance \|\| 40898\.38/g, 'portfolio?.investedBalance ?? 0.00');
code = code.replace(/portfolio\?\.unrealizedPnl \|\| 11435\.63/g, 'portfolio?.unrealizedPnl ?? 0.00');
code = code.replace(/portfolio\?\.unrealizedPnlPercent \|\| 21\.37/g, 'portfolio?.unrealizedPnlPercent ?? 0.00');

fs.writeFileSync(file, code);
