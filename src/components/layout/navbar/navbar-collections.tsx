import { NavbarLink } from '@/components/layout/navbar/navbar-link';
import { NavbarDropdownItem } from '@/components/layout/navbar/navbar-dropdown-item';
import { getMenuItemHref, isCollection } from '@/components/layout/navbar/navbar-menu-helpers';
import { getPosts } from '@/lib/swipall/rest-adapter';
import { CmsPost } from '@/lib/swipall/types/types';
import { cacheLife, cacheTag } from 'next/cache';

export async function NavbarCollections() {
    "use cache";
    cacheLife('minutes');
    cacheTag('navbar-collections');

    const topLevel = await getPosts({ parent__slug: 'menu-principal', ordering: 'ordering' });

    const itemsWithChildren = await Promise.all(
        (topLevel?.results ?? []).map(async (item: CmsPost) => {
            const children = isCollection(item) ? await getPosts({ parent__slug: item.slug }) : null;
            return { ...item, children: children?.results ?? [] };
        })
    );
    const redirectUrl = (item: CmsPost) => getMenuItemHref(item);

    return (
        <div className="flex items-center">
            {itemsWithChildren.map((item) =>
                item.children.length > 0 ? (
                    <NavbarDropdownItem
                        key={item.slug}
                        title={item.title}
                        href={redirectUrl(item)}
                        items={item.children}
                    />
                ) : (
                    <NavbarLink key={item.slug} href={redirectUrl(item)}>
                        {item.title}
                    </NavbarLink>
                )
            )}
        </div>
    );
}
