'use client';

import { use } from 'react';
import type { SearchResult } from '@/lib/swipall/rest-adapter';

interface FacetFiltersProps {
    productDataPromise: Promise<SearchResult>;
}

/**
 * Facet filters for product search.
 * Currently returns null as the Swipall API doesn't support facet filtering
 * in the same way as Vendure.
 * 
 * This component is kept as a placeholder for future implementation.
 */
export function FacetFilters({ productDataPromise }: FacetFiltersProps) {
    // Consume the promise to avoid warnings, but don't use the data
    const _searchResult = use(productDataPromise);

    // Swipall API doesn't support facet-based filtering yet
    // Return null to hide the filters
    return null;
}
