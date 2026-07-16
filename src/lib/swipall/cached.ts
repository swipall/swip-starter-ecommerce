import { cacheLife, cacheTag } from 'next/cache';
import { getActiveChannel, getAvailableCountries, getCatalogs as getCatalogsREST, getTaxonomies } from './rest-adapter';
import { CatalogInterface, InterfaceApiListResponse, TaxonomyInterface } from './types/types';

/**
 * Get the active channel with caching enabled.
 */
export async function getActiveChannelCached() {
    'use cache';
    cacheLife('minutes');

    try {
        const result = await getActiveChannel();
        return result.data;
    } catch (error) {
        // Return safe default during build/offline
        return {} as any;
    }
}

/**
 * Get available countries with caching enabled.
 * Countries list never changes, so we cache it with max duration.
 */
export async function getAvailableCountriesCached() {
    'use cache';
    cacheLife('max');
    cacheTag('countries');

    try {
        const result = await getAvailableCountries();
        return result;
    } catch (error) {
        // Return safe default during build/offline
        return [];
    }
}

/**
 * Get top-level collections with caching enabled.
 */
export async function getCatalogs(params: Record<string, any> = {}): Promise<InterfaceApiListResponse<CatalogInterface>> {
    'use cache';
    cacheLife('minutes');
    cacheTag('collections');

    try {
        const result = await getCatalogsREST(params);
        return result;
    } catch (error) {
        // Return safe default during build/offline
        return {
            results: [],
            count: 0,
            next: null,
            previous: null,
        };
    }
}

/**
 * Resolve a visible taxonomy by its slug, with caching enabled.
 */
export async function getTaxonomyBySlugCached(slug: string): Promise<TaxonomyInterface | null> {
    'use cache';
    cacheLife('minutes');
    cacheTag(`taxonomy-${slug}`);

    const result = await getTaxonomies({ slug, is_visible_on_web: true });
    return result.results[0] ?? null;
}

/**
 * Get the visible children of a taxonomy by its parent id, with caching enabled.
 */
export async function getTaxonomyChildrenCached(parentId: string): Promise<TaxonomyInterface[]> {
    'use cache';
    cacheLife('minutes');
    cacheTag(`taxonomy-children-${parentId}`);

    const result = await getTaxonomies({ parent: parentId, is_visible_on_web: true });
    return result.results;
}
