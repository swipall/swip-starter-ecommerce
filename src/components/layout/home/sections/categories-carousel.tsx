'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryItem {
    slug: string;
    image?: string;
    title?: string;
}

function humanizeSlug(value: string) {
    return value.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function CategoriesCarousel({ items }: { items: CategoryItem[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir === 'right' ? el.offsetWidth : -el.offsetWidth, behavior: 'smooth' });
    };

    if (items.length === 0) return null;

    return (
        <div className="relative group/carousel">
            {/* Prev */}
            <button
                onClick={() => scroll('left')}
                aria-label="Anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-[#FF637E] transition-colors shadow-md opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
            >
                <ChevronLeft size={16} />
            </button>

            {/* Scroll container */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {items.map((item) => {
                    const label = item.title ?? humanizeSlug(item.slug);
                    return (
                        <Link
                            key={item.slug}
                            href={`/collection/${item.slug}`}
                            className="group/card snap-start shrink-0 w-[calc(50%-8px)] md:w-[calc(25%-12px)] rounded-2xl overflow-hidden relative block"
                        >
                            <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={label}
                                        fill
                                        className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                                        sizes="(min-width: 768px) 25vw, 50vw"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-muted text-sm text-muted-foreground">
                                        {label}
                                    </div>
                                )}

                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                                {/* Label sobre la imagen */}
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <p className="font-jost text-white font-black uppercase tracking-[1px] text-sm md:text-base leading-tight">
                                        {label}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Next */}
            <button
                onClick={() => scroll('right')}
                aria-label="Siguiente"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-[#FF637E] transition-colors shadow-md opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
