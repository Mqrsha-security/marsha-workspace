import { useState, useEffect, useMemo } from 'react';
import { generateOfficeDialogues } from '@/lib/officeChatPool';

export default function PixelOffice({ activeTasks = [], isAditActive = true, isRistyActive = true }) {
    // Animation frame ticks
    const [tick, setTick] = useState(0);
    const [dialogueIndex, setDialogueIndex] = useState(0);
    const [speaker, setSpeaker] = useState('risty'); // 'adit' | 'risty'
    const [isMuted, setIsMuted] = useState(false);

    // Fast animation tick (for typing, steam, blinking LEDs, floating Zzz)
    useEffect(() => {
        const timer = setInterval(() => {
            setTick((prev) => (prev + 1) % 120);
        }, 400);
        return () => clearInterval(timer);
    }, []);

    const bothActive = Boolean(isAditActive && isRistyActive);

    // Filter dialogues: ONLY generate and show dialogues when BOTH characters are online and awake
    const dialogues = useMemo(() => {
        if (!bothActive) {
            return [];
        }
        return generateOfficeDialogues(activeTasks);
    }, [activeTasks, bothActive]);

    // Dialogue rotation timer
    useEffect(() => {
        if (!bothActive || dialogues.length === 0 || isMuted) {
            setDialogueIndex(0);
            return;
        }

        const dialogueTimer = setInterval(() => {
            setDialogueIndex((prev) => {
                const nextIdx = (prev + 1) % dialogues.length;
                setSpeaker(dialogues[nextIdx]?.speaker || 'risty');
                return nextIdx;
            });
        }, 5500);

        return () => clearInterval(dialogueTimer);
    }, [dialogues, isMuted, bothActive]);

    const hasTasks = activeTasks && activeTasks.length > 0;
    // Current dialogue strictly requires BOTH to be online, tasks present, and not muted
    const currentDialogue = (bothActive && hasTasks && !isMuted && dialogues.length > 0)
        ? dialogues[dialogueIndex % dialogues.length]
        : null;

    // Derived animation frames
    const typingFrame = tick % 2;
    const ledFrame = tick % 4;
    const steamFrame = Math.floor(tick / 2) % 3;
    const screenCodeOffset = (tick * 2) % 8;
    const zOffset = tick % 6;

    return (
        <div className="relative w-full border-b border-slate-200 dark:border-slate-800 bg-[#0c1424] overflow-hidden select-none">
            {/* Header info badge with Live Presence */}
            <div className="px-3 pt-1.5 pb-0.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${isAditActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                        <span className={`text-[9px] font-medium ${isAditActive ? 'text-slate-200' : 'text-slate-500'}`}>
                            Adit:{isAditActive ? 'online' : 'sleep'}
                        </span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${isRistyActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                        <span className={`text-[9px] font-medium ${isRistyActive ? 'text-slate-200' : 'text-slate-500'}`}>
                            Risty:{isRistyActive ? 'online' : 'sleep'}
                        </span>
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMuted((v) => !v)}
                        className="px-1.5 py-0.5 rounded text-[9px] hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title={isMuted ? 'Unmute Office Chat' : (!bothActive ? 'Chat paused while partner is offline' : 'Mute Office Chat')}
                    >
                        {isMuted ? 'chat:off' : (!bothActive ? 'chat:waiting' : 'chat:on')}
                    </button>
                </div>
            </div>

            {/* Speech Bubble */}
            {currentDialogue && (
                <div
                    className={`absolute z-20 transition-all duration-300 pointer-events-none ${
                        currentDialogue.speaker === 'adit'
                            ? 'left-2 top-6'
                            : currentDialogue.speaker === 'risty'
                            ? 'right-2 top-6'
                            : 'left-1/2 -translate-x-1/2 top-5'
                    }`}
                    style={{ maxWidth: '160px' }}
                >
                    <div className="relative bg-white text-slate-900 border-2 border-slate-900 p-1.5 rounded-sm shadow-lg font-mono text-[9px] leading-tight">
                        <div className="font-bold text-[8px] uppercase tracking-wider text-blue-600 mb-0.5">
                            {currentDialogue.speaker === 'adit'
                                ? 'Aditya'
                                : currentDialogue.speaker === 'risty'
                                ? 'Fahristi'
                                : 'Office Sleeping'}
                        </div>
                        <div className="font-medium line-clamp-3 text-slate-900">
                            {currentDialogue.text}
                        </div>
                        {currentDialogue.speaker !== 'none' && (
                            <div
                                className={`absolute -bottom-1.5 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900 ${
                                    currentDialogue.speaker === 'adit' ? 'left-6' : 'right-6'
                                }`}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Retro Pixel Office Scene (Crisp SVG) */}
            <svg
                viewBox="0 0 240 120"
                className="w-full h-auto block"
                style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
            >
                {/* Background Wall */}
                <rect x="0" y="0" width="240" height="85" fill="#0c1424" />

                {/* Wall Paneling horizontal accent */}
                <rect x="0" y="35" width="240" height="1" fill="#18233a" />
                <rect x="0" y="60" width="240" height="1" fill="#18233a" />

                {/* Wall Clock */}
                <rect x="114" y="10" width="12" height="12" fill="#1e293b" rx="1" />
                <rect x="116" y="12" width="8" height="8" fill="#f8fafc" />
                <rect x="119" y="15" width="2" height="3" fill="#0f172a" />
                <rect x="119" y="15" width="3" height="1" fill="#ef4444" />

                {/* Server Rack (Center Back) */}
                <rect x="98" y="24" width="44" height="61" fill="#111827" />
                <rect x="100" y="26" width="40" height="57" fill="#1f2937" />
                {/* Server Units */}
                {[0, 1, 2, 3].map((unit) => (
                    <g key={unit}>
                        <rect x="102" y={28 + unit * 14} width="36" height="11" fill="#111827" />
                        <rect x="104" y={30 + unit * 14} width="22" height="2" fill="#374151" />
                        {/* Blinking LEDs */}
                        <rect
                            x="130"
                            y={31 + unit * 14}
                            width="2"
                            height="2"
                            fill={ledFrame === unit % 4 ? '#22c55e' : '#14532d'}
                        />
                        <rect
                            x="133"
                            y={31 + unit * 14}
                            width="2"
                            height="2"
                            fill={ledFrame === (unit + 1) % 4 ? '#38bdf8' : '#0369a1'}
                        />
                        <rect
                            x="130"
                            y={34 + unit * 14}
                            width="2"
                            height="2"
                            fill={ledFrame === (unit + 2) % 4 ? '#eab308' : '#713f12'}
                        />
                        <rect
                            x="133"
                            y={34 + unit * 14}
                            width="2"
                            height="2"
                            fill={ledFrame === (unit + 3) % 4 ? '#ec4899' : '#831843'}
                        />
                    </g>
                ))}

                {/* Office Floor */}
                <rect x="0" y="85" width="240" height="35" fill="#172237" />
                {/* Parquet floor tiles */}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <rect key={i} x={i * 35} y="85" width="1" height="35" fill="#10192a" />
                ))}
                <rect x="0" y="102" width="240" height="1" fill="#10192a" />

                {/* Potted Plant in Corner */}
                <rect x="8" y="74" width="12" height="12" fill="#b45309" />
                <rect x="6" y="72" width="16" height="3" fill="#92400e" />
                {/* Leaves */}
                <rect x="10" y="65" width="4" height="7" fill="#16a34a" />
                <rect x="7" y="61" width="5" height="5" fill="#22c55e" />
                <rect x="13" y="58" width="6" height="6" fill="#15803d" />
                <rect x="10" y="55" width="5" height="5" fill="#4ade80" />

                {/* ================= LEFT DESK: ADITYA (Security Architect) ================= */}
                {/* Desk chair */}
                <rect x="42" y="66" width="12" height="16" fill="#1e293b" />
                <rect x="44" y="82" width="8" height="6" fill="#0f172a" />

                {/* Aditya Character State: Awake Working vs Sleeping */}
                {isAditActive ? (
                    <g>
                        {/* Head */}
                        <rect x="43" y="53" width="10" height="10" fill="#fbcfe8" />
                        {/* Hair */}
                        <rect x="42" y="50" width="12" height="4" fill="#09090b" />
                        <rect x="41" y="52" width="2" height="4" fill="#09090b" />
                        {/* Glasses / Eyes */}
                        <rect x="49" y="56" width="3" height="2" fill="#09090b" />
                        <rect x="50" y="56" width="1" height="1" fill="#38bdf8" />
                        {/* Suit body */}
                        <rect x="40" y="63" width="16" height="14" fill="#09090b" />
                        {/* White shirt & tie */}
                        <rect x="47" y="63" width="2" height="7" fill="#ffffff" />
                        <rect x="47" y="65" width="2" height="5" fill="#2563eb" />
                        {/* Animated typing hands */}
                        <rect
                            x="54"
                            y={69 + (typingFrame === 0 ? 0 : 2)}
                            width="4"
                            height="3"
                            fill="#fbcfe8"
                        />
                        {/* Monitor Screen with Matrix Code */}
                        <rect x="60" y="60" width="14" height="11" fill="#022c22" />
                        <rect x="61" y={61 + (screenCodeOffset % 4)} width="8" height="1" fill="#22c55e" />
                        <rect x="61" y={64 + (screenCodeOffset % 4)} width="11" height="1" fill="#4ade80" />
                        <rect x="61" y={67 + (screenCodeOffset % 4)} width="6" height="1" fill="#86efac" />
                    </g>
                ) : (
                    <g>
                        {/* SLEEPING ADIT */}
                        {/* Slumped head */}
                        <rect x="44" y="63" width="12" height="9" fill="#fbcfe8" rx="1" />
                        {/* Hair */}
                        <rect x="42" y="61" width="13" height="4" fill="#09090b" rx="1" />
                        {/* Closed Eyes */}
                        <rect x="49" y="67" width="3" height="1" fill="#09090b" />
                        {/* Slumped Suit */}
                        <rect x="40" y="69" width="16" height="10" fill="#09090b" />
                        {/* Folded resting hands */}
                        <rect x="50" y="74" width="7" height="3" fill="#fbcfe8" />
                        {/* Standby Dark Monitor */}
                        <rect x="60" y="60" width="14" height="11" fill="#06121e" />
                        <rect x="65" y="64" width="4" height="2" fill="#334155" />
                        {/* Animated Floating Zzz */}
                        <g opacity={0.95}>
                            <text x={49 - (zOffset % 3)} y={49 - zOffset} fill="#93c5fd" fontSize="4.5" fontFamily="monospace" fontWeight="bold">
                                Z
                            </text>
                            <text x={54 - ((zOffset + 1) % 3)} y={44 - zOffset} fill="#60a5fa" fontSize="3.5" fontFamily="monospace" fontWeight="bold">
                                z
                            </text>
                            <text x={58 - ((zOffset + 2) % 3)} y={39 - zOffset} fill="#3b82f6" fontSize="2.8" fontFamily="monospace" fontWeight="bold">
                                z
                            </text>
                        </g>
                    </g>
                )}

                {/* Aditya's Desk */}
                <rect x="30" y="77" width="48" height="4" fill="#94a3b8" />
                <rect x="32" y="81" width="44" height="16" fill="#64748b" />
                <rect x="33" y="97" width="4" height="8" fill="#475569" />
                <rect x="71" y="97" width="4" height="8" fill="#475569" />

                {/* Aditya's Terminal Monitor Frame */}
                <rect x="58" y="58" width="18" height="15" fill="#0f172a" rx="1" />
                <rect x="65" y="73" width="4" height="4" fill="#334155" />
                <rect x="63" y="76" width="8" height="1" fill="#334155" />

                {/* Keyboard & Mousepad */}
                <rect x="52" y="76" width="9" height="2" fill="#1e293b" />
                <rect x="63" y="76" width="3" height="2" fill="#0284c7" />

                {/* Coffee Mug */}
                <rect x="34" y="73" width="4" height="4" fill="#ffffff" />
                <rect x="38" y="74" width="1" height="2" fill="#ffffff" />
                {isAditActive && (
                    <>
                        <rect
                            x="35"
                            y={70 - steamFrame}
                            width="1"
                            height="2"
                            fill="#94a3b8"
                            opacity="0.8"
                        />
                        <rect
                            x="37"
                            y={68 - steamFrame}
                            width="1"
                            height="2"
                            fill="#cbd5e1"
                            opacity="0.6"
                        />
                    </>
                )}

                {/* Nameplate: ADIT */}
                <rect x="35" y="80" width="14" height="3" fill="#0f172a" />
                <text x="36" y="82.5" fill="#93c5fd" fontSize="2.5" fontFamily="monospace" fontWeight="bold">
                    ADIT
                </text>

                {/* ================= RIGHT DESK: FAHRISTI (Project Manager) ================= */}
                {/* Desk chair */}
                <rect x="186" y="66" width="12" height="16" fill="#1e293b" />
                <rect x="188" y="82" width="8" height="6" fill="#0f172a" />

                {/* Fahristi Character State: Awake Working vs Sleeping */}
                {isRistyActive ? (
                    <g>
                        {/* Head / Face */}
                        <rect x="187" y="54" width="10" height="9" fill="#fed7aa" />
                        {/* Hijab wrap */}
                        <rect x="185" y="49" width="14" height="6" fill="#6366f1" />
                        <rect x="184" y="53" width="3" height="11" fill="#6366f1" />
                        <rect x="195" y="53" width="3" height="11" fill="#6366f1" />
                        <rect x="185" y="62" width="14" height="4" fill="#4f46e5" />
                        {/* Eyes */}
                        <rect x="188" y="57" width="2" height="2" fill="#0f172a" />
                        <rect x="189" y="57" width="1" height="1" fill="#ffffff" />
                        {/* Formal office blazer */}
                        <rect x="184" y="65" width="16" height="12" fill="#334155" />
                        <rect x="190" y="65" width="4" height="7" fill="#f8fafc" />
                        {/* Animated hands typing */}
                        <rect
                            x="180"
                            y={69 + (typingFrame === 1 ? 0 : 2)}
                            width="4"
                            height="3"
                            fill="#fed7aa"
                        />
                        {/* Monitor Screen with Kanban / Project Boards */}
                        <rect x="166" y="60" width="14" height="11" fill="#1e1b4b" />
                        <rect x="168" y="62" width="3" height="3" fill="#818cf8" />
                        <rect x="172" y="62" width="3" height="5" fill="#38bdf8" />
                        <rect x="176" y="62" width="3" height="4" fill="#34d399" />
                        <rect x="168" y="66" width="3" height="3" fill="#fbbf24" />
                    </g>
                ) : (
                    <g>
                        {/* SLEEPING RISTY */}
                        {/* Leaning Hijab */}
                        <rect x="183" y="60" width="15" height="10" fill="#6366f1" rx="1" />
                        {/* Leaning face */}
                        <rect x="185" y="64" width="9" height="7" fill="#fed7aa" />
                        {/* Closed Eyes */}
                        <rect x="186" y="67" width="3" height="1" fill="#0f172a" />
                        {/* Slumped Blazer */}
                        <rect x="182" y="69" width="16" height="9" fill="#334155" />
                        {/* Folded resting hands */}
                        <rect x="177" y="74" width="7" height="3" fill="#fed7aa" />
                        {/* Standby Dark Monitor */}
                        <rect x="166" y="60" width="14" height="11" fill="#110e24" />
                        <rect x="171" y="64" width="4" height="2" fill="#334155" />
                        {/* Animated Floating Zzz */}
                        <g opacity={0.95}>
                            <text x={194 + (zOffset % 3)} y={49 - zOffset} fill="#c084fc" fontSize="4.5" fontFamily="monospace" fontWeight="bold">
                                Z
                            </text>
                            <text x={198 + ((zOffset + 1) % 3)} y={44 - zOffset} fill="#a855f7" fontSize="3.5" fontFamily="monospace" fontWeight="bold">
                                z
                            </text>
                            <text x={202 + ((zOffset + 2) % 3)} y={39 - zOffset} fill="#9333ea" fontSize="2.8" fontFamily="monospace" fontWeight="bold">
                                z
                            </text>
                        </g>
                    </g>
                )}

                {/* Fahristi's Desk */}
                <rect x="162" y="77" width="48" height="4" fill="#94a3b8" />
                <rect x="164" y="81" width="44" height="16" fill="#64748b" />
                <rect x="165" y="97" width="4" height="8" fill="#475569" />
                <rect x="203" y="97" width="4" height="8" fill="#475569" />

                {/* Fahristi's Task Monitor Frame */}
                <rect x="164" y="58" width="18" height="15" fill="#0f172a" rx="1" />
                <rect x="171" y="73" width="4" height="4" fill="#334155" />
                <rect x="169" y="76" width="8" height="1" fill="#334155" />

                {/* Keyboard & Notebook */}
                <rect x="179" y="76" width="9" height="2" fill="#1e293b" />
                <rect x="191" y="75" width="6" height="3" fill="#cbd5e1" />
                <rect x="192" y="76" width="4" height="1" fill="#64748b" />

                {/* Coffee Mug for Risty */}
                <rect x="202" y="73" width="4" height="4" fill="#ec4899" />
                <rect x="206" y="74" width="1" height="2" fill="#ec4899" />
                {isRistyActive && (
                    <>
                        <rect
                            x="203"
                            y={70 - steamFrame}
                            width="1"
                            height="2"
                            fill="#94a3b8"
                            opacity="0.8"
                        />
                    </>
                )}

                {/* Nameplate: RISTY */}
                <rect x="190" y="80" width="16" height="3" fill="#0f172a" />
                <text x="191" y="82.5" fill="#c084fc" fontSize="2.5" fontFamily="monospace" fontWeight="bold">
                    RISTY
                </text>

                {/* Office Activity Indicator footer line */}
                <rect x="0" y="119" width="240" height="1" fill="#0f172a" />
            </svg>
        </div>
    );
}
