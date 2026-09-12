const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminSupervisorView.tsx', 'utf8');
code = code.replace(/                isUpgraded: Boolean\(u\.isUpgraded\),\n                firstName: u\.firstName,\n                lastName: u\.lastName,\n                dateOfBirth: u\.dateOfBirth,/g, '                isUpgraded: Boolean(u.isUpgraded),');
fs.writeFileSync('src/components/admin/AdminSupervisorView.tsx', code);
