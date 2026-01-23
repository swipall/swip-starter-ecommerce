import type {Metadata} from 'next';
import {Suspense} from 'react';
import {SearchResults} from "@/app/search/search-results";
import {SearchTerm, SearchTermSkeleton} from "@/app/search/search-term";
import {SearchResultsSkeleton} from "@/components/shared/skeletons/search-results-skeleton";
import {SITE_NAME, noIndexRobots} from '@/lib/metadata';

export async function generateMetadata({
    searchParams,
}: PageProps<'/search'>): Promise<Metadata> {
    const resolvedParams = await searchParams;
    const searchQuery = resolvedParams.q as string | undefined;

    const title = searchQuery
        ? `Búsqueda de "${searchQuery}"`
        : 'Buscar Productos';

    return {
        title,
        description: searchQuery
            ? `Encuentra productos que coincidan con "${searchQuery}" en ${SITE_NAME}`
            : `Busca en nuestro catálogo de productos en ${SITE_NAME}`,
        robots: noIndexRobots(),
    };
}

export default async function SearchPage({searchParams}: PageProps<'/search'>) {
    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <Suspense fallback={<SearchTermSkeleton/>}>
                <SearchTerm searchParams={searchParams}/>
            </Suspense>
            <Suspense fallback={<SearchResultsSkeleton />}>
                <SearchResults searchParams={searchParams}/>
            </Suspense>
        </div>
    );
}
