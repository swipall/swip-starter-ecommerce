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
import { getTaxonomyBySlugCached, getTaxonomyChildrenCached } from '@/lib/swipall/cached';
import { getTaxonomies, searchProducts } from '@/lib/swipall/rest-adapter';
import { sortByLabel } from '@/lib/swipall/taxonomy-helpers';
import type { Metadata } from 'next';
import { cacheLife, cacheTag } from 'next/cache';
import { Suspense } from 'react';

async function getCollectionProducts(slug: string, searchParams: { [key: string]: string | string[] | undefined }, customerId?: string) {
    'use cache';
    cacheLife('minutes');
    cacheTag(`collection-${slug}`);

    const params = buildSearchInput({
        searchParams,
        taxonomies__slug__and: slug,
    });

    const results = await searchProducts(params, customerId);
    return results;
}

async function getAllCategoryGroups() {
    'use cache';
    cacheLife('minutes');
    cacheTag('taxonomy-category-tree');

    const parents = await getTaxonomies({ kind: 'category', is_visible_on_web: true });
    const groups = await Promise.all(
        sortByLabel(parents.results).map(async (parent) => ({
            parent,
            children: sortByLabel(await getTaxonomyChildrenCached(parent.id)),
        }))
    );
    return groups;
}

async function getTaxonomyProductCounts(taxonomySlugs: string[]) {
    'use cache';
    cacheLife('minutes');

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
    cacheLife('minutes');
    cacheTag(`collection-meta-${slug}`);

    const taxonomy = await getTaxonomyBySlugCached(slug);
    const name = taxonomy?.value ?? taxonomy?.name ?? '';
    return { data: { name, slug } }
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
    const parentTaxonomy = await getTaxonomyBySlugCached(slug);
    const collectionName = parentTaxonomy?.value ?? parentTaxonomy?.name ?? '';
    const categoryGroups = await getAllCategoryGroups();
    const allTaxonomySlugs = categoryGroups.flatMap(g => [g.parent.slug, ...g.children.map(c => c.slug)]);
    const taxonomyCounts = await getTaxonomyProductCounts(allTaxonomySlugs);
    return (
        <div className="container mx-auto px-4 py-8 sm:mt-16">
            {collectionName && (
                <h1 className="font-jost text-2xl font-black uppercase tracking-[1px] mb-6">{collectionName}</h1>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <div className='font-bold text-sm text-primary uppercase'>Categorías</div>
                    <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
                        <FacetFilters groups={categoryGroups} searchParams={searchParamsResolved} counts={taxonomyCounts} />
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