'use client';

import { useState, useEffect } from 'react';

type Phase = 'idle' | 'out' | 'reset';

const INTERVAL_MS = 4000;
const TRANSITION_MS = 300;

export function PromoBarCarousel({ items }: { items: string[] }) {
    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>('idle');

    useEffect(() => {
        if (items.length <= 1) return;

        const id = setInterval(() => {
            // 1. slide current item up + fade out
            setPhase('out');

            // 2. after exit: snap new item below (no transition)
            setTimeout(() => {
                setIndex(i => (i + 1) % items.length);
                setPhase('reset');
            }, TRANSITION_MS);

            // 3. tiny paint frame later: slide new item up into place
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

    return (
        <span
            className={`inline-block ${cls[phase]}`}
            dangerouslySetInnerHTML={{ __html: items[index] ?? '' }}
        />
    );
}
