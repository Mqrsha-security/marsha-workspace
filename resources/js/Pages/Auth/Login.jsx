import { Head, useForm } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ThemeToggle';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950 px-4 py-8 relative transition-colors">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <Head title="Sign In" />

            <div className="w-full max-w-sm space-y-4">
                <div className="text-center space-y-1.5">
                    <div className="h-14 w-14 mx-auto rounded-2xl bg-black border border-slate-800 p-1 flex items-center justify-center shadow-sm">
                        <img
                            src="/images/marsha-security.png"
                            alt="Marsha Security"
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <div className="space-y-0.5">
                        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            Marsha Security
                        </h1>
                        <p className="text-xs text-slate-500">Project Workspace</p>
                    </div>
                </div>

                <Card className="shadow-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Sign In
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3.5">
                        {status && (
                            <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/50 p-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                                    Email Workspace
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    autoFocus
                                    className="h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-xs text-rose-600">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                    required
                                />
                                {errors.password && (
                                    <p className="text-xs text-rose-600">{errors.password}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-8 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-medium"
                            >
                                {processing ? 'Signing in...' : 'Sign In'}
                                <ArrowRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
