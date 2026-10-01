import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Heart } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return (
                localStorage.getItem('theme') ||
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            );
        }
        return 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark', 'pink');

        if (theme === 'dark') {
            root.classList.add('dark');
        } else if (theme === 'pink') {
            root.classList.add('pink');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    const cycleTheme = () => {
        setTheme((prev) => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'pink';
            return 'light';
        });
    };

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={cycleTheme}
            className={`h-8 w-8 p-0 rounded-lg transition-colors ${
                theme === 'pink'
                    ? 'border-pink-300 bg-pink-50 text-pink-600 hover:bg-pink-100'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            } ${className}`}
            title={
                theme === 'light'
                    ? 'Light Mode (klik untuk Dark Mode)'
                    : theme === 'dark'
                    ? 'Dark Mode (klik untuk Pink Mode)'
                    : 'Pink Pastel Mode (klik untuk Light Mode)'
            }
        >
            {theme === 'light' && <Sun className="h-4 w-4 text-amber-500" />}
            {theme === 'dark' && <Moon className="h-4 w-4 text-slate-400" />}
            {theme === 'pink' && <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />}
        </Button>
    );
}
