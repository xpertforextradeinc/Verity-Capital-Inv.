import { DriveFile, DriveAboutInfo, Portfolio, Position, Order, AiInsight } from '../types.ts';
import { getGoogleAccessToken } from './firebase.ts';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';

export class GoogleDriveService {
  /**
   * Helper to ensure access token exists
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await getGoogleAccessToken();
    if (!token) {
      throw new Error('Please sign in with Google to access Google Drive.');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Fetch current user's Drive account details and storage quota
   */
  async getAbout(): Promise<DriveAboutInfo> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${DRIVE_API_URL}/about?fields=user,storageQuota`, {
      headers,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch Drive information (${response.status})`);
    }

    return response.json();
  }

  /**
   * List files from Drive
   */
  async listFiles(options: {
    folderId?: string | null;
    searchTerm?: string;
    filterType?: 'all' | 'quantix' | 'sheets' | 'docs' | 'folders' | 'starred' | 'trash';
    pageToken?: string;
    pageSize?: number;
  } = {}): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
    const headers = await this.getAuthHeaders();

    const queryClauses: string[] = [];

    if (options.filterType === 'trash') {
      queryClauses.push('trashed = true');
    } else {
      queryClauses.push('trashed = false');
    }

    if (options.folderId) {
      queryClauses.push(`'${options.folderId}' in parents`);
    }

    if (options.filterType === 'starred') {
      queryClauses.push('starred = true');
    } else if (options.filterType === 'folders') {
      queryClauses.push("mimeType = 'application/vnd.google-apps.folder'");
    } else if (options.filterType === 'sheets') {
      queryClauses.push("(mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'text/csv')");
    } else if (options.filterType === 'docs') {
      queryClauses.push("(mimeType = 'application/vnd.google-apps.document' or mimeType = 'text/plain' or mimeType = 'application/pdf')");
    } else if (options.filterType === 'quantix') {
      queryClauses.push("(name contains 'Quantix' or description contains 'Quantix' or properties has { key='app' and value='quantix' })");
    }

    if (options.searchTerm && options.searchTerm.trim()) {
      const escapedTerm = options.searchTerm.trim().replace(/'/g, "\\'");
      queryClauses.push(`(name contains '${escapedTerm}' or fullText contains '${escapedTerm}')`);
    }

    const q = queryClauses.join(' and ');
    const params = new URLSearchParams({
      q,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime, webViewLink, webContentLink, iconLink, thumbnailLink, parents, owners, starred, trashed)',
      orderBy: 'folder,modifiedTime desc',
      pageSize: String(options.pageSize || 30),
    });

    if (options.pageToken) {
      params.append('pageToken', options.pageToken);
    }

    const response = await fetch(`${DRIVE_API_URL}/files?${params.toString()}`, {
      headers,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to list files (${response.status})`);
    }

    return response.json();
  }

  /**
   * Create a folder in Google Drive
   */
  async createFolder(name: string, parentId?: string): Promise<DriveFile> {
    const headers = await this.getAuthHeaders();
    const metadata: Record<string, any> = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      properties: { app: 'quantix' },
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    const response = await fetch(`${DRIVE_API_URL}/files?fields=id,name,mimeType,createdTime,modifiedTime,webViewLink,parents`, {
      method: 'POST',
      headers,
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to create folder (${response.status})`);
    }

    return response.json();
  }

  /**
   * Find or create the default "Quantix Exchange Reports" folder
   */
  async getOrCreateQuantixFolder(): Promise<string> {
    const headers = await this.getAuthHeaders();
    const searchParams = new URLSearchParams({
      q: "name = 'Quantix Exchange Reports' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id, name)',
    });

    const response = await fetch(`${DRIVE_API_URL}/files?${searchParams.toString()}`, { headers });
    if (response.ok) {
      const data = await response.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Create folder if not found
    const newFolder = await this.createFolder('Quantix Exchange Reports');
    return newFolder.id;
  }

  /**
   * Upload file with content (multipart/related)
   */
  async uploadFile(options: {
    name: string;
    mimeType: string;
    content: string | Blob;
    parentId?: string;
    description?: string;
  }): Promise<DriveFile> {
    const token = await getGoogleAccessToken();
    if (!token) {
      throw new Error('Please sign in with Google to upload to Google Drive.');
    }

    const metadata: Record<string, any> = {
      name: options.name,
      mimeType: options.mimeType,
      description: options.description || 'Generated by Quantix Exchange Simulator',
      properties: { app: 'quantix' },
    };

    if (options.parentId) {
      metadata.parents = [options.parentId];
    }

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const contentText = typeof options.content === 'string'
      ? options.content
      : await options.content.text();

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${options.mimeType}\r\n\r\n` +
      contentText +
      closeDelimiter;

    const response = await fetch(
      `${DRIVE_UPLOAD_URL}/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,createdTime,webViewLink,webContentLink,parents,starred`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Upload failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Move file to Trash or restore from Trash
   */
  async setTrashStatus(fileId: string, trashed: boolean): Promise<DriveFile> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${DRIVE_API_URL}/files/${fileId}?fields=id,name,trashed`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ trashed }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to update trash status (${response.status})`);
    }

    return response.json();
  }

  /**
   * Permanently delete a file or folder from Google Drive
   */
  async deleteFilePermanently(fileId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${DRIVE_API_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok && response.status !== 204) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to permanently delete file (${response.status})`);
    }
  }

  /**
   * Rename a file or folder
   */
  async renameFile(fileId: string, newName: string): Promise<DriveFile> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${DRIVE_API_URL}/files/${fileId}?fields=id,name,modifiedTime`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ name: newName }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to rename file (${response.status})`);
    }

    return response.json();
  }

  /**
   * Toggle star status
   */
  async toggleStar(fileId: string, starred: boolean): Promise<DriveFile> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${DRIVE_API_URL}/files/${fileId}?fields=id,name,starred`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ starred }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to star file (${response.status})`);
    }

    return response.json();
  }

  /**
   * Export Current Portfolio Snapshot to Google Drive as CSV
   */
  async exportPortfolioSnapshot(portfolio: Portfolio | null, positions: Position[]): Promise<DriveFile> {
    const folderId = await this.getOrCreateQuantixFolder();
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `Quantix_Portfolio_Statement_${dateStr}.csv`;

    const csvRows: string[] = [
      '# QUANTIX EXCHANGE SIMULATED PORTFOLIO STATEMENT',
      `# Generated At: ${now.toISOString()}`,
      `# Disclaimer: Educational paper-trading demonstration only. No real funds.`,
      '',
      '--- PORTFOLIO SUMMARY ---',
      `Total Equity (USD),Simulated Cash Balance (USD),Invested Balance (USD),Unrealized P&L (USD),Unrealized P&L (%),Day P&L (USD)`,
      `${portfolio?.totalEquity ?? 0},${portfolio?.simulatedCashBalance ?? 0},${portfolio?.investedBalance ?? 0},${portfolio?.unrealizedPnl ?? 0},${portfolio?.unrealizedPnlPercent ?? 0}%,${portfolio?.dayPnl ?? 0}`,
      '',
      '--- ACTIVE POSITIONS ---',
      'Symbol,Name,Asset Class,Quantity,Average Price (USD),Current Price (USD),Market Value (USD),Unrealized P&L (USD),Unrealized P&L (%)',
    ];

    if (positions.length === 0) {
      csvRows.push('NO ACTIVE HOLDINGS');
    } else {
      for (const pos of positions) {
        csvRows.push(
          `"${pos.symbol}","${pos.name.replace(/"/g, '""')}","${pos.assetType}",${pos.quantity},${pos.averagePrice},${pos.currentPrice},${pos.marketValue},${pos.unrealizedPnl},${pos.unrealizedPnlPercent}%`
        );
      }
    }

    const content = csvRows.join('\r\n');
    return this.uploadFile({
      name: fileName,
      mimeType: 'text/csv',
      content,
      parentId: folderId,
      description: `Quantix simulated portfolio valuation and holdings snapshot generated on ${now.toLocaleString()}`,
    });
  }

  /**
   * Export Trade & Order Execution Ledger to Google Drive as CSV
   */
  async exportOrdersLedger(orders: Order[]): Promise<DriveFile> {
    const folderId = await this.getOrCreateQuantixFolder();
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `Quantix_Order_Executions_${dateStr}.csv`;

    const csvRows: string[] = [
      '# QUANTIX EXCHANGE SIMULATED ORDER LEDGER',
      `# Generated At: ${now.toISOString()}`,
      '',
      'Order ID,Timestamp,Symbol,Instrument Name,Side,Type,Quantity,Requested Price (USD),Executed Price (USD),Total Value (USD),Status,Notes',
    ];

    if (orders.length === 0) {
      csvRows.push('NO ORDERS RECORDED');
    } else {
      for (const ord of orders) {
        csvRows.push(
          `"${ord.id}","${ord.createdAt}","${ord.symbol}","${ord.name.replace(/"/g, '""')}","${ord.side}","${ord.orderType}",${ord.quantity},${ord.requestedPrice},${ord.executedPrice},${ord.totalValue},"${ord.status}","${(ord.rejectionReason || '').replace(/"/g, '""')}"`
        );
      }
    }

    const content = csvRows.join('\r\n');
    return this.uploadFile({
      name: fileName,
      mimeType: 'text/csv',
      content,
      parentId: folderId,
      description: `Quantix simulated order execution and limit ledger report generated on ${now.toLocaleString()}`,
    });
  }

  /**
   * Export AI Market Insights Brief to Google Drive as Markdown document
   */
  async exportAiInsightsBrief(insights: AiInsight[]): Promise<DriveFile> {
    const folderId = await this.getOrCreateQuantixFolder();
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `Quantix_AI_Market_Research_${dateStr}.md`;

    const mdLines: string[] = [
      '# Quantix Exchange — AI Market Research & Insights Brief',
      `*Generated on: ${now.toUTCString()}*`,
      '',
      '> **EDUCATIONAL PAPER-TRADING DISCLAIMER**',
      '> These insights are synthetically synthesized using educational simulation algorithms powered by Gemini AI models. They do not represent individualized financial, legal, or investment advice.',
      '',
      '---',
      '',
    ];

    if (insights.length === 0) {
      mdLines.push('No AI market insights generated yet.');
    } else {
      for (const ins of insights) {
        mdLines.push(`## ${ins.symbol} — ${ins.title}`);
        mdLines.push(`- **Sentiment**: ${ins.sentiment}`);
        mdLines.push(`- **Simulated Risk Level**: ${ins.riskLevel}`);
        mdLines.push(`- **AI Confidence Score**: ${(ins.confidenceScore * 100).toFixed(0)}%`);
        mdLines.push(`- **AI Model**: \`${ins.modelName}\` (Prompt Version: \`${ins.promptVersion}\`)`);
        mdLines.push(`- **Generated At**: ${new Date(ins.generatedAt).toLocaleString()}`);
        mdLines.push('');
        mdLines.push(`### Executive Summary`);
        mdLines.push(ins.summary);
        mdLines.push('');
        mdLines.push(`### Key Analysis Vectors`);
        for (const pt of ins.keyPoints) {
          mdLines.push(`- ${pt}`);
        }
        mdLines.push('');
        mdLines.push(`*Disclaimer: ${ins.disclaimer}*`);
        mdLines.push('');
        mdLines.push('---');
        mdLines.push('');
      }
    }

    const content = mdLines.join('\n');
    return this.uploadFile({
      name: fileName,
      mimeType: 'text/markdown',
      content,
      parentId: folderId,
      description: `Quantix AI market synthesis report for ${insights.length} securities`,
    });
  }
}

export const googleDriveService = new GoogleDriveService();
