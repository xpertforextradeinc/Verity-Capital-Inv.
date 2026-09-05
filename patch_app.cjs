const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace AuthenticatedLayout with InstitutionalLayout
code = code.replace(
  "import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout.tsx';",
  "import { InstitutionalLayout } from './components/layout/InstitutionalLayout.tsx';"
);

// Replace the rendered AuthenticatedLayout block
const authLayoutStart = code.indexOf('<AuthenticatedLayout');
const authLayoutEnd = code.indexOf('</AuthenticatedLayout>') + '</AuthenticatedLayout>'.length;

if (authLayoutStart !== -1) {
  const newAuthLayout = `
        <InstitutionalLayout
          user={user as User}
          portfolio={portfolio}
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onLogout={handleLogout}
        >
          {renderContent()}
        </InstitutionalLayout>
  `;
  code = code.substring(0, authLayoutStart) + newAuthLayout + code.substring(authLayoutEnd);
}

// Remove "PAPER TRADING MVP" and "Simulated" from the footer and loading state
code = code.replace('Loading Verity-Capital Inv Simulated Engine...', 'Initializing Verity-Capital Institutional Engine...');
code = code.replace('PAPER TRADING MVP', 'INSTITUTIONAL');
code = code.replace('FOR EDUCATIONAL SIMULATION AND PAPER-TRADING DEMONSTRATION PURPOSES ONLY. This platform does not execute live securities transactions, hold real customer funds, or operate as a licensed broker-dealer or investment adviser under FINRA, SEC, or CFTC jurisdiction.', 'Institutional Brokerage Platform. Secure execution and custody services.');

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for Institutional Layout');
