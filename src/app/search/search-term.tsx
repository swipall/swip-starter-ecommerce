interface SearchTermProps {
    searchParams: Promise<{
        q?: string
    }>;
}

export async function SearchTerm({searchParams}: SearchTermProps) {
    const searchParamsResolved = await searchParams;
    const searchTerm = (searchParamsResolved.q as string) || '';

    return (
        <div className="mb-6">
            <h1 className="text-3xl font-bold">
                {searchTerm ? `Búsqueda de "${searchTerm}"` : 'Buscar'}
            </h1>
        </div>
    )
}

export function SearchTermSkeleton() {
    return (
        <div className="mb-6">
            <div className="h-9 w-64 bg-muted rounded animate-pulse" />
        </div>
    )
}
