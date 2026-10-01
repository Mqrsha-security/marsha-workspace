import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ShieldCheck,
    Mail,
    ArrowRight,
    Users,
    ListTodo,
} from 'lucide-react';

export default function TeamsIndex({ members = [], counts = {} }) {
    return (
        <AppLayout currentNav="teams" counts={counts}>
            <Head title="Teams" />

            <div className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-5xl mx-auto w-full space-y-5 sm:space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center">
                                <Users className="h-4 w-4" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                Teams Directory
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Core contributors and security responsibility directory
                        </p>
                    </div>

                    <Link href={route('tasks.index')}>
                        <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                            <ListTodo className="h-3.5 w-3.5" />
                            Task Board
                        </Button>
                    </Link>
                </div>

                {/* Team Members List with spacious separate horizontal cards */}
                <div className="space-y-5 sm:space-y-8">
                    {members.map((member) => {
                        const hasRole = Boolean(member.role && member.role.trim() !== '');

                        return (
                            <Card
                                key={member.id}
                                className="overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                            >
                                <div className="p-4 sm:p-6 md:p-7 flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-8">
                                    {/* Standardized Formal Photo Box with breathing room */}
                                    <div className="relative w-40 h-52 sm:w-44 sm:h-56 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 shadow-xs">
                                        {member.photo_url ? (
                                            <img
                                                src={member.photo_url}
                                                alt={member.name}
                                                className="w-full h-full object-cover object-top"
                                                loading="eager"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-2xl">
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content & Details */}
                                    <div className="flex-1 flex flex-col justify-between space-y-4 text-center md:text-left w-full min-w-0">
                                        <div className="space-y-2">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
                                                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                            {member.name}
                                                        </h2>
                                                        {hasRole && (
                                                            <Badge className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold px-2.5 py-0.5 shadow-xs flex items-center gap-1.5">
                                                                <ShieldCheck className="h-3.5 w-3.5 text-blue-400 dark:text-blue-600" />
                                                                {member.role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        <span className="font-mono text-xs">{member.email}</span>
                                                    </div>
                                                </div>

                                                {member.is_active ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 self-center md:self-auto">
                                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        Online Now
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 self-center md:self-auto">
                                                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                                                        {member.last_seen_formatted || 'Offline'}
                                                    </span>
                                                )}
                                            </div>

                                            {hasRole ? (
                                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1 max-w-2xl">
                                                    Responsible for application security architecture, vulnerability assessment, threat modeling, and infrastructure security protocols.
                                                </p>
                                            ) : (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed pt-1 max-w-2xl">
                                                    Core contributor driving project orchestration, timeline coordination, and cross-functional operations.
                                                </p>
                                            )}
                                        </div>

                                        {/* Task Metrics & Action */}
                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-5 text-xs justify-center md:justify-start w-full sm:w-auto">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-slate-400 font-medium">Total Tasks:</span>
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">{member.total_tasks_count ?? 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-blue-500 font-medium">In Progress:</span>
                                                    <span className="font-bold text-blue-700 dark:text-blue-300">{member.active_tasks_count ?? 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-emerald-500 font-medium">Completed:</span>
                                                    <span className="font-bold text-emerald-700 dark:text-emerald-300">{member.completed_tasks_count ?? 0}</span>
                                                </div>
                                            </div>

                                            <Link href={route('tasks.index', { search: member.name })} className="w-full sm:w-auto">
                                                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs gap-1.5 h-8">
                                                    View Tasks
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
