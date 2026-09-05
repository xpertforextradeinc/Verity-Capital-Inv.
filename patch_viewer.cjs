const fs = require('fs');
let code = fs.readFileSync('src/components/media/MediaVaultView.tsx', 'utf8');

const oldModelViewer = `{asset.type === '3d-model' && (
                  <div className="text-indigo-500 flex flex-col items-center justify-center w-full h-full bg-zinc-950 border border-indigo-500/20">
                    <Box className="w-10 h-10 mb-2 opacity-80" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">3D GLB Model Viewer</span>
                  </div>
                )}`;

const newModelViewer = `{asset.type === '3d-model' && (
                  <div className="w-full h-full bg-zinc-950/80">
                    {/* @ts-ignore */}
                    <model-viewer
                      src={asset.url}
                      auto-rotate
                      camera-controls
                      style={{ width: '100%', height: '100%' }}
                      class="w-full h-full outline-none"
                    >
                    </model-viewer>
                  </div>
                )}`;

if (code.includes('3D GLB Model Viewer')) {
  code = code.replace(oldModelViewer, newModelViewer);
  fs.writeFileSync('src/components/media/MediaVaultView.tsx', code);
  console.log('MediaVaultView updated with real model-viewer');
}
