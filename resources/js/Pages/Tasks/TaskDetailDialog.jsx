import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Calendar,
    Clock,
    Send,
    Edit,
    Trash2,
    AlertCircle,
    CheckCircle2,
    MessageSquare,
    ExternalLink,
    Link2,
    Eye,
    Lock,
    ListTodo,
    Layers,
} from 'lucide-react';

export default function TaskDetailDialog({ open, onOpenChange, task, onEdit, users = [] }) {
    if (!task) return null;

    const { auth } = usePage().props;
    const isAssignee = auth?.user?.id === task.assigned_to;

    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [selectedTabIdx, setSelectedTabIdx] = useState(0);

    const tabs = task.tabs_list && task.tabs_list.length > 0
        ? task.tabs_list
        : (Array.isArray(task.tabs) && task.tabs.length > 0
            ? task.tabs
            : [
                {
                    id: 'tab-1',
                    name: 'General',
                    items: task.descriptions_list || (task.description ? [task.description] : []),
                    links: task.links_list || (task.link ? [task.link] : []),
                }
            ]);

    const activeTab = tabs[selectedTabIdx] || tabs[0] || { name: 'General', items: [], links: [] };

    const handleReassign = (assigned_to) => {
        if (!isAssignee) return;
        router.patch(route('tasks.assign', task.id), {
            assigned_to,
        }, {
            preserveScroll: true,
        });
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const handleStatusChange = (status) => {
        if (!isAssignee) return;
        let revisionNotes = task.revision_notes;
        if (status === 'revisi') {
            const promptNotes = window.prompt('Enter revision notes:', task.revision_notes || '');
            if (promptNotes !== null) {
                revisionNotes = promptNotes;
            }
        }

        router.patch(route('tasks.status', task.id), {
            status,
            revision_notes: revisionNotes,
        }, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (!isAssignee) return;
        if (window.confirm('Delete this task?')) {
            router.delete(route('tasks.destroy', task.id), {
                onSuccess: () => onOpenChange(false),
            });
        }
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        router.post(route('tasks.comments', task.id), {
            comment: newComment,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewComment('');
                setSubmittingComment(false);
            },
            onError: () => setSubmittingComment(false),
        });
    };

    const statusBadgeConfig = {
        todo: { label: 'Todo', class: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
        in_progress: { label: 'In Progress', class: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' },
        revisi: { label: 'In Revision', class: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold' },
        done: { label: 'Completed', class: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' },
    };

    const priorityBadgeConfig = {
        low: { label: 'Low', class: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
        medium: { label: 'Medium', class: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' },
        high: { label: 'High', class: 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300' },
        urgent: { label: 'Urgent', class: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold' },
    };

    const currentStatus = statusBadgeConfig[task.status] || statusBadgeConfig.todo;
    const currentPriority = priorityBadgeConfig[task.priority] || priorityBadgeConfig.medium;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-5">
                <DialogHeader className="space-y-1.5 pb-1">
                    <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-[11px] bg-slate-50 dark:bg-slate-800">
                            {task.category}
                        </Badge>
                        <div className="flex items-center gap-1.5">
                            <Badge className={`text-[10px] ${currentStatus.class}`}>
                                {currentStatus.label}
                            </Badge>
                            <Badge className={`text-[10px] ${currentPriority.class}`}>
                                {currentPriority.label}
                            </Badge>
                        </div>
                    </div>
                    <DialogTitle className="text-base font-bold leading-snug">
                        {task.title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-1">
                    {/* Read-only notice when viewing peer's task */}
                    {!isAssignee && (
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                <Lock className="h-3.5 w-3.5 text-slate-400" />
                                <span>Assigned to <strong className="text-slate-900 dark:text-slate-100">{task.assignee?.name}</strong></span>
                            </div>
                            <Badge variant="outline" className="text-[10px] bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700">
                                Read Only View
                            </Badge>
                        </div>
                    )}

                    {/* Metadata Card */}
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-[10px] text-slate-400 block mb-1">Assignee:</span>
                                {isAssignee ? (
                                    <Select
                                        value={String(task.assigned_to)}
                                        onValueChange={(val) => handleReassign(Number(val))}
                                    >
                                        <SelectTrigger className="h-7 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <Avatar className="h-4 w-4">
                                                    <AvatarFallback className="bg-slate-800 text-white text-[8px]">
                                                        {getInitials(task.assignee?.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                    {task.assignee?.name} (You)
                                                </span>
                                                {task.assignee?.role && (
                                                    <span className="text-[10px] text-slate-400 truncate">
                                                        • {task.assignee.role}
                                                    </span>
                                                )}
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            {users.map((u) => (
                                                <SelectItem key={u.id} value={String(u.id)}>
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <span className="font-medium">{u.name}</span>
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
                                ) : (
                                    <div className="h-7 px-2 flex items-center gap-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                                        <Avatar className="h-4 w-4">
                                            <AvatarFallback className="bg-slate-800 text-white text-[8px]">
                                                {getInitials(task.assignee?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                            {task.assignee?.name}
                                        </span>
                                        {task.assignee?.role && (
                                            <span className="text-[10px] text-slate-400 truncate">
                                                • {task.assignee.role}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <span className="text-[10px] text-slate-400 block">Created by:</span>
                                <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                                    <Avatar className="h-5 w-5">
                                        <AvatarFallback className="bg-slate-600 text-white text-[9px]">
                                            {getInitials(task.creator?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="truncate">{task.creator?.name}</span>
                                    {task.creator?.role && (
                                        <span className="text-[10px] text-slate-400 truncate">
                                            • {task.creator.role}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                <span>Due:</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatDateTime(task.due_at)}</span>
                            </div>
                            {task.completed_at && (
                                <div className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    {formatDateTime(task.completed_at)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DYNAMIC TABS DISPLAY (UI/UX, Coding, Design System, etc.) */}
                    <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                    Workstream Tabs
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    ({tabs.length} tabs)
                                </span>
                            </div>
                            {isAssignee && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        onOpenChange(false);
                                        onEdit(task);
                                    }}
                                    className="h-6 text-[10px] px-2 gap-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                >
                                    <Edit className="h-3 w-3" /> Edit Tabs & Items
                                </Button>
                            )}
                        </div>

                        {/* Interactive Tab Switcher Bar */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/80 dark:border-slate-800">
                            {tabs.map((tab, idx) => {
                                const isActive = idx === selectedTabIdx;
                                const itemCount = tab.items?.filter(Boolean).length || 0;
                                return (
                                    <button
                                        key={tab.id || idx}
                                        type="button"
                                        onClick={() => setSelectedTabIdx(idx)}
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
                                            {itemCount}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Tab Details */}
                        <div className="space-y-3 pt-1">
                            {/* Activities ("Lagi Ngapain") */}
                            <div className="space-y-1.5">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <ListTodo className="h-3.5 w-3.5 text-slate-500" />
                                    Activities in "{activeTab.name}" ("Lagi Ngapain")
                                </span>

                                {activeTab.items && activeTab.items.filter(Boolean).length > 0 ? (
                                    <div className="space-y-1.5">
                                        {activeTab.items.filter(Boolean).map((item, itemIdx) => (
                                            <div
                                                key={itemIdx}
                                                className="p-2.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                                            >
                                                <span className="h-4 w-4 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                                                    {itemIdx + 1}
                                                </span>
                                                <div className="leading-relaxed whitespace-pre-wrap flex-1">
                                                    {item}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic py-1">
                                        No activity items listed in this tab.
                                    </p>
                                )}
                            </div>

                            {/* Reference Links for this tab */}
                            {activeTab.links && activeTab.links.filter(Boolean).length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                                        <Link2 className="h-3.5 w-3.5 text-blue-500" />
                                        Links in "{activeTab.name}"
                                    </span>
                                    <div className="space-y-1.5">
                                        {activeTab.links.filter(Boolean).map((lnk, linkIdx) => (
                                            <div
                                                key={linkIdx}
                                                className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-slate-900 border border-blue-200/60 dark:border-blue-900/50 text-xs"
                                            >
                                                <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                                                    <ExternalLink className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                                    <span className="truncate font-mono text-[11px] text-blue-900 dark:text-blue-200">
                                                        {lnk}
                                                    </span>
                                                </div>
                                                <a
                                                    href={lnk}
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium shrink-0"
                                                >
                                                    Open <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Revision Notes */}
                    {task.revision_notes && (
                        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                            <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Revision Notes:
                            </span>
                            <p className="text-amber-800 dark:text-amber-200 pl-4">{task.revision_notes}</p>
                        </div>
                    )}

                    {/* Quick Status Buttons (Only editable by Assignee) */}
                    {isAssignee ? (
                        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Change Status:</span>
                            <div className="flex flex-wrap gap-1.5">
                                <Button
                                    size="sm"
                                    variant={task.status === 'in_progress' ? 'default' : 'outline'}
                                    onClick={() => handleStatusChange('in_progress')}
                                    className="text-xs h-7 gap-1"
                                >
                                    <Clock className="h-3 w-3" />
                                    In Progress
                                </Button>
                                <Button
                                    size="sm"
                                    variant={task.status === 'revisi' ? 'default' : 'outline'}
                                    onClick={() => handleStatusChange('revisi')}
                                    className="text-xs h-7 gap-1 text-amber-700 dark:text-amber-400"
                                >
                                    <AlertCircle className="h-3 w-3" />
                                    In Revision
                                </Button>
                                <Button
                                    size="sm"
                                    variant={task.status === 'done' ? 'default' : 'outline'}
                                    onClick={() => handleStatusChange('done')}
                                    className="text-xs h-7 gap-1 text-emerald-700 dark:text-emerald-400"
                                >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Completed
                                </Button>
                                <Button
                                    size="sm"
                                    variant={task.status === 'todo' ? 'default' : 'outline'}
                                    onClick={() => handleStatusChange('todo')}
                                    className="text-xs h-7"
                                >
                                    Reset Todo
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-slate-400">Current Status:</span>
                                <Badge className={`text-[10px] ${currentStatus.class}`}>
                                    {currentStatus.label}
                                </Badge>
                            </div>
                            <span className="text-[11px] text-slate-400 italic">
                                Only {task.assignee?.name ? task.assignee.name.split(' ')[0] : 'assignee'} can update status
                            </span>
                        </div>
                    )}

                    <Separator className="dark:bg-slate-800" />

                    {/* Comments & Activity (Available for both Adit & Risti) */}
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                                Comments & Notes ({task.comments?.length || 0})
                            </span>
                            {!isAssignee && (
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">
                                    Leave feedback for {task.assignee?.name ? task.assignee.name.split(' ')[0] : 'peer'}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {task.comments?.length ? (
                                task.comments.map((c) => {
                                    const isMyComment = c.user_id === auth?.user?.id;
                                    return (
                                        <div
                                            key={c.id}
                                            className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                                                isMyComment
                                                    ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-900/60 ml-3'
                                                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 mr-3'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between text-[10px] pb-0.5">
                                                <span className={`font-semibold flex items-center gap-1 ${
                                                    isMyComment ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
                                                }`}>
                                                    {c.user?.name || 'User'}
                                                    {isMyComment && (
                                                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">You</Badge>
                                                    )}
                                                </span>
                                                <span className="text-slate-400">{formatDateTime(c.created_at)}</span>
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{c.comment}</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-[11px] text-slate-400 italic py-2 text-center bg-slate-50 dark:bg-slate-950/50 rounded-md border border-dashed border-slate-200 dark:border-slate-800">
                                    No notes or feedback recorded yet.
                                </p>
                            )}
                        </div>

                        <form onSubmit={handleAddComment} className="flex gap-1.5 pt-1">
                            <Textarea
                                placeholder={
                                    isAssignee
                                        ? 'Add a progress note or update...'
                                        : `Leave a comment or feedback for ${task.assignee?.name ? task.assignee.name.split(' ')[0] : 'peer'}...`
                                }
                                rows={2}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="text-xs min-h-[44px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                disabled={submittingComment || !newComment.trim()}
                                className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 self-end h-9 px-3 gap-1 shadow-xs"
                            >
                                <Send className="h-3.5 w-3.5" />
                                <span className="text-xs">Post</span>
                            </Button>
                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                        {isAssignee ? (
                            <>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDelete}
                                    className="text-xs h-7 gap-1"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        onOpenChange(false);
                                        onEdit(task);
                                    }}
                                    className="text-xs h-7 gap-1 border-slate-200 dark:border-slate-800"
                                >
                                    <Edit className="h-3 w-3" />
                                    Edit Task & Workstreams
                                </Button>
                            </>
                        ) : (
                            <>
                                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                    <Eye className="h-3.5 w-3.5" />
                                    Viewing {task.assignee?.name}'s task
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onOpenChange(false)}
                                    className="text-xs h-7 border-slate-200 dark:border-slate-800"
                                >
                                    Close
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
