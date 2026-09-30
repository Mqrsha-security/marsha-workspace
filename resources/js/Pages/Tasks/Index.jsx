import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import MotivationBanner from '@/components/MotivationBanner';
import NotificationDropdown from '@/components/NotificationDropdown';
import TaskModal from './TaskModal';
import TaskDetailDialog from './TaskDetailDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Plus,
    Search,
    Clock,
    AlertCircle,
    CheckCircle2,
    ListTodo,
    Kanban,
    List,
    Link2,
} from 'lucide-react';

export default function Index({ tasks = [], counts = {}, users = [], categories = [], filters = {} }) {
    const { auth } = usePage().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [viewMode, setViewMode] = useState('kanban');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(
            route('tasks.index'),
            { ...filters, search: searchTerm },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        if (value === 'all') delete newFilters[key];
        router.get(route('tasks.index'), newFilters, { preserveState: true, replace: true });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const priorityBadge = (priority) => {
        switch (priority) {
            case 'urgent':
                return <Badge className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 text-[10px] font-bold">Urgent</Badge>;
            case 'high':
                return <Badge className="bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-[10px]">High</Badge>;
            case 'medium':
                return <Badge className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px]">Medium</Badge>;
            default:
                return <Badge variant="secondary" className="text-[10px]">Low</Badge>;
        }
    };

    const columns = [
        {
            id: 'todo',
            title: 'Todo',
            icon: ListTodo,
            badgeBg: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
        },
        {
            id: 'in_progress',
            title: 'In Progress',
            icon: Clock,
            badgeBg: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300',
        },
        {
            id: 'revisi',
            title: 'In Revision',
            icon: AlertCircle,
            badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300',
        },
        {
            id: 'done',
            title: 'Completed',
            icon: CheckCircle2,
            badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
        },
    ];

    return (
        <AppLayout
            currentScope={filters.scope || 'all'}
            counts={counts}
            onOpenNewTask={() => {
                setEditingTask(null);
                setIsCreateOpen(true);
            }}
        >
            <Head title="Project Tasks" />

            {/* Top Bar */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-5 py-3 sticky top-0 z-20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {filters.scope === 'assigned_to_me'
                                ? 'Assigned to Me'
                                : filters.scope === 'assigned_by_me'
                                ? 'Assigned by Me'
                                : 'All Project Tasks'}
                        </h1>
                        <p className="text-[11px] text-slate-400">
                            {tasks.length} tasks in view
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <NotificationDropdown
                            onSelectTask={(taskId) => {
                                const target = tasks.find((t) => t.id === taskId);
                                if (target) {
                                    setSelectedTask(target);
                                    setIsDetailOpen(true);
                                }
                            }}
                        />

                        {/* View Switcher */}
                        <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-md p-0.5 bg-slate-100 dark:bg-slate-800">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                    viewMode === 'kanban'
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                <Kanban className="h-3 w-3" />
                                Board
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                    viewMode === 'list'
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                <List className="h-3 w-3" />
                                List
                            </button>
                        </div>

                        <Button
                            size="sm"
                            onClick={() => {
                                setEditingTask(null);
                                setIsCreateOpen(true);
                            }}
                            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white gap-1 text-xs h-7"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            New Task
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Filter by title, chapter, or assignee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 text-xs h-7 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        />
                    </form>

                    <div className="flex items-center gap-2">
                        {categories.length > 0 && (
                            <Select
                                value={filters.category || 'all'}
                                onValueChange={(val) => handleFilterChange('category', val)}
                            >
                                <SelectTrigger className="h-7 text-xs min-w-[130px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        <Select
                            value={filters.priority || 'all'}
                            onValueChange={(val) => handleFilterChange('priority', val)}
                        >
                            <SelectTrigger className="h-7 text-xs min-w-[110px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </header>

            {/* Board / List */}
            <div className="p-4 sm:p-5 flex-1 max-w-7xl w-full mx-auto">
                <MotivationBanner user={auth?.user} />

                {tasks.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-sm mx-auto my-8 space-y-2">
                        <div className="h-8 w-8 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                            <ListTodo className="h-4 w-4" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">No tasks in this view</h3>
                        <Button
                            size="sm"
                            onClick={() => {
                                setEditingTask(null);
                                setIsCreateOpen(true);
                            }}
                            className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs h-7"
                        >
                            Create Task
                        </Button>
                    </div>
                ) : viewMode === 'kanban' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
                        {columns.map((col) => {
                            const colTasks = tasks.filter((t) => t.status === col.id);
                            const IconComponent = col.icon;

                            return (
                                <div
                                    key={col.id}
                                    className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 flex flex-col space-y-2"
                                >
                                    <div className="flex items-center justify-between pb-0.5">
                                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                                            <IconComponent className="h-3.5 w-3.5" />
                                            <span>{col.title}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${col.badgeBg}`}>
                                            {colTasks.length}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {colTasks.map((task) => (
                                            <Card
                                                key={task.id}
                                                onClick={() => {
                                                    setSelectedTask(task);
                                                    setIsDetailOpen(true);
                                                }}
                                                className="cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-all bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-3 space-y-2 shadow-xs"
                                            >
                                                <div className="flex items-start justify-between gap-1">
                                                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate max-w-[130px]">
                                                        {task.category}
                                                    </span>
                                                    {priorityBadge(task.priority)}
                                                </div>

                                                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                                                    {task.title}
                                                </h4>

                                                {/* Workstream Tab Chips */}
                                                {task.tabs_list?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                                        {task.tabs_list.slice(0, 3).map((tab) => (
                                                            <span
                                                                key={tab.id}
                                                                className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                                                            >
                                                                {tab.name} {tab.items?.length > 0 ? `(${tab.items.length})` : ''}
                                                            </span>
                                                        ))}
                                                        {task.tabs_list.length > 3 && (
                                                            <span className="text-[9px] px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium">
                                                                +{task.tabs_list.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Revision preview */}
                                                {task.revision_notes && task.status === 'revisi' && (
                                                    <div className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 p-1 rounded line-clamp-1">
                                                        ⚠️ {task.revision_notes}
                                                    </div>
                                                )}

                                                {/* Date & Link */}
                                                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDateTime(task.due_at)}
                                                    </span>
                                                    {task.link && (
                                                        <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-medium">
                                                            <Link2 className="h-3 w-3" /> Link
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Assignee Footer */}
                                                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarFallback className="text-[8px] bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold">
                                                                {getInitials(task.assignee?.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                                                            {task.assignee?.name}
                                                        </span>
                                                    </div>
                                                    {task.comments?.length > 0 && (
                                                        <span className="text-[9px] text-slate-400">
                                                            💬 {task.comments.length}
                                                        </span>
                                                    )}
                                                </div>
                                            </Card>
                                        ))}

                                        {colTasks.length === 0 && (
                                            <div className="text-center py-4 text-slate-400 dark:text-slate-600 text-[11px] italic">
                                                Empty
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* List View */
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                onClick={() => {
                                    setSelectedTask(task);
                                    setIsDetailOpen(true);
                                }}
                                className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 transition-colors"
                            >
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant="outline" className="text-[9px]">
                                            {task.category}
                                        </Badge>
                                        {priorityBadge(task.priority)}
                                        {task.link && (
                                            <span className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                                                <Link2 className="h-3 w-3" />
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{task.title}</h4>
                                    {task.tabs_list?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-0.5">
                                            {task.tabs_list.slice(0, 3).map((tab) => (
                                                <span
                                                    key={tab.id}
                                                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                                                >
                                                    {tab.name} {tab.items?.length > 0 ? `(${tab.items.length})` : ''}
                                                </span>
                                            ))}
                                            {task.tabs_list.length > 3 && (
                                                <span className="text-[9px] px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium">
                                                    +{task.tabs_list.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <Avatar className="h-5 w-5">
                                            <AvatarFallback className="text-[8px] bg-slate-800 text-white">
                                                {getInitials(task.assignee?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                            {task.assignee?.name}
                                        </span>
                                    </div>
                                    <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 pl-2 border-l border-slate-200 dark:border-slate-800">
                                        {formatDateTime(task.due_at)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <TaskModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                task={editingTask}
                users={users}
                categories={categories}
            />

            <TaskDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                task={tasks.find((t) => t.id === selectedTask?.id) || selectedTask}
                users={users}
                onEdit={(task) => {
                    setEditingTask(task);
                    setIsCreateOpen(true);
                }}
            />
        </AppLayout>
    );
}
