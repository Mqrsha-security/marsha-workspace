import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Database, LayoutGrid } from 'lucide-react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Dashboard
                    </h2>
                    <Badge variant="outline" className="flex items-center gap-1 font-mono text-xs">
                        <Sparkles className="h-3 w-3 text-emerald-500" />
                        shadcn/ui Active
                    </Badge>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Stack Status</CardTitle>
                                    <Badge>Online</Badge>
                                </div>
                                <CardDescription>
                                    Laravel 12 + Inertia React + shadcn/ui
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-2">
                                <p>Komponen UI menggunakan standar Tailwind CSS & Radix primitives tanpa AI slop.</p>
                                <div className="flex gap-2 pt-2">
                                    <Badge variant="secondary">Inertia v2</Badge>
                                    <Badge variant="secondary">React 18</Badge>
                                    <Badge variant="secondary">MariaDB</Badge>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button size="sm" className="gap-2">
                                    Explore Components <ArrowRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Database & Vercel</CardTitle>
                                    <Database className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <CardDescription>
                                    Koneksi database & deployment ready
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Siap dihubungkan ke MariaDB lokal atau cloud database (TiDB/Aiven) untuk hosting Vercel.
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" size="sm">
                                    Check Config
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
