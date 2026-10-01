import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AppWindow,
    Plus,
    Search,
    ExternalLink,
    Trash2,
    Edit2,
    BookOpen,
    FolderKanban,
    Layers,
    Link2,
    FileText,
    HardDrive,
    Palette,
    Code2,
    Globe,
    FileCode2,
    Sparkles,
    CheckCircle2,
    ArrowUpRight,
} from 'lucide-react';

function AppBrandIcon({ iconKey, appName, className = 'h-6 w-6' }) {
    const key = (iconKey || appName || '').toLowerCase();

    if (key.includes('doc') || key.includes('gdoc')) {
        return (
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 shadow-2xs">
                <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
            </div>
        );
    }

    if (key.includes('drive') || key.includes('gdrive')) {
        return (
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.71 3.5L1.15 15l3.43 6 6.55-11.5M9.73 15L6.3 21h13.12l3.43-6M22.29 15L15.73 3.5H8.86l6.57 11.5" />
                </svg>
            </div>
        );
    }

    if (key.includes('figma')) {
        return (
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400 shadow-2xs">
                <svg className={className} viewBox="0 0 38 57" fill="none">
                    <path d="M19 28.5A9.5 9.5 0 1 1 28.5 19 9.5 9.5 0 0 1 19 28.5z" fill="#1ABCFE" />
                    <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
                    <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19z" fill="#FF7262" />
                    <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
                    <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
                </svg>
            </div>
        );
    }

    if (key.includes('journal') || key.includes('ieee') || key.includes('paper') || key.includes('research')) {
        return (
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0 text-amber-700 dark:text-amber-400 shadow-2xs">
                <BookOpen className={className} />
            </div>
        );
    }

    if (key.includes('overleaf') || key.includes('latex')) {
        return (
            <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center shrink-0 text-teal-700 dark:text-teal-400 shadow-2xs">
                <FileCode2 className={className} />
            </div>
        );
    }

    if (key.includes('github') || key.includes('git')) {
        return (
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-800 dark:text-slate-200 shadow-2xs">
                <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
            </div>
        );
    }

    return (
        <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 shadow-2xs">
            <Globe className={className} />
        </div>
    );
}

