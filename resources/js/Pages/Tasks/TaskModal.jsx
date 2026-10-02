import { useEffect, useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Link2,
    User,
    Plus,
    Trash2,
    ListTodo,
    FolderKanban,
    Layers,
    AlertTriangle,
} from 'lucide-react';

export default function TaskModal({ open, onOpenChange, task = null, users = [], categories = [] }) {
    const isEdit = Boolean(task);
    const { auth } = usePage().props;
    const currentUserId = auth.user?.id;

    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteTask = () => {
        if (!task?.id) return;
        setIsDeleting(true);
        router.delete(route('tasks.destroy', task.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                setIsDeleteDialogOpen(false);
                onOpenChange(false);
            },
            onError: () => setIsDeleting(false),
        });
    };

    const formatDateTimeLocal = (dateStr) => {
        if (!dateStr) {
            const now = new Date();
            now.setDate(now.getDate() + 3);
            now.setHours(17, 0, 0, 0);
            return now.toISOString().slice(0, 16);
        }
        const d = new Date(dateStr);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const getInitialTabs = (t) => {
        if (t && t.tabs_list && t.tabs_list.length > 0) {
            return t.tabs_list.map((tab, idx) => ({
                id: tab.id || `tab-${idx + 1}`,
                name: tab.name || `Tab ${idx + 1}`,
                items: tab.items && tab.items.length ? tab.items : [''],
                links: tab.links && tab.links.length ? tab.links : [''],
            }));
        }

        if (t) {
            const desc = t.descriptions_list && t.descriptions_list.length ? t.descriptions_list : (t.description ? [t.description] : ['']);
            const lnks = t.links_list && t.links_list.length ? t.links_list : (t.link ? [t.link] : ['']);
            return [
                {
                    id: 'tab-1',
                    name: 'General',
                    items: desc,
                    links: lnks,
                }
            ];
        }

        // Default initial tabs for a new task
        return [
            { id: 'tab-1', name: 'UI/UX', items: [''], links: [''] },
            { id: 'tab-2', name: 'Coding', items: [''], links: [''] },
            { id: 'tab-3', name: 'Design System', items: [''], links: [''] },
        ];
    };

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        tabs: getInitialTabs(task),
        category: '',
        priority: 'medium',
        assigned_to: currentUserId || '',
        due_at: formatDateTimeLocal(),
        status: 'todo',
        revision_notes: '',
    });

    useEffect(() => {
        if (task) {
            setData({
                title: task.title || '',
                tabs: getInitialTabs(task),
                category: task.category || '',
                priority: task.priority || 'medium',
                assigned_to: task.assigned_to || currentUserId,
                due_at: formatDateTimeLocal(task.due_at),
                status: task.status || 'todo',
                revision_notes: task.revision_notes || '',
            });
            setActiveTabIndex(0);
        } else {
            reset();
            setData({
                title: '',
                tabs: getInitialTabs(null),
                category: '',
                priority: 'medium',
                assigned_to: currentUserId || users[0]?.id || '',
                due_at: formatDateTimeLocal(),
                status: 'todo',
                revision_notes: '',
            });
            setActiveTabIndex(0);
        }
    }, [task, open]);

    // Tab Management
    const handleAddTab = (customName = '') => {
        const newName = customName.trim() || `Workstream ${data.tabs.length + 1}`;
        const newTab = {
            id: `tab-${Date.now()}`,
            name: newName,
            items: [''],
            links: [''],
        };
        const updatedTabs = [...data.tabs, newTab];
        setData('tabs', updatedTabs);
        setActiveTabIndex(updatedTabs.length - 1);
    };

    const handleRemoveTab = (index) => {
        if (data.tabs.length <= 1) return;
        const updatedTabs = data.tabs.filter((_, i) => i !== index);
        setData('tabs', updatedTabs);
        setActiveTabIndex((prev) => (prev >= updatedTabs.length ? updatedTabs.length - 1 : prev));
    };

    const handleTabNameChange = (index, newName) => {
        const updatedTabs = [...data.tabs];
        updatedTabs[index].name = newName;
        setData('tabs', updatedTabs);
    };

    // Item (Lagi Ngapain) Management for active tab
    const handleAddItem = (tabIdx) => {
        const updatedTabs = [...data.tabs];
        updatedTabs[tabIdx].items = [...(updatedTabs[tabIdx].items || []), ''];
        setData('tabs', updatedTabs);
    };

    const handleRemoveItem = (tabIdx, itemIdx) => {
        const updatedTabs = [...data.tabs];
        const currentItems = updatedTabs[tabIdx].items || [];
        const filtered = currentItems.filter((_, i) => i !== itemIdx);
        updatedTabs[tabIdx].items = filtered.length ? filtered : [''];
        setData('tabs', updatedTabs);
    };

    const handleItemChange = (tabIdx, itemIdx, value) => {
        const updatedTabs = [...data.tabs];
        const currentItems = [...(updatedTabs[tabIdx].items || [''])];
        currentItems[itemIdx] = value;
        updatedTabs[tabIdx].items = currentItems;
        setData('tabs', updatedTabs);
    };

    // Link Management for active tab
    const handleAddLink = (tabIdx) => {
        const updatedTabs = [...data.tabs];
        updatedTabs[tabIdx].links = [...(updatedTabs[tabIdx].links || []), ''];
        setData('tabs', updatedTabs);
    };

    const handleRemoveLink = (tabIdx, linkIdx) => {
        const updatedTabs = [...data.tabs];
        const currentLinks = updatedTabs[tabIdx].links || [];
        const filtered = currentLinks.filter((_, i) => i !== linkIdx);
        updatedTabs[tabIdx].links = filtered.length ? filtered : [''];
        setData('tabs', updatedTabs);
    };

    const handleLinkChange = (tabIdx, linkIdx, value) => {
        const updatedTabs = [...data.tabs];
        const currentLinks = [...(updatedTabs[tabIdx].links || [''])];
        currentLinks[linkIdx] = value;
        updatedTabs[tabIdx].links = currentLinks;
        setData('tabs', updatedTabs);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('tasks.update', task.id), {
                onSuccess: () => onOpenChange(false),
            });
        } else {
            post(route('tasks.store'), {
                onSuccess: () => onOpenChange(false),
            });
        }
    };

    const isSelfAssigned = Number(data.assigned_to) === Number(currentUserId);
    const activeTab = data.tabs[activeTabIndex] || data.tabs[0];

    return (
        <>
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-5">
                <DialogHeader className="pb-1 pr-10 sm:pr-12">
                    <DialogTitle className="text-base font-bold">
                        {isEdit ? 'Edit Task & Workstreams' : 'New Task & Workstreams'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Task Title *
                        </label>
                        <Input
                            placeholder="e.g. Implement authentication flow & design system..."
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            required
                        />
                        {errors.title && <p className="text-xs text-rose-600">{errors.title}</p>}
                    </div>

                    {/* Assignment: Self vs Peer */}
                    <div className="space-y-1.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Assignee:
                            </label>
                            <button
                                type="button"
                                onClick={() => setData('assigned_to', currentUserId)}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                                    isSelfAssigned
                                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                <User className="h-3 w-3" />
                                Myself
                            </button>
                        </div>

                        <Select
                            value={String(data.assigned_to)}
                            onValueChange={(val) => setData('assigned_to', Number(val))}
                        >
                            <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <SelectValue placeholder="Select assignee..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                {users.map((u) => (
                                    <SelectItem key={u.id} value={String(u.id)}>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                                {u.name} {u.id === currentUserId ? '(You)' : ''}
                                            </span>
                                            {u.role && (
                                                <span className="text-[10px] text-slate-400">
                                                    • {u.role}
                                                </span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.assigned_to && (
                            <p className="text-xs text-rose-600">{errors.assigned_to}</p>
                        )}
                    </div>

                    {/* Category & Priority */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Category *
                            </label>
                            <Input
                                placeholder="e.g. Frontend, API Security, Database..."
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                required
                            />
                            {errors.category && (
                                <p className="text-xs text-rose-600">{errors.category}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Priority *
                            </label>
                            <Select
                                value={data.priority}
                                onValueChange={(val) => setData('priority', val)}
                            >
                                <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Deadline & Status */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Deadline (Date & Time) *
                            </label>
                            <Input
                                type="datetime-local"
                                value={data.due_at}
                                onChange={(e) => setData('due_at', e.target.value)}
                                className="h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                required
                            />
                            {errors.due_at && <p className="text-xs text-rose-600">{errors.due_at}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Status
                            </label>
                            <Select
                                value={data.status}
                                onValueChange={(val) => setData('status', val)}
                            >
                                <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <SelectItem value="todo">Todo</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="revisi">In Revision</SelectItem>
                                    <SelectItem value="done">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* DYNAMIC TABS SECTION (UI/UX, Coding, Design System, etc.) */}
                    <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                                <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                    Task Workstream Tabs
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    ({data.tabs.length} tabs)
                                </span>
                            </div>

                            {/* Quick Add Tab Buttons */}
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddTab('')}
                                    className="h-6 text-[11px] px-2 gap-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xs"
                                >
                                    <Plus className="h-3 w-3" /> Add Tab
                                </Button>
                            </div>
                        </div>

                        {/* Tab Switcher Bar */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/80 dark:border-slate-800">
                            {data.tabs.map((tab, idx) => {
                                const isActive = idx === activeTabIndex;
                                return (
                                    <button
                                        key={tab.id || idx}
                                        type="button"
                                        onClick={() => setActiveTabIndex(idx)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                            isActive
                                                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                                        }`}
                                    >
                                        <span>{tab.name || `Tab ${idx + 1}`}</span>
                                        <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                                            isActive
                                                ? 'bg-slate-700 dark:bg-slate-300 text-white dark:text-slate-900'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                        }`}>
                                            {(tab.items?.filter(Boolean).length || 0)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Tab Content Editor */}
                        {activeTab && (
                            <div className="space-y-3 pt-1">
                                {/* Tab Name & Tab Deletion */}
                                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="text-[11px] font-semibold text-slate-500 shrink-0">Tab Name:</span>
                                        <Input
                                            value={activeTab.name}
                                            onChange={(e) => handleTabNameChange(activeTabIndex, e.target.value)}
                                            placeholder="e.g. UI/UX, Coding, Design System, Testing..."
                                            className="h-7 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex-1 max-w-xs"
                                        />
                                    </div>
                                    {data.tabs.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveTab(activeTabIndex)}
                                            className="h-7 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2 gap-1"
                                            title="Delete this tab"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            <span>Delete Tab</span>
                                        </Button>
                                    )}
                                </div>

                                {/* Items / Activities for this tab */}
                                <div className="space-y-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                            <ListTodo className="h-3.5 w-3.5 text-slate-500" />
                                            Activities in "{activeTab.name}"
                                        </label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddItem(activeTabIndex)}
                                            className="h-6 text-[11px] px-2 gap-1 border-slate-200 dark:border-slate-700"
                                        >
                                            <Plus className="h-3 w-3" /> Add Item
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {(activeTab.items || ['']).map((item, itemIdx) => (
                                            <div key={itemIdx} className="flex items-start gap-1.5">
                                                <span className="h-7 w-5 text-[11px] font-bold text-slate-400 flex items-center justify-center shrink-0">
                                                    {itemIdx + 1}.
                                                </span>
                                                <Textarea
                                                    rows={2}
                                                    placeholder={`Activity item for ${activeTab.name} (e.g. wireframing prototype, API endpoints)...`}
                                                    value={item}
                                                    onChange={(e) => handleItemChange(activeTabIndex, itemIdx, e.target.value)}
                                                    className="text-xs min-h-[46px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex-1"
                                                />
                                                {activeTab.items.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveItem(activeTabIndex, itemIdx)}
                                                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 shrink-0"
                                                        title="Remove item"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Reference Links for this tab */}
                                <div className="space-y-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                            <Link2 className="h-3.5 w-3.5 text-blue-500" />
                                            Links for "{activeTab.name}" (Figma, GitHub, Docs, etc.)
                                        </label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddLink(activeTabIndex)}
                                            className="h-6 text-[11px] px-2 gap-1 border-slate-200 dark:border-slate-700"
                                        >
                                            <Plus className="h-3 w-3" /> Add Link
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {(activeTab.links || ['']).map((lnk, linkIdx) => (
                                            <div key={linkIdx} className="flex items-center gap-1.5">
                                                <span className="h-7 w-5 text-[11px] font-bold text-slate-400 flex items-center justify-center shrink-0">
                                                    #{linkIdx + 1}
                                                </span>
                                                <Input
                                                    type="url"
                                                    placeholder="https://figma.com/... or https://github.com/..."
                                                    value={lnk}
                                                    onChange={(e) => handleLinkChange(activeTabIndex, linkIdx, e.target.value)}
                                                    className="h-8 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex-1"
                                                />
                                                {activeTab.links.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveLink(activeTabIndex, linkIdx)}
                                                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 shrink-0"
                                                        title="Remove link"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Revision Notes if in revision */}
                    {data.status === 'revisi' && (
                        <div className="space-y-1 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                            <label className="text-xs font-bold text-amber-900 dark:text-amber-300">
                                Revision Feedback:
                            </label>
                            <Textarea
                                rows={2}
                                placeholder="Detail exact sections, citations, or code requiring revisions..."
                                value={data.revision_notes}
                                onChange={(e) => setData('revision_notes', e.target.value)}
                                className="text-xs bg-white dark:bg-slate-950 border-amber-300 dark:border-amber-700"
                            />
                        </div>
                    )}

                    <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between w-full">
                        {isEdit ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1.5"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete Task
                            </Button>
                        ) : <div />}

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onOpenChange(false)}
                                disabled={processing}
                                className="text-xs h-8 border-slate-200 dark:border-slate-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white text-xs h-8"
                            >
                                {processing ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {/* Custom Delete Confirmation Modal */}
        {isEdit && (
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-md p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                    <div className="flex items-start gap-3.5">
                        <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="space-y-1.5 flex-1 pr-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                Delete Task
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">{task?.title}</span>? All workstream items, activity comments, and progress will be permanently removed.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="text-xs h-8"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            disabled={isDeleting}
                            onClick={handleDeleteTask}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 gap-1.5 shadow-xs"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            {isDeleting ? 'Deleting...' : 'Delete Task'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
        </>
    );
}
