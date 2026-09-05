const fs = require('fs');
let code = fs.readFileSync('src/services/firebase.ts', 'utf8');

code = code.replace("googleProvider.addScope('https://www.googleapis.com/auth/drive');", "");
code = code.replace("googleProvider.addScope('https://www.googleapis.com/auth/drive.file');", "");
code = code.replace("googleProvider.addScope('https://www.googleapis.com/auth/drive.readonly');", "");
code = code.replace("googleProvider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');", "");
code = code.replace("googleProvider.addScope('https://www.googleapis.com/auth/drive.activity.readonly');", "");
code = code.replace("googleProvider.addScope('https://www.googleapis.com/auth/drive.appdata');", "");
code = code.replace("// Google Drive Workspace scopes", "");

fs.writeFileSync('src/services/firebase.ts', code);
console.log('Firebase auth scopes updated');
