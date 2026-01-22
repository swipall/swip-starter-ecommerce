import type { SearchInput } from '@/lib/swipall/rest-adapter';

interface BuildSearchInputOptions {
    searchParams: { [key: string]: string | string[] | undefined };
    collectionSlug?: string;
}

export function buildSearchInput({ searchParams, collectionSlug }: BuildSearchInputOptions): SearchInput {
    const page = Number(searchParams.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    const sortParam = (searchParams.sort as string) || 'name-asc';
    const searchTerm = searchParams.q as string;

    // Extract facet value IDs from search params
    const facetValueIds = searchParams.facets
        ? Array.isArray(searchParams.facets)
            ? searchParams.facets
            : [searchParams.facets]
        : [];

    // Map sort parameter to a simple string for REST API
    const sortMapping: Record<string, string> = {
        'name-asc': 'name_asc',
        'name-desc': 'name_desc',
        'price-asc': 'price_asc',
        'price-desc': 'price_desc',
    };

    return {
        ...(searchTerm && { search: searchTerm }),
        limit,
        offset,
        ordering: sortMapping[sortParam] || sortMapping['name-asc']
    };
}

export function getCurrentPage(searchParams: { [key: string]: string | string[] | undefined }): number {
    return Number(searchParams.page) || 1;
}
