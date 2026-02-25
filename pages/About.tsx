import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { PersonalityMode } from '../content/types';

export const About: React.FC = () => {
    const { personality } = useAppStore();
    const isExtrovert = personality === PersonalityMode.EXTROVERT;

    const theme = isExtrovert ? {
        text: 'text-amber-400',
        lineBorder: 'border-amber-400/20',
        bgHover: 'hover:bg-amber-400/10',
        glow: 'drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]',
        caret: 'bg-amber-400',
        baseColor: 'rgba(251,191,36,', // For programmatic alpha
        scanline: 'rgba(251,191,36,0.05)'
    } : {
        text: 'text-cyan-400',
        lineBorder: 'border-cyan-400/20',
        bgHover: 'hover:bg-cyan-400/10',
        glow: 'drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]',
        caret: 'bg-cyan-400',
        baseColor: 'rgba(34,211,238,',
        scanline: 'rgba(34,211,238,0.05)'
    };

    // Minimalist Encrypted Beacon Sequence State
    const [historyGroups, setHistoryGroups] = useState<{ id: string, text: string, type: 'boot' | 'ascii' | 'data' | 'log' | 'menu' }[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        setIsComplete(false);
        setHistoryGroups([]);
        let isCancelled = false;

        const typeSequence = async () => {
            const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

            const sequence: { text: string, type: 'boot' | 'ascii' | 'data' | 'log' | 'menu', preDelay: number, typeSpeed: number }[] = [
                { text: "[  OK  ] Started User Login Management.", type: 'boot', preDelay: 20, typeSpeed: 3 },
                { text: "[  OK  ] Reached target Network is Online.", type: 'boot', preDelay: 40, typeSpeed: 3 },
                { text: "[  OK  ] Started OpenBSD Secure Shell server.", type: 'boot', preDelay: 20, typeSpeed: 3 },
                { text: "         Starting Update UTMP about System Runlevel Changes...", type: 'boot', preDelay: 80, typeSpeed: 4 },
                { text: "[  OK  ] Finished Update UTMP about System Runlevel Changes.", type: 'boot', preDelay: 100, typeSpeed: 4 },
                { text: " ", type: 'log', preDelay: 30, typeSpeed: 0 },
                { text: "=======================================================", type: 'ascii', preDelay: 20, typeSpeed: 0 },
                { text: "          ██████╗ ███████╗████████╗███████╗██████╗     ", type: 'ascii', preDelay: 15, typeSpeed: 0 },
                { text: "          ██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗    ", type: 'ascii', preDelay: 15, typeSpeed: 0 },
                { text: "          ██████╔╝█████╗     ██║   █████╗  ██████╔╝    ", type: 'ascii', preDelay: 15, typeSpeed: 0 },
                { text: "          ██╔═══╝ ██╔══╝     ██║   ██╔══╝  ██╔══██╗    ", type: 'ascii', preDelay: 15, typeSpeed: 0 },
                { text: "          ██║     ███████╗   ██║   ███████╗██║  ██║    ", type: 'ascii', preDelay: 15, typeSpeed: 0 },
                { text: "          ╚═╝     ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝    ", type: 'ascii', preDelay: 15, typeSpeed: 0 },
                { text: "=======================================================", type: 'ascii', preDelay: 15, typeSpeed: 0 },
                { text: " ", type: 'log', preDelay: 80, typeSpeed: 0 },
                { text: "SYSTEM ARCH: x86_64 / DEBIAN 12", type: 'data', preDelay: 40, typeSpeed: 8 },
                { text: "DESIGNATION: SYS_ADMIN / ARCHITECT", type: 'data', preDelay: 40, typeSpeed: 8 },
                { text: " ", type: 'log', preDelay: 40, typeSpeed: 0 },
                { text: "Last login: System boot from /dev/nvme0n1p2", type: 'log', preDelay: 200, typeSpeed: 6 },
                { text: " ", type: 'log', preDelay: 40, typeSpeed: 0 },
                { text: "user@void_vault:~$ cd /bin/directives && ls -l", type: 'log', preDelay: 300, typeSpeed: 20 },
                { text: "-rwxr-xr-x 1 root peter 4096 Feb 22 23:45 GITHUB_REPO", type: 'menu', preDelay: 200, typeSpeed: 3 }
            ];

            for (const item of sequence) {
                if (isCancelled) return;
                await wait(item.preDelay);
                if (isCancelled) return;

                const id = Math.random().toString();
                setHistoryGroups(prev => [...prev, { id, text: '', type: item.type }]);

                let i = 0;
                while (i <= item.text.length) {
                    if (isCancelled) return;

                    const currentIndex = i;
                    setHistoryGroups(prev => {
                        const next = [...prev];
                        next[next.length - 1].text = item.text.substring(0, currentIndex);
                        (next[next.length - 1] as any)._targetLength = item.text.length;
                        return next;
                    });

                    if (i >= item.text.length) break;

                    if (item.typeSpeed > 0) {
                        // Breathing rhythm: smoothly variable typing speed
                        // Calculate progress from 0.0 to 1.0
                        const progress = item.text.length > 0 ? (i / item.text.length) : 1;

                        // Sine wave creating a "breath": slow at start, fast in middle, slow at end
                        // Math.sin(progress * Math.PI) is 0 at both edges, and 1 at progress=0.5
                        const breath = Math.sin(progress * Math.PI);

                        // When breath is 1 (middle), multiplier is low (e.g. 0.1) -> faster speed
                        // When breath is 0 (edges), multiplier is high (e.g. 1.0) -> slower speed
                        const dynamicMultiplier = 0.1 + 0.9 * (1 - breath);

                        // Add some organic jitter so it doesn't look too perfectly mathematical
                        const jitter = 0.7 + Math.random() * 0.6; // 0.7 to 1.3

                        const targetDelay = item.typeSpeed * dynamicMultiplier * jitter;

                        // Because browsers throttle setTimeout down to ~4ms minimum, 
                        // we can simulate faster-than-4ms typing by chunking multiple characters at once
                        if (targetDelay < 3) {
                            const chunk = Math.floor(4 - targetDelay);
                            i += chunk;
                            if (i > item.text.length) i = item.text.length;
                            await wait(1); // Smallest possible yield
                        } else {
                            i++;
                            await wait(targetDelay);
                        }
                    } else {
                        // For item.typeSpeed === 0, display instantly (just like ASCII art)
                        i = item.text.length;
                    }
                }
            }

            if (isCancelled) return;
            await wait(200);
            if (!isCancelled) setIsComplete(true);
        };

        typeSequence();

        return () => { isCancelled = true; };
    }, [isExtrovert]); // Restart on toggle

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative z-10 pointer-events-none -mt-20">
            {/* ↕️ 垂直位置调节 (VERTICAL POSITION): 调节上方 className 里的 -mt-20 来控制整体文字的上下高度。
                - 往上移：改成 -mt-40, -mt-60 等更大的负数
                - 往下移：改成 -mt-0, mt-10, mt-20 等 */}

            {/* ↔️ 水平位置调节 (HORIZONTAL POSITION) : 调节这里的 ml-[10vw] 控制整体左右位置 */}
            <div className={`relative pointer-events-auto holographic-plane px-4 sm:px-8 flex flex-col items-start w-[800px] ml-[10vw]`}>

                {/* THE TERMINAL UI BORDERLESS MESH */}
                <div className="relative p-6 sm:p-8 min-h-[300px] w-full mt-4 scale-[0.85] origin-left">

                    {/* Fine Scanlines - kept for minimal terminal feel */}
                    <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.15] mix-blend-overlay"
                        style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${theme.scanline} 2px, ${theme.scanline} 4px)` }}>
                    </div>

                    {/* TEXT CONTENT */}
                    <div className={`font-mono text-sm md:text-[15px] leading-relaxed ${theme.text} relative z-20 select-none`}>

                        <div className="space-y-[2px] mb-8 text-left w-full overflow-x-auto overflow-y-hidden custom-scrollbar pb-2">
                            {historyGroups.map((group, index) => {
                                let colorClass = '';
                                if (group.type === 'boot') colorClass = 'text-gray-300';
                                if (group.type === 'ascii') colorClass = `${theme.text} font-bold tracking-widest`;
                                if (group.type === 'data') colorClass = 'text-white font-semibold';
                                if (group.type === 'log') colorClass = 'text-gray-400/90';
                                if (group.type === 'menu') colorClass = `text-gray-300`;

                                // Render the typed text as a normal line, or as a clickable link if it's a menu and complete
                                let content: React.ReactNode = group.text;

                                // Style [  OK  ] in boot sequences
                                if (group.type === 'boot' && group.text.startsWith('[  OK  ]')) {
                                    content = (
                                        <>
                                            <span className="text-white">[  </span>
                                            <span className="text-green-500 font-bold">OK</span>
                                            <span className="text-white">  ]</span>
                                            {group.text.substring(8)}
                                        </>
                                    );
                                }

                                if (group.type === 'menu' && group.text.length === (group as any)._targetLength && isComplete) {
                                    const isGithub = group.text.includes('GITHUB_REPO');

                                    if (isGithub) {
                                        content = (
                                            <a href="https://github.com/peteroooooooo" target="_blank" rel="noopener noreferrer"
                                                className={`hover:text-white ${theme.text} transition-colors cursor-pointer group`}>
                                                <span className="text-gray-300 group-hover:text-white transition-colors">-rwxr-xr-x 1 root peter 4096 Feb 22 23:45 </span>
                                                <span className="font-bold underline decoration-1 underline-offset-4">GITHUB_REPO</span>
                                            </a>
                                        );
                                    }
                                }

                                return (
                                    <div key={group.id} className={`${colorClass} whitespace-pre min-w-max leading-tight`}>
                                        {content}
                                        {index === historyGroups.length - 1 && !isComplete && (
                                            <span className={`inline-block w-[0.6em] h-[1em] align-middle ml-1 -mt-1 ${theme.caret} animate-[blink_1s_step-end_infinite]`}></span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {isComplete && (
                            <div className="mt-4 flex items-center min-w-max">
                                <span className={`text-white`}>user@void_vault:</span><span className="text-[#3b82f6]">/bin/directives</span><span className="text-white">$</span>
                                <span className={`ml-2 w-[0.6em] h-[1em] ${theme.caret} inline-block animate-[blink_1s_step-end_infinite]`}></span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                @keyframes sweep {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .holographic-plane {
                    animation: holofloat 6s ease-in-out infinite;
                }
                /* Very subtle organic floating */
                @keyframes holofloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-6px); }
                }
            `}</style>
        </div>
    );
};