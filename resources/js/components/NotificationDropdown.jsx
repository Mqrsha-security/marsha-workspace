import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Bell,
    UserPlus,
    MessageSquare,
    ArrowRightLeft,
    CheckCheck,
    Clock,
} from 'lucide-react';

export default function NotificationDropdown({ onSelectTask }) {
    const { auth } = usePage().props;
    const notifications = auth?.notifications || [];
    const unreadCount = auth?.unread_notifications_count || 0;
    const [open, setOpen] = useState(false);

    const handleMarkAsRead = (id, taskId, e) => {
        e.stopPropagation();
        router.post(route('notifications.read', id), {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                if (taskId && onSelectTask) {
                    onSelectTask(taskId);
                    setOpen(false);
                }
            },
        });
    };

    const handleMarkAllAsRead = (e) => {
        e.preventDefault();
        router.post(route('notifications.readAll'), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getIcon = (type) => {
        switch (type) {
            case 'task_assigned':
                return <UserPlus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
            case 'task_reassigned':
                return <ArrowRightLeft className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />;
            case 'comment_added':
                return <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
            default:
                return <Bell className="h-3.5 w-3.5 text-slate-500 shrink-0" />;
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="relative h-8 w-8 p-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    title="Notifications"
                >
                    <Bell className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-80 sm:w-96 p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg text-slate-900 dark:text-slate-100"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">Notifications</span>
                        {unreadCount > 0 && (
                            <Badge className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] h-4 px-1.5 font-bold">
                                {unreadCount} new
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                            <CheckCheck className="h-3 w-3" />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet.
                        </div>
                    ) : (
                        notifications.map((item) => (
                            <div
                                key={item.id}
                                onClick={(e) => handleMarkAsRead(item.id, item.task_id, e)}
                                className={`p-3 text-xs cursor-pointer transition-colors flex items-start gap-2.5 ${
                                    item.is_read
                                        ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        : 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/40'
                                }`}
                            >
                                <div className="mt-0.5 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                                    {getIcon(item.type)}
                                </div>
                                <div className="flex-1 min-w-0 space-y-0.5">
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                            {item.title}
                                        </span>
                                        {!item.is_read && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                                        {item.message}
                                    </p>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-0.5">
                                        <Clock className="h-2.5 w-2.5" />
                                        {formatTime(item.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
