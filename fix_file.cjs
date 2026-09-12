const fs = require('fs');
let code = fs.readFileSync('src/components/admin/UserTable.tsx', 'utf8');
code = code.replace(/    <div className="space-y-3">\n          <div\n            key={user.id}/, '          <div\n            key={user.id}');
code = code.replace(/    <div className="space-y-3">\n              <tr key={user.id}/, '              <tr key={user.id}');
fs.writeFileSync('src/components/admin/UserTable.tsx', code);
