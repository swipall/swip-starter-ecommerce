import { Skeleton } from "@/components/ui/skeleton";

export function HomeCategoriesSkeleton() {
    return (
        <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="flex items-end justify-between mb-6">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-7 w-48" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <Skeleton className="h-3 w-14" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
