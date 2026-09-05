import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Folder,
  FileText,
  Table,
  Image,
  FileCode,
  File,
  Download,
  ExternalLink,
  Trash2,
  Star,
  RefreshCw,
  Search,
  Upload,
  FolderPlus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  HardDrive,
  Grid,
  List,
  ChevronRight,
  MoreVertical,
  Clock,
  Sparkles,
  LogOut,
  Edit2
} from 'lucide-react';
import { DriveFile, DriveAboutInfo, Portfolio, Position, Order, AiInsight } from '../../types.ts';
import { googleDriveService } from '../../services/googleDrive.ts';
import {
  initGoogleAuth,
  googleSignIn,
  googleSignOut,
  getGoogleAccessToken,
  setGoogleAccessToken,
  auth
} from '../../services/firebase.ts';
import { GoogleSignInButton } from '../common/GoogleSignInButton.tsx';
import { DriveConfirmModal } from './DriveConfirmModal.tsx';

interface GoogleDriveViewProps {
  portfolio: Portfolio | null;
  positions: Position[];
  orders: Order[];
  insights: AiInsight[];
}

export const GoogleDriveView: React.FC<GoogleDriveViewProps> = ({
  portfolio,
  positions,
  orders,
  insights,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [aboutInfo, setAboutInfo] = useState<DriveAboutInfo | null>(null);

  // Explorer state
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Navigation & Filtering
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'My Drive' },
  ]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'quantix' | 'sheets' | 'docs' | 'folders' | 'starred' | 'trash'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Interactive modals
  const [isNewFolderOpen, setIsNewFolderOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Rename modal
  const [renameTarget, setRenameTarget] = useState<DriveFile | null>(null);
  const [newFileName, setNewFileName] = useState<string>('');

  // Confirmation dialog state (MANDATORY for mutating/destructive operations)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    itemName?: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => {},
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show auto-dismissing toast
  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Check auth state
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      async (user, token) => {
        setIsAuthenticated(true);
        loadDriveData();
      },
      () => {
        // If not authenticated with Google or no cached token
        setIsAuthenticated(false);
      }
    );

    // Initial token check
    getGoogleAccessToken().then((token) => {
      if (token) {
        setIsAuthenticated(true);
        loadDriveData();
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch files and about info
  const loadDriveData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [filesRes, aboutRes] = await Promise.all([
        googleDriveService.listFiles({
          folderId: currentFolderId,
          searchTerm,
          filterType,
        }),
        googleDriveService.getAbout().catch(() => null),
      ]);

      setFiles(filesRes.files || []);
      if (aboutRes) {
        setAboutInfo(aboutRes);
      }
    } catch (err: any) {
      console.error('Drive fetch error:', err);
      if (err.message && err.message.includes('sign in')) {
        setIsAuthenticated(false);
      } else {
        setErrorMessage(err.message || 'Failed to communicate with Google Drive');
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId, searchTerm, filterType]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDriveData();
    }
  }, [isAuthenticated, loadDriveData]);

  // Google Sign In handler
  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setIsAuthenticated(true);
        showToast(`Connected to Google Drive as ${res.user.email}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Google Sign Out handler
  const handleSignOut = async () => {
    await googleSignOut();
    setIsAuthenticated(false);
    setFiles([]);
    setAboutInfo(null);
    showToast('Disconnected from Google Drive.');
  };

  // Folder navigation
  const handleOpenFolder = (folder: DriveFile) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    const target = breadcrumbs[index];
    setCurrentFolderId(target.id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  // Create folder handler
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      setIsLoading(true);
      await googleDriveService.createFolder(newFolderName.trim(), currentFolderId || undefined);
      setNewFolderName('');
      setIsNewFolderOpen(false);
      showToast(`Created folder "${newFolderName.trim()}"`);
      await loadDriveData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create folder');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload file handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const fileToUpload = uploadedFiles[0];
    try {
      setIsLoading(true);
      await googleDriveService.uploadFile({
        name: fileToUpload.name,
        mimeType: fileToUpload.type || 'application/octet-stream',
        content: fileToUpload,
        parentId: currentFolderId || undefined,
      });
      showToast(`Uploaded "${fileToUpload.name}" to Google Drive`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadDriveData();
    } catch (err: any) {
      setErrorMessage(err.message || 'File upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Export Presets
  const handleExportPortfolio = async () => {
    try {
      setIsExporting('portfolio');
      const file = await googleDriveService.exportPortfolioSnapshot(portfolio, positions);
      showToast(`Saved "${file.name}" to "Quantix Exchange Reports" in Google Drive!`);
      await loadDriveData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to export portfolio to Drive');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportOrders = async () => {
    try {
      setIsExporting('orders');
      const file = await googleDriveService.exportOrdersLedger(orders);
      showToast(`Saved "${file.name}" to "Quantix Exchange Reports" in Google Drive!`);
      await loadDriveData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to export orders to Drive');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportInsights = async () => {
    try {
      setIsExporting('insights');
      const file = await googleDriveService.exportAiInsightsBrief(insights);
      showToast(`Saved "${file.name}" to "Quantix Exchange Reports" in Google Drive!`);
      await loadDriveData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to export AI insights to Drive');
    } finally {
      setIsExporting(null);
    }
  };

  // Rename handler
  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !newFileName.trim()) return;

    const targetId = renameTarget.id;
    const updatedName = newFileName.trim();

    try {
      setIsLoading(true);
      await googleDriveService.renameFile(targetId, updatedName);
      setRenameTarget(null);
      setNewFileName('');
      showToast(`Renamed to "${updatedName}"`);
      await loadDriveData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to rename file');
    } finally {
      setIsLoading(false);
    }
  };

  // Star toggle handler
  const handleToggleStar = async (file: DriveFile) => {
    try {
      await googleDriveService.toggleStar(file.id, !file.starred);
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, starred: !file.starred } : f))
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update star');
    }
  };

  // Trash or Delete with Mandatory Confirmation
  const promptMoveToTrash = (file: DriveFile) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Move File to Trash?',
      description: `Are you sure you want to move this file to Google Drive Trash? You can restore it later from your Drive Trash.`,
      itemName: file.name,
      confirmLabel: 'Move to Trash',
      isDestructive: true,
      onConfirm: async () => {
        try {
          setIsLoading(true);
          await googleDriveService.setTrashStatus(file.id, true);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          showToast(`Moved "${file.name}" to Trash`);
          await loadDriveData();
        } catch (err: any) {
          setErrorMessage(err.message || 'Failed to move file to trash');
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const promptPermanentDelete = (file: DriveFile) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Permanently Delete File?',
      description: `Warning: This will permanently delete this item from Google Drive. This action cannot be undone.`,
      itemName: file.name,
      confirmLabel: 'Permanently Delete',
      isDestructive: true,
      onConfirm: async () => {
        try {
          setIsLoading(true);
          await googleDriveService.deleteFilePermanently(file.id);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          showToast(`Permanently deleted "${file.name}"`);
          await loadDriveData();
        } catch (err: any) {
          setErrorMessage(err.message || 'Failed to permanently delete file');
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  // Helper to format file sizes
  const formatBytes = (bytesStr?: string) => {
    if (!bytesStr) return '—';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes) || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper to select icon
  const getFileIcon = (file: DriveFile) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-5 h-5 text-amber-400 fill-amber-400/20" />;
    }
    if (file.mimeType.includes('spreadsheet') || file.name.endsWith('.csv')) {
      return <Table className="w-5 h-5 text-emerald-400" />;
    }
    if (file.mimeType.includes('document') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      return <FileText className="w-5 h-5 text-cyan-400" />;
    }
    if (file.mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-rose-400" />;
    }
    if (file.mimeType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-purple-400" />;
    }
    return <File className="w-5 h-5 text-zinc-400" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Toast Banner */}
      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-emerald-200">
            ✕
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-700/50 text-rose-300 text-xs flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-[#0D121F] border border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-emerald-500 to-amber-500 p-0.5 shadow-lg shadow-blue-900/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#0B0F1A] rounded-[14px] flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Google Drive Workspace</h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase font-bold">
                OAuth v3 Active
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Sync simulated trading statements, portfolio valuations, and AI research briefs directly to your personal Google Drive with end-user permission.
            </p>
          </div>
        </div>

        {/* Auth / Account Controls */}
        <div>
          {isAuthenticated ? (
            <div className="flex items-center space-x-3 bg-zinc-900/90 border border-zinc-800 rounded-xl p-2 px-3">
              {aboutInfo?.user?.photoLink ? (
                <img
                  src={aboutInfo.user.photoLink}
                  alt={aboutInfo.user.displayName || 'Google User'}
                  className="w-8 h-8 rounded-full border border-emerald-500/40"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                  {aboutInfo?.user?.displayName?.[0] || 'G'}
                </div>
              )}
              <div className="text-left">
                <div className="text-xs font-semibold text-white leading-tight">
                  {aboutInfo?.user?.displayName || 'Google Connected'}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  {aboutInfo?.user?.emailAddress || 'drive.google.com'}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                title="Disconnect Google Account"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/80 transition-colors ml-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <GoogleSignInButton
              onClick={handleSignIn}
              isLoading={isSigningIn}
              text="Connect Google Drive"
            />
          )}
        </div>
      </div>

      {/* If Not Authenticated: Prompt Card */}
      {!isAuthenticated ? (
        <div className="p-8 rounded-2xl bg-[#0B0F1A] border border-zinc-800 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
            <HardDrive className="w-8 h-8 text-blue-400" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-white">Connect Your Google Drive Account</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Authenticate with Google to enable seamless paper-trading exports, encrypted portfolio backups, and real-time report storage in your own cloud drive with permission.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-[11px]">
                <Table className="w-3.5 h-3.5" />
                <span>CSV Statements</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Export real-time portfolio holdings and historical order execution logs.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Insights Sync</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Archive Gemini market analysis summaries directly into organized folders.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-amber-400 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secure OAuth</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Strict permission boundary. Tokens cached in-memory only.
              </p>
            </div>
          </div>

          <div className="pt-3">
            <GoogleSignInButton
              onClick={handleSignIn}
              isLoading={isSigningIn}
              text="Sign in with Google"
            />
          </div>
        </div>
      ) : (
        <>
          {/* Quick 1-Click Export Presets Toolbar */}
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quantix Instant Cloud Export to Google Drive</span>
              </span>
              <span className="text-[11px] text-zinc-500">Auto-saves to /Quantix Exchange Reports</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleExportPortfolio}
                disabled={isExporting !== null}
                className="p-3 rounded-xl bg-[#0F1422] hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-left transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white group-hover:text-emerald-300">
                    Export Portfolio Statement
                  </span>
                  <Table className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-zinc-400">
                  Valuations, equity (${portfolio?.totalEquity?.toLocaleString() || '100,000'}), holdings CSV.
                </p>
                {isExporting === 'portfolio' && (
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Uploading to Drive...</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleExportOrders}
                disabled={isExporting !== null}
                className="p-3 rounded-xl bg-[#0F1422] hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/40 text-left transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white group-hover:text-cyan-300">
                    Export Order History
                  </span>
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-[11px] text-zinc-400">
                  Execution prices, timestamps, limit & market records ({orders.length} orders).
                </p>
                {isExporting === 'orders' && (
                  <span className="text-[10px] text-cyan-400 font-mono mt-1 block">Uploading to Drive...</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleExportInsights}
                disabled={isExporting !== null}
                className="p-3 rounded-xl bg-[#0F1422] hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/40 text-left transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white group-hover:text-indigo-300">
                    Export AI Research Brief
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <p className="text-[11px] text-zinc-400">
                  Gemini synthesized market insights and risk scores ({insights.length} reports).
                </p>
                {isExporting === 'insights' && (
                  <span className="text-[10px] text-indigo-400 font-mono mt-1 block">Uploading to Drive...</span>
                )}
              </button>
            </div>
          </div>

          {/* Drive Explorer Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
            {/* Breadcrumbs Navigation */}
            <div className="flex items-center space-x-1 text-xs overflow-x-auto py-1">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.id || 'root'}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />}
                  <button
                    onClick={() => handleNavigateBreadcrumb(idx)}
                    className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      idx === breadcrumbs.length - 1
                        ? 'bg-zinc-800 text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Action Buttons: New Folder, Upload File, Refresh */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsNewFolderOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>New Folder</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload File</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={loadDriveData}
                disabled={isLoading}
                title="Refresh Drive files"
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              </button>

              <div className="border-l border-zinc-800 pl-2 flex items-center space-x-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D121F] p-3 rounded-2xl border border-zinc-800/80">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Google Drive..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto text-xs">
              {(
                [
                  { key: 'all', label: 'All Files' },
                  { key: 'quantix', label: 'Quantix Reports' },
                  { key: 'sheets', label: 'Spreadsheets' },
                  { key: 'docs', label: 'Documents' },
                  { key: 'folders', label: 'Folders' },
                  { key: 'starred', label: 'Starred' },
                  { key: 'trash', label: 'Trash' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterType(tab.key)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    filterType === tab.key
                      ? 'bg-zinc-800 text-emerald-400 font-semibold border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* New Folder Modal Dialog */}
          {isNewFolderOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <div className="bg-[#0E131F] border border-zinc-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
                  <FolderPlus className="w-5 h-5" />
                  <span>Create New Folder</span>
                </div>
                <form onSubmit={handleCreateFolder} className="space-y-4">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name (e.g. Portfolio Backups)"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsNewFolderOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newFolderName.trim() || isLoading}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Rename File Modal Dialog */}
          {renameTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <div className="bg-[#0E131F] border border-zinc-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
                  <Edit2 className="w-5 h-5" />
                  <span>Rename File</span>
                </div>
                <form onSubmit={handleRenameSubmit} className="space-y-4">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRenameTarget(null);
                        setNewFileName('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newFileName.trim() || isLoading}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Files List / Grid */}
          {isLoading && files.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Syncing with Google Drive...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-800 space-y-3">
              <Folder className="w-10 h-10 text-zinc-600 mx-auto" />
              <div className="text-sm font-semibold text-zinc-300">No files found</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {filterType !== 'all'
                  ? `No items match the "${filterType}" filter.`
                  : searchTerm
                  ? `No files matching "${searchTerm}".`
                  : 'This folder is empty. Use the buttons above to save your first Quantix report or upload files!'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {files.map((file) => {
                const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                return (
                  <div
                    key={file.id}
                    className="p-4 rounded-2xl bg-[#0D121F] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between mb-3">
                        <div
                          onClick={() => (isFolder ? handleOpenFolder(file) : undefined)}
                          className={`p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 ${
                            isFolder ? 'cursor-pointer hover:bg-zinc-800' : ''
                          }`}
                        >
                          {getFileIcon(file)}
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleToggleStar(file)}
                            title={file.starred ? 'Starred' : 'Star file'}
                            className={`p-1 rounded-lg transition-colors ${
                              file.starred ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${file.starred ? 'fill-amber-400' : ''}`} />
                          </button>

                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open in Google Drive"
                              className="p-1 rounded-lg text-zinc-500 hover:text-emerald-400 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* File Name */}
                      <div
                        onClick={() => (isFolder ? handleOpenFolder(file) : undefined)}
                        className={`text-xs font-semibold text-white truncate mb-1 ${
                          isFolder ? 'cursor-pointer hover:text-emerald-400' : ''
                        }`}
                        title={file.name}
                      >
                        {file.name}
                      </div>

                      {/* File Metadata */}
                      <div className="text-[11px] text-zinc-500 flex items-center space-x-2">
                        <span>{isFolder ? 'Folder' : formatBytes(file.size)}</span>
                        <span>•</span>
                        <span>
                          {file.modifiedTime
                            ? new Date(file.modifiedTime).toLocaleDateString()
                            : 'Recently'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setRenameTarget(file);
                            setNewFileName(file.name);
                          }}
                          title="Rename file"
                          className="p-1 rounded text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {file.trashed ? (
                          <button
                            onClick={() => promptPermanentDelete(file)}
                            title="Delete Permanently"
                            className="p-1 rounded text-rose-500 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => promptMoveToTrash(file)}
                            title="Move to Trash"
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {isFolder ? (
                        <button
                          onClick={() => handleOpenFolder(file)}
                          className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-0.5 cursor-pointer font-medium"
                        >
                          <span>Open</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ) : (
                        file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-0.5"
                          >
                            <span>View</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-[#0D121F] rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 border-b border-zinc-800 text-[11px] text-zinc-400 uppercase tracking-wider font-mono">
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Modified</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-sans">
                    {files.map((file) => {
                      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                      return (
                        <tr key={file.id} className="hover:bg-zinc-900/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2.5">
                              <div className="shrink-0">{getFileIcon(file)}</div>
                              <div
                                onClick={() => (isFolder ? handleOpenFolder(file) : undefined)}
                                className={`font-medium text-white truncate max-w-xs ${
                                  isFolder ? 'cursor-pointer hover:text-emerald-400' : ''
                                }`}
                                title={file.name}
                              >
                                {file.name}
                              </div>
                              {file.starred && (
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-zinc-400 text-[11px]">
                            {isFolder ? 'Folder' : file.mimeType.split('/').pop()}
                          </td>
                          <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                            {isFolder ? '—' : formatBytes(file.size)}
                          </td>
                          <td className="py-3 px-4 text-zinc-400 text-[11px]">
                            {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-zinc-400 hover:text-emerald-400 p-1"
                                  title="Open in Drive"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  setRenameTarget(file);
                                  setNewFileName(file.name);
                                }}
                                className="text-zinc-400 hover:text-zinc-200 p-1"
                                title="Rename"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {file.trashed ? (
                                <button
                                  onClick={() => promptPermanentDelete(file)}
                                  className="text-rose-500 hover:text-rose-400 p-1"
                                  title="Delete Permanently"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => promptMoveToTrash(file)}
                                  className="text-zinc-500 hover:text-rose-400 p-1"
                                  title="Move to Trash"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog Component (MANDATORY per SKILL.md for mutating/destructive actions) */}
      <DriveConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        itemName={confirmDialog.itemName}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={confirmDialog.isDestructive}
        isLoading={isLoading}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
