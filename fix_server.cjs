const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newRoutes = `
// Admin: Generate AI Billing Note
app.post('/api/v1/admin/ai/generate-note', requireAdmin, async (req: Request, res: Response) => {
  const { userProfile, promptInstruction } = req.body;
  if (!userProfile || !promptInstruction) {
    return res.status(400).json({ error: 'userProfile and promptInstruction are required' });
  }
  const note = await generateAdminBillingNote(userProfile, promptInstruction);
  res.json({ note });
});

// Admin: Send Notification to User
app.post('/api/v1/admin/users/:userId/notify', requireAdmin, (req: Request, res: Response) => {
  const { title, body, type } = req.body;
  const targetId = req.params.userId;
  const list = db.notifications.get(targetId) || [];
  
  const newNotif = {
    id: \`notif_\${Date.now()}\`,
    userId: targetId,
    type: type || 'SYSTEM',
    title: title || 'Admin Message',
    body,
    createdAt: new Date().toISOString()
  };
  
  list.unshift(newNotif as any);
  db.notifications.set(targetId, list);
  
  res.json({ success: true, notification: newNotif });
});
`;

code = code.replace('// ----------------------------------------------------\n// VITE MIDDLEWARE & STATIC SERVING', newRoutes + '\n// ----------------------------------------------------\n// VITE MIDDLEWARE & STATIC SERVING');

fs.writeFileSync('server.ts', code);