export default function ApplicationsIndex({ apps = [], counts = {}, filters = {}, categories = [] }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        app_name: 'Google Docs',
        category: 'Documentation',
        icon_key: 'gdocs',
        description: '',
        links: [{ title: '', url: '' }],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const openCreateModal = () => {
        setEditingApp(null);
        setFormData({
            title: '',
            app_name: 'Google Docs',
            category: 'Documentation',
            icon_key: 'gdocs',
            description: '',
            links: [{ title: '', url: '' }],
        });
        setIsModalOpen(true);
    };

    const openEditModal = (app) => {
        setEditingApp(app);
        setFormData({
            title: app.title || '',
            app_name: app.app_name || '',
            category: app.category || 'General',
            icon_key: app.icon_key || 'link',
            description: app.description || '',
            links: app.links && app.links.length > 0 ? app.links : [{ title: '', url: '' }],
        });
        setIsModalOpen(true);
    };

    const handleAddLinkRow = () => {
        setFormData((prev) => ({
            ...prev,
            links: [...prev.links, { title: '', url: '' }],
        }));
    };

    const handleRemoveLinkRow = (index) => {
        setFormData((prev) => ({
            ...prev,
            links: prev.links.filter((_, idx) => idx !== index),
        }));
    };

    const handleLinkChange = (index, field, value) => {
        setFormData((prev) => {
            const nextLinks = [...prev.links];
            nextLinks[index] = { ...nextLinks[index], [field]: value };
            return { ...prev, links: nextLinks };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const cleanLinks = formData.links.filter((l) => l.title.trim() !== '' && l.url.trim() !== '');
        if (cleanLinks.length === 0) {
            alert('Mohon cantumkan minimal 1 tautan tautan yang valid');
            setIsSubmitting(false);
            return;
        }

        const payload = {
            ...formData,
            links: cleanLinks,
        };

        if (editingApp) {
            router.put(route('applications.update', editingApp.id), payload, {
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsModalOpen(false);
                },
            });
        } else {
            router.post(route('applications.store'), payload, {
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsModalOpen(false);
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Hapus tautan integrasi aplikasi ini dari workspace?')) {
            router.delete(route('applications.destroy', id));
        }
    };

    const filteredApps = apps.filter((app) => {
        const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
        const matchesSearch =
            !searchTerm ||
            app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.app_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.description && app.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const totalLinksCount = apps.reduce((acc, curr) => acc + (curr.links ? curr.links.length : 0), 0);

    const appPresets = [
        { name: 'Google Docs', key: 'gdocs', defaultCat: 'Documentation' },
        { name: 'Google Drive', key: 'gdrive', defaultCat: 'Cloud Storage' },
        { name: 'Figma', key: 'figma', defaultCat: 'Design System' },
        { name: 'Academic Journals', key: 'journal', defaultCat: 'Research' },
        { name: 'Overleaf', key: 'overleaf', defaultCat: 'Research' },
        { name: 'GitHub', key: 'github', defaultCat: 'Development' },
    ];

    return (
        <AppLayout currentNav="applications" counts={counts}>
            <Head title="Applications" />

            <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center">
                                <AppWindow className="h-4 w-4" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                External Applications
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Unified directory for project documentation, research repositories, design files, and academic journals
                        </p>
                    </div>

                    <Button onClick={openCreateModal} size="sm" className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-xs gap-1.5 h-8">
                        <Plus className="h-3.5 w-3.5" />
                        Connect Application
                    </Button>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Workspaces</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{apps.length}</div>
                    </div>
                    <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Work Links</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalLinksCount}</div>
                    </div>
                    <div className="col-span-2 sm:col-span-1 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Tool Categories</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{categories.length || 5}</div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search applications, titles, or tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 text-xs h-8 bg-white dark:bg-slate-900"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                                selectedCategory === 'all'
                                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            All ({apps.length})
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                                    selectedCategory === cat
                                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Applications Grid */}
                {filteredApps.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 space-y-3">
                        <div className="h-10 w-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                            <AppWindow className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No applications found</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Connect your Google Docs, Google Drive, Figma files, or research literature repositories to manage team deliverables.
                        </p>
                        <Button onClick={openCreateModal} size="sm" variant="outline" className="text-xs gap-1.5 h-8">
                            <Plus className="h-3.5 w-3.5" />
                            Connect New Application
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredApps.map((app) => (
                            <Card
                                key={app.id}
                                className="overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                            >
                                <div className="p-5 space-y-4 flex-1">
                                    {/* Top Bar with Icon & Actions */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <AppBrandIcon iconKey={app.icon_key} appName={app.app_name} />
                                            <div className="min-w-0 space-y-0.5">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <Badge variant="outline" className="text-[10px] font-semibold tracking-wide px-1.5 py-0 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                                        {app.app_name}
                                                    </Badge>
                                                    <span className="text-[10px] px-1.5 py-0 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                        {app.category}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pt-0.5 truncate" title={app.title}>
                                                    {app.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => openEditModal(app)}
                                                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(app.id)}
                                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {app.description && (
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                                            {app.description}
                                        </p>
                                    )}

                                    {/* Links List */}
                                    <div className="space-y-1.5 pt-1">
                                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                                            <span>Workspaces & Links</span>
                                            <span>{app.links?.length || 0} links</span>
                                        </div>

                                        <div className="space-y-1.5">
                                            {app.links && app.links.map((linkItem, idx) => (
                                                <a
                                                    key={idx}
                                                    href={linkItem.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all text-xs"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                                        <Link2 className="h-3 w-3 text-slate-400 shrink-0 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-slate-900 dark:group-hover:text-white">
                                                            {linkItem.title || 'Workspace Link'}
                                                        </span>
                                                    </div>
                                                    <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 shrink-0 group-hover:underline">
                                                        Open
                                                        <ArrowUpRight className="h-3 w-3" />
                                                    </span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer meta */}
                                <div className="px-5 py-2.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                                    <span>
                                        {app.creator ? `Added by ${app.creator.name}` : 'Team Workspace'}
                                    </span>
                                    <span>
                                        Updated recently
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create & Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {editingApp ? 'Edit Application Connection' : 'Connect New Application'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        {/* Quick Presets */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Choose Service Preset
                            </label>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {appPresets.map((preset) => (
                                    <button
                                        type="button"
                                        key={preset.name}
                                        onClick={() => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                app_name: preset.name,
                                                icon_key: preset.key,
                                                category: preset.defaultCat,
                                            }));
                                        }}
                                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                                            formData.app_name === preset.name
                                                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title and Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Project / Workspace Title *
                                </label>
                                <Input
                                    required
                                    placeholder="e.g. Thesis Manuscript Draft"
                                    value={formData.title}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                    className="text-xs h-8"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Application Name *
                                </label>
                                <Input
                                    required
                                    placeholder="e.g. Google Docs, Figma, IEEE"
                                    value={formData.app_name}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, app_name: e.target.value }))}
                                    className="text-xs h-8"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Category *
                                </label>
                                <Input
                                    required
                                    placeholder="Documentation, Research, Design..."
                                    value={formData.category}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                                    className="text-xs h-8"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Icon Identifier
                                </label>
                                <select
                                    value={formData.icon_key}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, icon_key: e.target.value }))}
                                    className="w-full text-xs h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                                >
                                    <option value="gdocs">Google Docs</option>
                                    <option value="gdrive">Google Drive</option>
                                    <option value="figma">Figma</option>
                                    <option value="journal">Academic Journals</option>
                                    <option value="overleaf">Overleaf</option>
                                    <option value="github">GitHub</option>
                                    <option value="link">General External Link</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Description & Scope of Work
                            </label>
                            <Textarea
                                rows={2}
                                placeholder="Describe what tasks or artifacts are managed inside this tool..."
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                className="text-xs resize-none"
                            />
                        </div>

                        {/* Dynamic Links List */}
                        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Work & Document Links (Multiple URLs supported) *
                                </label>
                                <Button
                                    type="button"
                                    onClick={handleAddLinkRow}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7 gap-1"
                                >
                                    <Plus className="h-3 w-3" />
                                    Add Another Link
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {formData.links.map((linkRow, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input
                                            required
                                            placeholder="Label (e.g. Chapter 1 Draft)"
                                            value={linkRow.title}
                                            onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                                            className="text-xs h-8 flex-1"
                                        />
                                        <Input
                                            required
                                            type="url"
                                            placeholder="https://..."
                                            value={linkRow.url}
                                            onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                            className="text-xs h-8 flex-2"
                                        />
                                        {formData.links.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveLinkRow(index)}
                                                className="p-1.5 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                title="Remove link"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsModalOpen(false)}
                                className="text-xs h-8"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                size="sm"
                                className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs h-8"
                            >
                                {isSubmitting ? 'Saving...' : editingApp ? 'Update Connection' : 'Save Connection'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
