import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { cacheLife } from 'next/cache';
import { getMenuItemHref } from '@/components/layout/navbar/navbar-menu-helpers';
import { getPosts, searchProducts } from '@/lib/swipall/rest-adapter';
import { CmsPost } from '@/lib/swipall/types/types';
import { noIndexRobots } from '@/lib/metadata';

export const metadata: Metadata = {
    title: 'Categorías',
    robots: noIndexRobots(),
};

async function getCategoriesWithCounts() {
    'use cache';
    cacheLife('minutes');

    const topLevel = await getPosts({ parent__slug: 'menu-principal', ordering: 'ordering' });
    const items = topLevel?.results ?? [];

    return Promise.all(
        items.map(async (item: CmsPost) => {
            const count = item.link
                ? null
                : (await searchProducts({ taxonomies__slug__and: item.slug, limit: 1 })).count;
            return { ...item, count };
        })
    );
}

export default async function CategoriasPage() {
    const categories = await getCategoriesWithCounts();

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="px-4 pt-6 pb-4">
                <h1 className="font-jost text-2xl font-black uppercase tracking-[1px]">Categorías</h1>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-4 pb-8">
                {categories.map((item) => {
                    const label = item.title;
                    return (
                        <Link
                            key={item.slug}
                            href={getMenuItemHref(item)}
                            className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-muted"
                        >
                            {item.featured_image && (
                                <Image
                                    src={item.featured_image}
                                    alt={label}
                                    fill
                                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="font-jost text-sm font-black uppercase leading-tight tracking-[1px] text-white">
                                    {label}
                                </p>
                                {item.count !== null && (
                                    <p className="mt-0.5 text-xs text-white/70">
                                        {item.count} {item.count === 1 ? 'pieza' : 'piezas'}
                                    </p>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
