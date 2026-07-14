import { getMenuItemHref } from '@/components/layout/navbar/navbar-menu-helpers';
import { getPosts } from '@/lib/swipall/rest-adapter';
import { CmsPost } from '@/lib/swipall/types/types';
import { cacheLife } from 'next/cache';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export async function NavbarCollectionsMobile() {
    'use cache';
    cacheLife('minutes');

    const topLevel = await getPosts({ parent__slug: 'menu-principal', ordering: 'ordering' });

    const itemsWithChildren = await Promise.all(
        (topLevel?.results ?? []).map(async (item: CmsPost) => {
            const children = await getPosts({ parent__slug: item.slug });
            return { ...item, children: children?.results ?? [] };
        })
    );

    const redirectUrl = (item: CmsPost) => getMenuItemHref(item);

    return (
        <nav className="flex flex-col">
            {itemsWithChildren.map((item) => (
                <div key={item.slug}>
                    <Link
                        href={redirectUrl(item)}
                        className="flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                        <span>{item.title}</span>
                        {item.children.length > 0 && <ChevronRight className="h-4 w-4 opacity-50" />}
                    </Link>
                    {item.children.length > 0 && (
                        <div className="bg-white/5">
                            {item.children.map((child: CmsPost) => (
                                <Link
                                    key={child.slug}
                                    href={getMenuItemHref(child)}
                                    className="flex items-center px-8 py-2.5 text-sm text-white/70 hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    {child.title}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </nav>
    );
}
