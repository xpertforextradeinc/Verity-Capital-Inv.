const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogic = `        let currentUser = await api.getCurrentUser();
        if (!currentUser) {
          try {
            const demoRes = await api.switchDemo('CUSTOMER');
            currentUser = demoRes.user;
          } catch {
            currentUser = clientStorageEngine.getDemoUser();
            clientStorageEngine.setCurrentUser(currentUser);
          }
        }
        setUser(currentUser);`;

const newLogic = `        let currentUser = await api.getCurrentUser();
        setUser(currentUser);`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/App.tsx', code);
