const fs = require('fs');
let code = fs.readFileSync('src/components/auth/AuthModal.tsx', 'utf8');

// Remove imports
code = code.replace("import { googleSignIn } from '../../services/firebase.ts';", "");
code = code.replace("import { GoogleSignInButton } from '../common/GoogleSignInButton.tsx';", "");

// Remove props
code = code.replace("onGoogleSignIn?: (email: string, displayName?: string) => Promise<void>;", "");

// Remove handleGoogleAuth
const funcStart = code.indexOf('const handleGoogleAuth = async () => {');
if (funcStart !== -1) {
  const funcEnd = code.indexOf('};', funcStart) + 2;
  code = code.substring(0, funcStart) + code.substring(funcEnd);
}

// Remove the button UI
const btnStart = code.indexOf('                <GoogleSignInButton');
if (btnStart !== -1) {
  const btnEnd = code.indexOf('/>', btnStart) + 2;
  code = code.substring(0, btnStart) + code.substring(btnEnd);
}

// Remove 'onGoogleSignIn,' from props destructuring
code = code.replace("onGoogleSignIn,", "");

fs.writeFileSync('src/components/auth/AuthModal.tsx', code);
console.log('AuthModal Google Sign in removed');
