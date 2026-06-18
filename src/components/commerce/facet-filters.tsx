'use client';

import { TaxonomyInterface } from '@/lib/swipall/types/types';

interface FacetFiltersProps {
    taxonomies: TaxonomyInterface[];
    searchParams: Record<string, string | string[] | undefined>;
    counts?: Record<string, number>;
}

export function FacetFilters({ taxonomies, searchParams, counts }: FacetFiltersProps) {

    const buildParams = (overrides: Record<string, string | null>) => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(searchParams)) {
            if (key in overrides) continue;
            if (Array.isArray(value)) {
                value.forEach(v => params.append(key, v));
            } else if (value !== undefined) {
                params.set(key, value);
            }
        }
        for (const [key, value] of Object.entries(overrides)) {
            if (value !== null) params.set(key, value);
        }
        return params.toString();
    };

    const selectedSlug = searchParams['taxonomies__slug__and'] as string | undefined;
    const selectedLabel = searchParams['taxonomy_value'] as string | undefined;

    const navigateToFacet = (taxonomy: TaxonomyInterface) => {
        window.location.href = `?${buildParams({
            taxonomies__slug__and: taxonomy.slug,
            taxonomy_value: taxonomy.value ?? taxonomy.name,
        })}`;
    };

    const onClearFilters = () => {
        window.location.href = `?${buildParams({
            taxonomies__slug__and: null,
            taxonomy_value: null,
        })}`;
    };

    if (taxonomies.length === 0) return null;

    return (
        <>
            {/* Mobile: chips horizontales */}
            <div className="lg:hidden flex flex-nowrap overflow-x-auto gap-2 py-3 -mx-4 px-4 scrollbar-hide">
                {selectedSlug && selectedLabel && (
                    <button
                        onClick={onClearFilters}
                        className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-white border border-primary"
                    >
                        {selectedLabel}
                        <span className="text-sm leading-none">&times;</span>
                    </button>
                )}
                {taxonomies
                    .filter(t => t.slug !== selectedSlug)
                    .map((taxonomy) => (
                        <button
                            key={taxonomy.id}
                            onClick={() => navigateToFacet(taxonomy)}
                            className="flex-shrink-0 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white text-black border border-gray-300 hover:border-primary hover:text-primary transition-colors"
                        >
                            {taxonomy.value ?? taxonomy.name}
                        </button>
                    ))}
            </div>

            {/* Desktop: lista vertical en el sidebar */}
            <div className="hidden lg:block py-4 rounded-lg">
                {selectedLabel && (
                    <div className="mb-4 w-full border-b border-gray-300 pb-4">
                        <p className="text-sm font-semibold mb-2">Filtrando por:</p>
                        <div className="flex flex-row justify-between items-center text-sm">
                            <span>{selectedLabel}</span>
                            <button
                                onClick={onClearFilters}
                                className="ml-2 text-red-500 hover:text-red-700 transition-colors p-2"
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                )}
                <ul className="space-y-3 text-sm text-white">
                    {taxonomies.map((taxonomy) => (
                        <li key={taxonomy.id} className="text-white">
                            <a
                                onClick={() => navigateToFacet(taxonomy)}
                                className={`cursor-pointer transition-colors hover:text-primary flex items-center gap-2 ${taxonomy.slug === selectedSlug ? 'text-primary font-semibold' : ''}`}
                            >
                                <span>{taxonomy.value ?? taxonomy.name}</span>
                                {counts?.[taxonomy.slug] !== undefined && (
                                    <span className="text-xs font-bold text-foreground tabular-nums">
                                        ({counts[taxonomy.slug]})
                                    </span>
                                )}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
