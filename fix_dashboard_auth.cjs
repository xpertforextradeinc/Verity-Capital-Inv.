const fs = require('fs');
const file = 'src/components/customer/DashboardView.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `          <button
            onClick={async () => {
              try {
                await api.login('client@verity-capital.com', 'demo-bypass');
                window.location.reload();
              } catch (err) {
                console.error(err);
              }
            }}
            className="w-full py-2.5 px-4 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium rounded-xl border border-zinc-800 transition-colors cursor-pointer"
          >
            Explore with Demo Account
          </button>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, "");
  fs.writeFileSync(file, code);
  console.log('Fixed DashboardView');
} else {
  console.log('Target string not found in DashboardView');
}
