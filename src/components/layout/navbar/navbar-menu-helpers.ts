import { CmsPost } from '@/lib/swipall/types/types';

export type MenuItemType = 'collection' | 'page';

export function getMenuItemType(item: Pick<CmsPost, 'link'>): MenuItemType {
    return item.link === null ? 'collection' : 'page';
}

export function isCollection(item: Pick<CmsPost, 'link'>): boolean {
    return item.link === null;
}

export function isPage(item: Pick<CmsPost, 'link'>): boolean {
    return item.link !== null;
}

export function getMenuItemHref(item: Pick<CmsPost, 'link' | 'slug'>): string {
    return item.link ?? `/collection/${item.slug}`;
}
