import { useState } from 'react';
import { getRandomQuote } from '@/data/quotes';
import { Quote } from 'lucide-react';

export default function MotivationBanner({ user }) {
    // 1 motivation quote per login session (persists in sessionStorage for this user session)
    const [quote] = useState(() => {
        const storageKey = `marsha_sec_quote_${user?.id || 'guest'}`;
        try {
            const cached = sessionStorage.getItem(storageKey);
            if (cached) return JSON.parse(cached);
            const fresh = getRandomQuote();
            sessionStorage.setItem(storageKey, JSON.stringify(fresh));
            return fresh;
        } catch (e) {
            return getRandomQuote();
        }
    });

    const firstName = user?.name ? user.name.split(' ')[0] : 'Scholar';

    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 shadow-sm border border-slate-800 mb-5">
            {/* Background Marsha Security watermark decoration */}
            <div className="absolute -right-4 -bottom-6 opacity-10 pointer-events-none select-none">
                <img
                    src="/images/marsha-security.png"
                    alt="Marsha Security"
                    className="h-36 w-36 object-contain invert"
                />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    {/* Marsha Security Logo Badge */}
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-black border border-slate-700/80 p-1 flex items-center justify-center shadow-inner">
                        <img
                            src="/images/marsha-security.png"
                            alt="Marsha Security"
                            className="h-full w-full object-contain"
                        />
                    </div>

                    <div className="space-y-0.5">
                        <div className="text-xs uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1.5">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Marsha Security Project Workspace
                        </div>
                        <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                            Welcome back, {firstName}!
                        </h2>
                    </div>
                </div>

                {/* 1 Motivation Quote Display for this login */}
                <div className="flex-1 max-w-xl sm:px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs flex items-center gap-3">
                    <Quote className="h-4 w-4 text-slate-400 shrink-0" />
                    <div className="text-xs text-slate-200">
                        <span className="italic leading-relaxed">"{quote?.text}"</span>
                        <span className="text-[11px] text-slate-400 font-medium ml-2 block sm:inline">
                            — {quote?.author}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
