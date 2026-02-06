import {ProductCard} from './product-card';
import {Pagination} from '@/components/shared/pagination';
import {SortDropdown} from './sort-dropdown';
import { getActiveChannelCached } from '@/lib/swipall/cached';
import type { SearchResult } from '@/lib/swipall/rest-adapter';

// Use REST SearchResult type

interface ProductGridProps {
    productDataPromise: Promise<SearchResult>;
    currentPage: number;
    take: number;
}

export async function ProductGrid({productDataPromise, currentPage, take}: ProductGridProps) {
    const [searchResult] = await Promise.all([
        productDataPromise,
        // getActiveChannelCached(),
    ]);

    const totalPages = Math.ceil((searchResult?.count || 0) / take);

    if (!searchResult?.results || !Array.isArray(searchResult.results) || searchResult.results.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron productos</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {searchResult.count} {searchResult.count === 1 ? 'producto' : 'productos'}
                </p>
                <SortDropdown/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResult.results.map((product, i) => (
                    <ProductCard key={'product-grid-item' + i} product={product}/>
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages}/>
            )}
        </div>
    );
}
