import type { SearchInput } from '@/lib/swipall/rest-adapter';

interface BuildSearchInputOptions {
    searchParams: { [key: string]: string | string[] | undefined };
    taxonomy?: string;
    taxonomies__slug__and?: string;
}

export function buildSearchInput({ searchParams, taxonomy, taxonomies__slug__and }: BuildSearchInputOptions): SearchInput {
    const page = Number(searchParams.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    const sortParam = (searchParams.ordering as string) || 'name-asc';
    const searchTerm = searchParams.q as string;
    const sortMapping: Record<string, string> = {
        'name-asc': 'name_asc',
        'name-desc': 'name_desc',
        'price-asc': 'price_asc',
        'price-desc': 'price_desc',
    };

    // URL param takes priority over the hardcoded collection slug
    const resolvedTaxonomiesSlugAnd = (searchParams.taxonomies__slug__and as string) || taxonomies__slug__and;

    return {
        ...(searchTerm && { search: searchTerm }),
        ...(taxonomy && { taxonomy }),
        ...(resolvedTaxonomiesSlugAnd && { taxonomies__slug__and: resolvedTaxonomiesSlugAnd }),
        limit,
        offset,
        ordering: sortMapping[sortParam] || sortMapping['name-asc'],
    };
}

export function getCurrentPage(searchParams: { [key: string]: string | string[] | undefined }): number {
    return Number(searchParams.page) || 1;
}
