import { getSiteConfig } from '@/lib/swipall/rest-adapter';
import { cacheLife } from 'next/cache';
import { SITE_NAME } from '@/lib/metadata';
import type { SiteConfig } from '@/lib/swipall/types/types';

async function getCachedSiteConfig(): Promise<SiteConfig | null> {
    'use cache';
    cacheLife('minutes');
    return getSiteConfig();
}

export async function getSiteLogoUrl(): Promise<string | null> {
    const config = await getCachedSiteConfig();
    return config?.logo ?? null;
}

export async function getSiteFaviconUrl(): Promise<string | null> {
    const config = await getCachedSiteConfig();
    if (!config?.favicon) return null;
    if (typeof config.favicon === 'object') return config.favicon.favicon ?? null;
    return config.favicon;
}

export async function getSiteName(): Promise<string> {
    const config = await getCachedSiteConfig();
    return config?.title || SITE_NAME;
}

export async function getSiteDescription(): Promise<string | null> {
    const config = await getCachedSiteConfig();
    return config?.excerpt ?? null;
}
