import { Link, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import ThemeToggle from '@/components/ThemeToggle';
import {
    GraduationCap,
    CheckCircle2,
    Clock,
    AlertCircle,
    ListTodo,
    UserCheck,
    Send,
    LogOut,
    LayoutDashboard,
    Users,
} from 'lucide-react';

export default function AppLayout({ children, currentScope = 'all', counts = {}, currentNav = '' }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed inset-y-0 left-0 z-30 transition-colors">
                {/* Branding */}
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-black border border-slate-700 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                            <img
                                src="/images/marsha-security.png"
                                alt="Marsha Security"
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <div>
                            <div className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100">Marsha Workspace</div>
                            <div className="text-[10px] text-slate-400">Security Engineering</div>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>

                {/* User info */}
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
                    <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 overflow-hidden">
                            {user?.photo_url ? (
                                <img
                                    src={user.photo_url}
                                    alt={user.name}
                                    className="h-full w-full object-cover object-top"
                                />
                            ) : (
                                <AvatarFallback className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold">
                                    {getInitials(user?.name)}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <div className="overflow-hidden">
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={user?.name}>
                                {user?.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate" title={user?.email}>
                                {user?.email}
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        {user?.role && user.role.trim() !== '' && (
                            <Badge
                                variant="secondary"
                                className="text-[9px] font-semibold tracking-wide px-1.5 py-0 bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300"
                            >
                                {user.role}
                            </Badge>
                        )}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">• Active</span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
                    {/* Workspace */}
                    <div className="space-y-0.5">
                        <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Workspace
                        </div>
                        <Link
                            href={route('tasks.index')}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                currentScope === 'all' && currentNav !== 'teams'
                                    ? 'bg-slate-900 dark:bg-slate-800 text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <LayoutDashboard className="h-3.5 w-3.5" />
                                All Tasks
                            </span>
                            {counts.total !== undefined && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                    currentScope === 'all'
                                        ? 'bg-slate-700 dark:bg-slate-700 text-slate-200'
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                    {counts.total}
                                </span>
                            )}
                        </Link>

                        <Link
                            href={route('tasks.assigned')}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                currentScope === 'assigned_to_me'
                                    ? 'bg-slate-900 dark:bg-slate-800 text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <UserCheck className="h-3.5 w-3.5" />
                                My Tasks
                            </span>
                            {counts.my_tasks !== undefined && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                                    {counts.my_tasks}
                                </span>
                            )}
                        </Link>

                        <Link
                            href={route('tasks.created')}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                currentScope === 'assigned_by_me' && currentNav !== 'teams'
                                    ? 'bg-slate-900 dark:bg-slate-800 text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <Send className="h-3.5 w-3.5" />
                                Created by Me
                            </span>
                        </Link>

                        <Link
                            href={route('teams.index')}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                currentNav === 'teams'
                                    ? 'bg-slate-900 dark:bg-slate-800 text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <Users className="h-3.5 w-3.5" />
                                Teams
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                2
                            </span>
                        </Link>
                    </div>

                    <Separator className="dark:bg-slate-800" />

                    {/* Status filter shortcuts */}
                    <div className="space-y-0.5">
                        <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Status
                        </div>

                        <Link
                            href={route('tasks.index', { status: 'revisi' })}
                            className="flex items-center justify-between px-2.5 py-1 rounded-md text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                        >
                            <span className="flex items-center gap-2">
                                <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500" />
                                In Revision
                            </span>
                            <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 rounded-full">
                                {counts.revisi ?? 0}
                            </span>
                        </Link>

                        <Link
                            href={route('tasks.index', { status: 'in_progress' })}
                            className="flex items-center justify-between px-2.5 py-1 rounded-md text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        >
                            <span className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
                                In Progress
                            </span>
                            <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-1.5 rounded-full">
                                {counts.in_progress ?? 0}
                            </span>
                        </Link>

                        <Link
                            href={route('tasks.index', { status: 'todo' })}
                            className="flex items-center justify-between px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <span className="flex items-center gap-2">
                                <ListTodo className="h-3.5 w-3.5 text-slate-400" />
                                Todo
                            </span>
                            <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 rounded-full">
                                {counts.todo ?? 0}
                            </span>
                        </Link>

                        <Link
                            href={route('tasks.index', { status: 'done' })}
                            className="flex items-center justify-between px-2.5 py-1 rounded-md text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        >
                            <span className="flex items-center gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
                                Completed
                            </span>
                            <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 rounded-full">
                                {counts.done ?? 0}
                            </span>
                        </Link>
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
                {children}
            </main>
        </div>
    );
}
