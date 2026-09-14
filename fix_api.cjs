const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf8');

const newMethods = `
  async adminGenerateBillingNote(userProfile: string, promptInstruction: string): Promise<{ note: string }> {
    return this.request<{ note: string }>('/admin/ai/generate-note', {
      method: 'POST',
      body: JSON.stringify({ userProfile, promptInstruction }),
    });
  }

  async adminSendNotification(userId: string, title: string, body: string, type: 'SYSTEM' | 'BILLING' | 'ALERT' = 'SYSTEM'): Promise<any> {
    return this.request<any>(\`/admin/users/\${userId}/notify\`, {
      method: 'POST',
      body: JSON.stringify({ title, body, type }),
    });
  }
`;

code = code.replace('  async adminSetCircuitBreaker(', newMethods + '\n  async adminSetCircuitBreaker(');
fs.writeFileSync('src/services/api.ts', code);
