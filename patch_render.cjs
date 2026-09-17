const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `    if (currentTab === 'investment-plans') {
      return <InvestmentPlans onOpenAuth={(mode) => setPublicRoute(mode === 'login' ? 'login' : 'onboarding')} />;
    }`;

const replaceStr = `    if (currentTab === 'investment-plans') {
      return <InvestmentPlans onOpenAuth={(mode) => setPublicRoute(mode === 'login' ? 'login' : 'onboarding')} />;
    }

    if (currentTab === 'how-it-works') {
      return (
        <HowItWorks 
          onOpenAuth={(mode) => setPublicRoute(mode === 'login' ? 'login' : 'onboarding')}
          onBack={() => setPublicRoute('home')}
        />
      );
    }`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/App.tsx', code);
