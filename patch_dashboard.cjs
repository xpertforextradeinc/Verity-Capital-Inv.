const fs = require('fs');
const file = 'src/components/customer/DashboardView.tsx';
let code = fs.readFileSync(file, 'utf8');

const replacement = `            Sign In with Credentials
          </button>
          <div className="pt-4 mt-4 border-t border-zinc-800 text-center">
            <span className="text-zinc-500 text-sm">Don't have an account? </span>
            <button
              onClick={() => onOpenAuth?.('onboarding')}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-bold ml-1"
            >
              Open an Account
            </button>
          </div>
          <button
            onClick={async () => {`;

code = code.replace(/            Sign In with Credentials\s*<\/button>\s*<button\s*onClick=\{async \(\) => \{/, replacement);
fs.writeFileSync(file, code);
