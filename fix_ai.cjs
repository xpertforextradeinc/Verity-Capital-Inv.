const fs = require('fs');
let code = fs.readFileSync('server/ai.ts', 'utf8');
code += `
export async function generateAdminBillingNote(userProfile: string, promptInstruction: string): Promise<string> {
  const client = getAiClient();
  if (!client) {
    return \`Dear Client, please review your account status regarding: \${promptInstruction}.\\n\\nRegards,\\nVerity-Capital Inv Billing\`;
  }
  
  const prompt = \`You are an executive assistant for the admin of a premium institutional crypto broker (Verity-Capital Inv).
Draft a professional, authoritative, yet polite billing/account notification to a client.

Client Profile Context:
\${userProfile}

Admin's Instruction for the note:
\${promptInstruction}

Output only the exact message to be sent to the user. No preamble, no quotes, just the text. Use markdown if helpful.\`;

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text?.trim() || 'Failed to generate note.';
  } catch (err) {
    console.warn('[AI Note] Error generating billing note:', err);
    return 'Error generating billing note.';
  }
}
`;
fs.writeFileSync('server/ai.ts', code);
