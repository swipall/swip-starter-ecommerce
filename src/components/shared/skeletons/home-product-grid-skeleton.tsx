import { Skeleton } from "@/components/ui/skeleton";

export function HomeProductGridSkeleton() {
    return (
        <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">
                <div className="mb-6 space-y-2">
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="w-1/2 md:w-1/4 shrink-0 space-y-2">
                            <Skeleton className="aspect-[3/4] w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
