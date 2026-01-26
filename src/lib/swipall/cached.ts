import { cacheLife, cacheTag } from 'next/cache';
import { getActiveChannel, getAvailableCountries, getCatalogs as getCatalogsREST } from './rest-adapter';
import { CatalogInterface, InterfaceApiListResponse } from './types/types';

/**
 * Get the active channel with caching enabled.
 * Channel configuration rarely changes, so we cache it for 1 hour.
 */
export async function getActiveChannelCached() {
    'use cache';
    cacheLife('hours');

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
 * Collections rarely change, so we cache them for 1 day.
 */
export async function getCatalogs(params: Record<string, any> = {}): Promise<InterfaceApiListResponse<CatalogInterface>> {
    'use cache';
    cacheLife('days');
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
