const fs = require('fs');
const file = 'src/components/customer/PortfolioView.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `      </div>
    );
  }}

  const totalEquity = portfolio?.totalEquity || 100000;`;

const replaceStr = `      </div>
    );
  }

  const totalEquity = portfolio?.totalEquity || 100000;`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log('Fixed syntax error in PortfolioView');
} else {
  console.log('Target string not found in PortfolioView');
}
