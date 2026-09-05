const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const authRoutes = `
// Supabase Institutional Auth Routes
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // In a real environment, you would use supabase.auth.signUp. 
  // Here we mock the behavior for the preview if keys are missing.
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    return res.json({ 
      user: { id: 'usr_' + Date.now(), email, firstName, lastName, role: 'CUSTOMER' },
      message: 'Mock account created (Add Supabase keys for real auth)'
    });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'CUSTOMER'
        }
      }
    });

    if (error) throw error;
    
    res.json({ user: data.user, message: 'Account created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
`;

if (!code.includes('/api/auth/signup')) {
  const insertionPoint = code.lastIndexOf('if (process.env.NODE_ENV !== "production") {');
  if (insertionPoint !== -1) {
    code = code.substring(0, insertionPoint) + authRoutes + '\n' + code.substring(insertionPoint);
    fs.writeFileSync('server.ts', code);
    console.log('server.ts patched with auth routes');
  }
}
