import { getPosts } from '@/lib/swipall/rest-adapter';
import { cacheLife } from 'next/cache';
import { PromoBarCarousel } from './promo-bar-carousel';

export async function PromoBar() {
    'use cache';
    cacheLife('days');

    const result = await getPosts({ slug: 'barra-de-anuncio' });
    const post = result?.results?.[0];

    if (!post?.body) return null;

    const items = [...post.body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
        .map(m => m[1].trim())
        .filter(Boolean);

    if (items.length === 0) return null;

    return (
        <div className="bg-black text-white text-xs uppercase font-bold text-center py-2 tracking-widest font-jost overflow-hidden [&_a]:underline [&_a]:hover:text-[#FF637E] [&_a]:transition-colors">
            <PromoBarCarousel items={items} />
        </div>
    );
}
