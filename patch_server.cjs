const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Ensure multer and fs are imported
if (!code.includes('import multer from')) {
  code = code.replace("import path from 'path';", "import path from 'path';\nimport multer from 'multer';\nimport fs from 'fs';");
}

// Add our fake db for assets if not exists
if (!code.includes('let assetsDB = [')) {
  const assetsBlock = `
let assetsDB = [
  {
    id: 'ast_1',
    name: 'Bitcoin 3D Token',
    url: '/assets/3d/bitcoin-3d.glb',
    type: '3d-model',
    source: 'local',
    createdAt: new Date().toISOString()
  }
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(process.cwd(), 'public', 'assets', '3d');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Asset Routes
app.get('/api/v1/assets/3d', requireAuth, (req, res) => {
  const source = req.query.source;
  const filtered = assetsDB.filter(a => !source || a.source === source);
  res.json({ assets: filtered });
});

app.post('/api/v1/assets/3d/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  let type = 'image';
  if (req.file.mimetype.startsWith('video/')) type = 'video';
  if (req.file.originalname.endsWith('.glb') || req.file.originalname.endsWith('.gltf')) type = '3d-model';
  
  const asset = {
    id: 'ast_' + Date.now(),
    name: req.file.originalname,
    url: '/assets/3d/' + req.file.filename,
    type,
    source: 'local',
    createdAt: new Date().toISOString()
  };
  assetsDB.push(asset);
  res.json({ asset });
});

app.post('/api/v1/assets/3d/link', requireAuth, (req, res) => {
  const { name, url, source } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'Name and URL required' });
  
  let type = 'image';
  if (url.match(/\\.(mp4|webm|mov)$/i)) type = 'video';
  if (url.match(/\\.(glb|gltf)$/i)) type = '3d-model';
  
  const asset = {
    id: 'ast_' + Date.now(),
    name,
    url,
    type,
    source: source || 'supabase',
    createdAt: new Date().toISOString()
  };
  assetsDB.push(asset);
  res.json({ asset });
});

app.delete('/api/v1/assets/3d/:id', requireAuth, (req, res) => {
  const index = assetsDB.findIndex(a => a.id === req.params.id);
  if (index !== -1) {
    // Optionally delete from filesystem if local
    const asset = assetsDB[index];
    if (asset.source === 'local') {
      try {
        fs.unlinkSync(path.join(process.cwd(), 'public', asset.url));
      } catch (e) {
        console.error('Failed to delete file', e);
      }
    }
    assetsDB.splice(index, 1);
  }
  res.json({ success: true });
});
`;

  // Insert before the last catch-all route `app.get('*'` or before `app.listen`
  const insertionPoint = code.lastIndexOf('if (process.env.NODE_ENV !== "production") {');
  if (insertionPoint !== -1) {
    code = code.substring(0, insertionPoint) + assetsBlock + '\n' + code.substring(insertionPoint);
  }
}

fs.writeFileSync('server.ts', code);
console.log('server.ts updated');
