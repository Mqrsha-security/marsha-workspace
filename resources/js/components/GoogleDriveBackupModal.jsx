import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Cloud,
    FolderPlus,
    FileText,
    ExternalLink,
    Download,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Layers,
    Calendar,
    StickyNote,
    AppWindow,
    Share2,
    HardDrive,
} from 'lucide-react';

export default function GoogleDriveBackupModal({ isOpen, onClose }) {
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [statusData, setStatusData] = useState(null);
    const [shareEmail, setShareEmail] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [backupResult, setBackupResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            setErrorMsg('');
            setBackupResult(null);
            fetchStatus();
        }
    }, [isOpen]);

    const fetchStatus = async () => {
        setLoadingStatus(true);
        try {
            const res = await fetch('/backup/status');
            if (res.ok) {
                const data = await res.json();
                setStatusData(data);
                if (data.default_share_email) {
                    setShareEmail(data.default_share_email);
                }
            }
        } catch (err) {
            console.error('Failed to load backup status', err);
        } finally {
            setLoadingStatus(false);
        }
    };

    const handleExecuteBackup = async (e) => {
        e?.preventDefault();
        setIsExecuting(true);
        setErrorMsg('');
        setBackupResult(null);

        try {
            const res = await fetch('/backup/google-drive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ share_email: shareEmail }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setBackupResult(data);
            } else {
                setErrorMsg(data.message || 'Backup execution encountered an error.');
            }
        } catch (err) {
            setErrorMsg(err.message || 'Network error occurred while executing backup.');
        } finally {
            setIsExecuting(false);
        }
    };

    const handleDownloadZip = () => {
        window.location.href = '/backup/download';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl p-5 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/80 flex items-center justify-center text-sky-600 dark:text-sky-400">
                            <Cloud className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                                Google Drive & Docs Backup
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                                Automatically export all tasks, meetings, notes, and directory into native Google Docs.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {loadingStatus ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                        <span className="text-xs">Checking Google Drive service status...</span>
                    </div>
                ) : (
                    <div className="space-y-4 pt-2">
                        {/* Summary of Data to be Exported */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Workspace Modules Included
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col items-center text-center">
                                    <Layers className="h-4 w-4 text-blue-500 mb-1" />
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {statusData?.counts?.tasks ?? 0}
                                    </span>
                                    <span className="text-[10px] text-slate-400">Tasks</span>
                                </div>
                                <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col items-center text-center">
                                    <Calendar className="h-4 w-4 text-indigo-500 mb-1" />
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {statusData?.counts?.meetings ?? 0}
                                    </span>
                                    <span className="text-[10px] text-slate-400">Meetings</span>
                                </div>
                                <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col items-center text-center">
                                    <StickyNote className="h-4 w-4 text-emerald-500 mb-1" />
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {statusData?.counts?.notes ?? 0}
                                    </span>
                                    <span className="text-[10px] text-slate-400">Notes</span>
                                </div>
                                <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col items-center text-center">
                                    <AppWindow className="h-4 w-4 text-violet-500 mb-1" />
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {statusData?.counts?.apps ?? 0}
                                    </span>
                                    <span className="text-[10px] text-slate-400">Apps</span>
                                </div>
                            </div>
                        </div>

                        {/* Error Notification */}
                        {errorMsg && (
                            <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
                                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-semibold">Backup Failed</p>
                                    <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">{errorMsg}</p>
                                </div>
                            </div>
                        )}

                        {/* Success State */}
                        {backupResult && (
                            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-3">
                                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-bold">Successfully Exported to Google Drive!</h4>
                                        <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                                            Created new folder: <span className="font-semibold">{backupResult.folder_name}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-1">
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800/70 dark:text-emerald-300/70">
                                        Created Google Docs ({backupResult.docs?.length ?? 0}):
                                    </div>
                                    <div className="space-y-1">
                                        {backupResult.docs?.map((doc, idx) => (
                                            <a
                                                key={idx}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-900/60 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 text-xs text-slate-800 dark:text-slate-200 transition-colors group"
                                            >
                                                <span className="flex items-center gap-2 truncate">
                                                    <FileText className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                                                    <span className="truncate">{doc.name}</span>
                                                </span>
                                                <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                <a
                                    href={backupResult.folder_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                                >
                                    <FolderPlus className="h-4 w-4" />
                                    Open Folder in Google Drive
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </div>
                        )}

                        {/* Configuration Form / Status */}
                        {!backupResult && (
                            <>
                                {statusData?.oauth_connected ? (
                                    <div className="space-y-3.5">
                                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 text-xs">
                                            <span className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
                                                <HardDrive className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                Terhubung ke Google Drive: <strong>{statusData.connected_email || 'Akun Google Anda'}</strong>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    await fetch('/backup/google/disconnect', { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' } });
                                                    fetchStatus();
                                                }}
                                                className="text-[11px] text-rose-600 hover:underline font-medium"
                                            >
                                                Disconnect
                                            </button>
                                        </div>

                                        <div className="pt-2 flex flex-col sm:flex-row gap-2">
                                            <button
                                                type="button"
                                                disabled={isExecuting}
                                                onClick={handleExecuteBackup}
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                            >
                                                {isExecuting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Generating Google Docs & Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Cloud className="h-4 w-4" />
                                                        Start Backup to Google Drive
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleDownloadZip}
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                                                title="Download offline backup zip archive"
                                            >
                                                <Download className="h-3.5 w-3.5 text-slate-500" />
                                                Download ZIP
                                            </button>
                                        </div>
                                    </div>
                                ) : statusData?.oauth_available ? (
                                    <div className="space-y-3.5">
                                        <div className="p-3.5 rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/30 text-xs space-y-2">
                                            <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-semibold">
                                                <Cloud className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                                Hubungkan Akun Google Drive (Kuota 15 GB Pribadi)
                                            </div>
                                            <p className="text-[11px] text-sky-900/80 dark:text-sky-300/80 leading-relaxed">
                                                Google membatasi kuota Service Account robot 0 GB. Hubungkan akun Google pribadi Anda sekali ini agar file Google Docs otomatis tersimpan di folder Drive Anda menggunakan kuota 15 GB pribadi tanpa error batas kuota.
                                            </p>
                                            <a
                                                href="/backup/google/connect"
                                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors mt-1"
                                            >
                                                <HardDrive className="h-4 w-4" />
                                                Login & Beri Akses Google Drive
                                            </a>
                                        </div>

                                        <div className="flex justify-center">
                                            <button
                                                type="button"
                                                onClick={handleDownloadZip}
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                                            >
                                                <Download className="h-3.5 w-3.5 text-slate-500" />
                                                Download Arsip ZIP (Docs HTML + JSON)
                                            </button>
                                        </div>
                                    </div>
                                ) : statusData?.configured ? (
                                    <div className="space-y-3.5">
                                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-sky-100 dark:border-sky-950 bg-sky-50/50 dark:bg-sky-950/20 text-xs">
                                            <span className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-medium">
                                                <HardDrive className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                                Google Service Account Connected
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                                Active
                                            </span>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                <Share2 className="h-3.5 w-3.5 text-slate-400" />
                                                Share New Folder With Email:
                                            </label>
                                            <input
                                                type="email"
                                                value={shareEmail}
                                                onChange={(e) => setShareEmail(e.target.value)}
                                                placeholder="your.email@gmail.com"
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                            />
                                            <p className="text-[10px] text-slate-400">
                                                The generated folder and Google Docs will automatically grant edit access to this email.
                                            </p>
                                        </div>

                                        <div className="pt-2 flex flex-col sm:flex-row gap-2">
                                            <button
                                                type="button"
                                                disabled={isExecuting}
                                                onClick={handleExecuteBackup}
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                            >
                                                {isExecuting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Generating Google Docs & Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Cloud className="h-4 w-4" />
                                                        Start Backup to Google Drive
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleDownloadZip}
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                                                title="Download offline backup zip archive"
                                            >
                                                <Download className="h-3.5 w-3.5 text-slate-500" />
                                                Download ZIP
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3.5">
                                        <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 text-xs space-y-2">
                                            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold">
                                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                                Google Service Account Belum Dikonfigurasi
                                            </div>
                                            <p className="text-[11px] text-amber-900/80 dark:text-amber-400/80 leading-relaxed">
                                                Untuk mengunggah otomatis ke Google Drive & Docs tanpa login ulang, tambahkan kredensial Service Account di Vercel Environment Variables:
                                            </p>
                                            <div className="p-2 rounded bg-amber-100/70 dark:bg-amber-950/60 font-mono text-[10px] text-amber-900 dark:text-amber-200 space-y-0.5 overflow-x-auto">
                                                <div>GOOGLE_SERVICE_ACCOUNT_JSON=&#123;...&#125;</div>
                                                <div>GOOGLE_SHARE_EMAIL=adit.rwet@gmail.com</div>
                                                <div>GOOGLE_DRIVE_FOLDER_ID=optional_parent_folder_id</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={handleDownloadZip}
                                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                            >
                                                <Download className="h-4 w-4" />
                                                Download Backup Archive (Docs HTML + JSON)
                                            </button>
                                            <p className="text-[10px] text-center text-slate-400">
                                                Arsip ZIP memuat file HTML siap impor ke Google Docs dan file data mentah JSON.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
