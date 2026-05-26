import { FacetFilters } from '@/components/commerce/facet-filters';
import { ProductGrid } from '@/components/commerce/product-grid';
import { ProductGridSkeleton } from '@/components/shared/product-grid-skeleton';
import { getAuthUserCustomerId } from '@/lib/auth';
import {
    buildCanonicalUrl,
    buildOgImages,
    SITE_NAME
} from '@/lib/metadata';
import { buildSearchInput, getCurrentPage } from '@/lib/search-helpers';
import { getTaxonomies, searchProducts } from '@/lib/swipall/rest-adapter';
import type { Metadata } from 'next';
import { cacheLife, cacheTag } from 'next/cache';
import { Suspense } from 'react';

async function getCollectionProducts(slug: string, searchParams: { [key: string]: string | string[] | undefined }, customerId?: string) {
    'use cache';
    cacheLife('hours');
    cacheTag(`collection-${slug}`);

    const params = buildSearchInput({
        searchParams,
        taxonomies__slug__and: slug,
    });

    const results = await searchProducts(params, customerId);
    return results;
}

async function getTaxonomyProductCounts(taxonomySlugs: string[]) {
    'use cache';
    cacheLife('hours');

    const counts = await Promise.all(
        taxonomySlugs.map(async (slug) => {
            const result = await searchProducts({ taxonomies__slug__and: slug, limit: 1 });
            return [slug, result.count] as [string, number];
        })
    );
    return Object.fromEntries(counts);
}

async function getCollectionMetadata(slug: string) {
    'use cache';
    cacheLife('hours');
    cacheTag(`collection-meta-${slug}`);

    // return await getCollection(slug);
    // const taxonomies = await getTaxonomies({ parent__slug: slug });
    // console.log('Taxonomies:', taxonomies);
    return { data: { name: '', slug: slug } }
}

export async function generateMetadata({
    params,
}: PageProps<'/collection/[slug]'>): Promise<Metadata> {
    const { slug } = await params;
    const result = await getCollectionMetadata(slug);
    const collection = result.data;

    if (!collection) {
        return {
            title: 'Collection Not Found',
        };
    }

    const description = `Browse our ${collection.name} collection at ${SITE_NAME}`;

    return {
        title: collection.name,
        description,
        alternates: {
            canonical: buildCanonicalUrl(`/collection/${collection.slug}`),
        },
        openGraph: {
            title: collection.name,
            description,
            type: 'website',
            url: buildCanonicalUrl(`/collection/${collection.slug}`),
            images: buildOgImages(undefined, collection.name),
        },
        twitter: {
            card: 'summary_large_image',
            title: collection.name,
            description,
        },
    };
}

export default async function CollectionPage({ params, searchParams }: PageProps<'/collection/[slug]'>) {
    const { slug } = await params;
    const searchParamsResolved = await searchParams;
    const page = getCurrentPage(searchParamsResolved);

    const customerId = await getAuthUserCustomerId();
    const productDataPromise = getCollectionProducts(slug, searchParamsResolved, customerId);
    const taxonomies = await getTaxonomies({ parent__slug: slug });
    const taxonomyCounts = await getTaxonomyProductCounts(taxonomies.results.map(t => t.slug));
    return (
        <div className="container mx-auto px-4 py-8 mt-[100] sm:mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <div className='font-bold text-sm text-primary uppercase'>Categorías</div>
                    <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
                        <FacetFilters taxonomies={taxonomies.results} searchParams={searchParamsResolved} counts={taxonomyCounts} />
                    </Suspense>
                </aside>
                <div className="lg:col-span-3">
                    <Suspense fallback={<ProductGridSkeleton />}>
                        <ProductGrid productDataPromise={productDataPromise} currentPage={page} take={12} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}