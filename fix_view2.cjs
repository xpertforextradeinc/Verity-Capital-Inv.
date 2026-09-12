const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminSupervisorView.tsx', 'utf8');
code = code.replace(/                \.\.\.loadedUsers\[existingIndex\],/, '                ...loadedUsers[existingIndex],\n                firstName: u.firstName,\n                lastName: u.lastName,\n                dateOfBirth: u.dateOfBirth,');
fs.writeFileSync('src/components/admin/AdminSupervisorView.tsx', code);
