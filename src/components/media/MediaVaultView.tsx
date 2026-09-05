import React, { useState, useEffect } from 'react';
import { Upload, Box, Image as ImageIcon, Video, Link as LinkIcon, Trash2, ExternalLink, HardDrive, Cloud } from 'lucide-react';
import { api } from '../../services/api.ts';

interface Asset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | '3d-model';
  source: 'local' | 'supabase';
  createdAt: string;
}

export const MediaVaultView: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'local' | 'supabase'>('local');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseName, setSupabaseName] = useState('');

  useEffect(() => {
    fetchAssets();
  }, [activeTab]);

  const fetchAssets = async () => {
    try {
      const res = await fetch(`/api/v1/assets/3d?source=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (err) {
      console.error('Failed to fetch assets', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source', 'local');

    try {
      const res = await fetch('/api/v1/assets/3d/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer user_usr_admin_verity_capital_inv` // Mock auth for MVP
        }
      });
      if (res.ok) {
        await fetchAssets();
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSupabaseUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl || !supabaseName) return;

    try {
      const res = await fetch('/api/v1/assets/3d/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer user_usr_admin_verity_capital_inv`
        },
        body: JSON.stringify({
          name: supabaseName,
          url: supabaseUrl,
          source: 'supabase'
        })
      });
      if (res.ok) {
        setSupabaseUrl('');
        setSupabaseName('');
        await fetchAssets();
      }
    } catch (err) {
      console.error('Failed to add Supabase URL', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/v1/assets/3d/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer user_usr_admin_verity_capital_inv`
        }
      });
      setAssets(assets.filter(a => a.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const getIcon = (type: string) => {
    if (type === 'video') return <Video className="w-5 h-5" />;
    if (type === '3d-model') return <Box className="w-5 h-5" />;
    return <ImageIcon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Box className="w-7 h-7 text-indigo-400" />
            <span>Institutional 3D Asset Vault</span>
          </h1>
          <p className="text-zinc-400 mt-1">Manage and embed 3D charts, animations, and high-fidelity institutional media.</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('local')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'local' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Local Storage (/public/assets/3d)</span>
        </button>
        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'supabase' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Supabase Storage (Public URLs)</span>
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        {activeTab === 'local' ? (
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-zinc-700 border-dashed rounded-xl cursor-pointer bg-zinc-900/50 hover:bg-zinc-800/80 hover:border-indigo-500 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-zinc-500 mb-3" />
                <p className="mb-2 text-sm text-zinc-400">
                  <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-zinc-500">GLB, MP4, WEBM, PNG, JPG (Max 50MB)</p>
              </div>
              <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*,.glb,.gltf" disabled={isUploading} />
            </label>
          </div>
        ) : (
          <form onSubmit={handleAddSupabaseUrl} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Asset Name</label>
              <input
                type="text"
                required
                value={supabaseName}
                onChange={(e) => setSupabaseName(e.target.value)}
                placeholder="e.g. BTC 3D Rotating Chart"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex-1 w-full space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Supabase Public URL</label>
              <input
                type="url"
                required
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://[project_id].supabase.co/storage/v1/object/public/..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Link Asset</span>
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {assets.length === 0 ? (
          <div className="col-span-full py-16 text-center text-zinc-500">
            <Box className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No 3D assets found in {activeTab === 'local' ? 'local storage' : 'Supabase storage'}.</p>
          </div>
        ) : (
          assets.map((asset) => (
            <div key={asset.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group">
              <div className="aspect-video bg-zinc-950 relative flex items-center justify-center overflow-hidden">
                {asset.type === 'image' && (
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                )}
                {asset.type === 'video' && (
                  <video src={asset.url} controls className="w-full h-full object-cover" />
                )}
                {asset.type === '3d-model' && (
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
                )}
                <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-zinc-900/80 backdrop-blur rounded hover:bg-emerald-500 text-zinc-400 hover:text-zinc-950 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-1.5 bg-zinc-900/80 backdrop-blur rounded hover:bg-rose-500 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-2 text-zinc-300 font-medium truncate">
                  <span className="text-indigo-400">{getIcon(asset.type)}</span>
                  <span className="truncate">{asset.name}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span className="uppercase">{asset.type}</span>
                  <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
