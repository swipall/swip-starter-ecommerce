'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { CmsPost } from '@/lib/swipall/types/types';

type Phase = 'idle' | 'out' | 'reset';

const INTERVAL_MS = 3500;
const TRANSITION_MS = 300;

export function CompanyInfoCarousel({ items }: { items: CmsPost[] }) {
    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>('idle');

    useEffect(() => {
        if (items.length <= 1) return;

        const id = setInterval(() => {
            setPhase('out');
            setTimeout(() => {
                setIndex(i => (i + 1) % items.length);
                setPhase('reset');
            }, TRANSITION_MS);
            setTimeout(() => {
                setPhase('idle');
            }, TRANSITION_MS + 30);
        }, INTERVAL_MS);

        return () => clearInterval(id);
    }, [items.length]);

    const cls: Record<Phase, string> = {
        idle:  'transition-all duration-300 opacity-100 translate-y-0',
        out:   'transition-all duration-300 opacity-0 -translate-y-2',
        reset: 'transition-none opacity-0 translate-y-2',
    };

    const item = items[index];
    if (!item) return null;

    return (
        <div className="overflow-hidden flex justify-center">
            <div className={`flex items-center gap-3 ${cls[phase]}`}>
                {item.featured_image && (
                    <div className="shrink-0 w-10 h-10 rounded-full bg-[#FF637E]/10 flex items-center justify-center">
                        <Image
                            src={item.featured_image}
                            alt={item.title ?? ''}
                            width={22}
                            height={22}
                            className="object-contain"
                        />
                    </div>
                )}
                <div className="min-w-0">
                    {item.title && (
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-foreground font-jost leading-tight">
                            {item.title}
                        </p>
                    )}
                    {item.excerpt && (
                        <p className="text-[11px] text-muted-foreground font-inter leading-tight mt-0.5">
                            {item.excerpt}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
