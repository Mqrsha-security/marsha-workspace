import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ShieldCheck,
    Mail,
    CheckCircle2,
    Clock,
    ListTodo,
    ArrowRight,
    Users,
} from 'lucide-react';

export default function TeamsIndex({ members = [], counts = {} }) {
    return (
        <AppLayout currentNav="teams" counts={counts}>
            <Head title="Teams" />

            <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center">
                                <Users className="h-4 w-4" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                Teams
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Struktur anggota tim dan penanggung jawab di Marsha Security Workspace
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('tasks.index')}>
                            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                                <ListTodo className="h-3.5 w-3.5" />
                                Task Board
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Team Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {members.map((member) => {
                        const hasRole = Boolean(member.role && member.role.trim() !== '');

                        return (
                            <Card
                                key={member.id}
                                className="overflow-hidden border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                            >
                                {/* Photo Container with standardized 4:5 aspect ratio */}
                                <div className="relative w-full aspect-[4/5] max-h-[420px] bg-slate-100 dark:bg-slate-950 overflow-hidden group">
                                    {member.photo_url ? (
                                        <img
                                            src={member.photo_url}
                                            alt={member.name}
                                            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                                            loading="eager"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-3xl">
                                            {member.name.charAt(0)}
                                        </div>
                                    )}

                                    {/* Top overlay badge if role exists */}
                                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                                        {hasRole ? (
                                            <Badge className="bg-slate-900/90 backdrop-blur-sm text-white border-0 text-[11px] font-semibold px-2.5 py-1 shadow-sm flex items-center gap-1.5">
                                                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                                                {member.role}
                                            </Badge>
                                        ) : (
                                            <div />
                                        )}
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/90 text-white backdrop-blur-sm shadow-xs">
                                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                            Active
                                        </span>
                                    </div>
                                </div>

                                {/* Details & Info */}
                                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                                                    {member.name}
                                                </h2>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="font-mono text-[11px]">{member.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {hasRole ? (
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                                                Bertanggung jawab pada perancangan arsitektur keamanan, mitigasi celah, dan standar implementasi sistem.
                                            </p>
                                        ) : (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed pt-1">
                                                Kontributor utama dalam koordinasi pengerjaan dan delivery sistem Marsha Security.
                                            </p>
                                        )}
                                    </div>

                                    {/* Task Metrics */}
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
                                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Total</div>
                                            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                                {member.total_tasks_count ?? 0}
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/40">
                                            <div className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400 tracking-wider">Berjalan</div>
                                            <div className="text-sm font-bold text-blue-700 dark:text-blue-300 mt-0.5">
                                                {member.active_tasks_count ?? 0}
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40">
                                            <div className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider">Selesai</div>
                                            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                                                {member.completed_tasks_count ?? 0}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Button */}
                                    <div className="pt-1">
                                        <Link
                                            href={route('tasks.index', { search: member.name })}
                                            className="w-full block"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-xs justify-center gap-1.5 h-8 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                                            >
                                                Lihat Task Terkait
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
