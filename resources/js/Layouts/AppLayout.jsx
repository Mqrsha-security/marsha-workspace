import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { usePresence } from '@/hooks/usePresence';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import ThemeToggle from '@/components/ThemeToggle';
import PixelOffice from '@/components/PixelOffice';
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
    AppWindow,
    CalendarDays,
    FileText,
    Menu,
    X,
    ExternalLink,
} from 'lucide-react';
import GithubIcon from '@/components/GithubIcon';

export default function AppLayout({ children, currentScope = 'all', counts = {}, currentNav = '' }) {
    const { auth, active_tasks = [] } = usePage().props;
    const user = auth.user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { presenceList, isAditActive, isRistyActive } = usePresence();

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

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
        <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors">
            {/* Mobile Top Header (Android & small screens) */}
            <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-1.5 -ml-1 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                        aria-label="Open navigation menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-black border border-slate-700 p-0.5 flex items-center justify-center shrink-0">
                            <img
                                src="/images/marsha-security.png"
                                alt="Marsha Security"
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                                Marsha Workspace
                            </div>
                            <div className="text-[9px] text-slate-400 truncate max-w-[170px] sm:max-w-xs">
                                Building a system so we can all sleep at night.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <a
                        href="https://github.com/Mqrsha-security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="GitHub Organization: Mqrsha-security"
                        aria-label="GitHub Organization"
                    >
                        <GithubIcon className="h-4 w-4" />
                    </a>
                    <ThemeToggle />
                    <Avatar className="h-7 w-7 border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {user?.photo_url ? (
                            <img
                                src={user.photo_url}
                                alt={user.name}
                                className="h-full w-full object-cover object-top"
                            />
                        ) : (
                            <AvatarFallback className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold">
                                {getInitials(user?.name)}
                            </AvatarFallback>
                        )}
                    </Avatar>
                </div>
            </header>

            {/* Mobile Backdrop Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar (Desktop fixed / Mobile slide-over drawer) */}
            <aside
                className={`w-72 sm:w-80 lg:w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Branding */}
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                        <div className="h-8 w-8 rounded-lg bg-black border border-slate-700 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                            <img
                                src="/images/marsha-security.png"
                                alt="Marsha Security"
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">Marsha Workspace</div>
                            <div className="text-[10px] text-slate-400 leading-tight">Building a system so we can all sleep at night.</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <ThemeToggle className="hidden lg:flex" />
                        <button
                            type="button"
                            onClick={closeMobileMenu}
                            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Close navigation menu"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
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
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Online
                        </span>
                    </div>
                </div>

                {/* Pixel Office Companion Room */}
                <PixelOffice
                    activeTasks={active_tasks}
                    isAditActive={isAditActive}
                    isRistyActive={isRistyActive}
                />

                {/* Navigation Links */}
                <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
                    {/* Workspace */}
                    <div className="space-y-0.5">
                        <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Workspace
                        </div>
                        <Link
                            href={route('tasks.index')}
                            onClick={closeMobileMenu}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                currentScope === 'all' && currentNav !== 'teams' && currentNav !== 'applications' && currentNav !== 'meetings' && currentNav !== 'notes'
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
                                    currentScope === 'all' && currentNav !== 'teams' && currentNav !== 'applications' && currentNav !== 'meetings' && currentNav !== 'notes'
                                        ? 'bg-slate-700 dark:bg-slate-700 text-slate-200'
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                    {counts.total}
                                </span>
                            )}
                        </Link>

                        <Link
                            href={route('tasks.assigned')}
                            onClick={closeMobileMenu}
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
                            onClick={closeMobileMenu}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                currentScope === 'assigned_by_me' && currentNav !== 'teams' && currentNav !== 'applications' && currentNav !== 'meetings'
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
                            href={route('applications.index')}
                            onClick={closeMobileMenu}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                currentNav === 'applications'
                                    ? 'bg-slate-900 dark:bg-slate-800 text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <AppWindow className="h-3.5 w-3.5" />
                                Applications
                            </span>
                            {counts.apps_count !== undefined && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                    currentNav === 'applications'
                                        ? 'bg-slate-700 dark:bg-slate-700 text-slate-200'
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                    {counts.apps_count}
                                </span>
                            )}
                        </Link>
                    </div>

                    <Separator className="dark:bg-slate-800" />

                    {/* Collaboration */}
                    <div className="space-y-0.5">
                        <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Collaboration
                        </div>

                        <Link
                            href={route('meetings.index')}
                            onClick={closeMobileMenu}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                currentNav === 'meetings'
                                    ? 'bg-slate-900 dark:bg-slate-800 text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Meetings
                            </span>
                            {counts.meetings_count !== undefined && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                    currentNav === 'meetings'
                                        ? 'bg-slate-700 dark:bg-slate-700 text-slate-200'
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                    {counts.meetings_count}
                                </span>
                            )}
                        </Link>

                        <Link
                            href={route('notes.index')}
                            onClick={closeMobileMenu}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                currentNav === 'notes'
                                    ? 'bg-slate-900 dark:bg-slate-800 text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5" />
                                Notes
                            </span>
                            {counts.notes_count !== undefined && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                    currentNav === 'notes'
                                        ? 'bg-slate-700 dark:bg-slate-700 text-slate-200'
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                    {counts.notes_count}
                                </span>
                            )}
                        </Link>

                        <Link
                            href={route('teams.index')}
                            onClick={closeMobileMenu}
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
                            onClick={closeMobileMenu}
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
                            onClick={closeMobileMenu}
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
                            onClick={closeMobileMenu}
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
                            onClick={closeMobileMenu}
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
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2">
                    <a
                        href="https://github.com/Mqrsha-security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 transition-colors group"
                        title="Visit Mqrsha Security Organization on GitHub"
                    >
                        <span className="flex items-center gap-2">
                            <GithubIcon className="h-3.5 w-3.5 text-slate-900 dark:text-slate-100" />
                            <span>Mqrsha Security Org</span>
                        </span>
                        <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                    </a>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        onClick={closeMobileMenu}
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-0 lg:ml-64 min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors w-full overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
