import { Skeleton } from "@/components/ui/skeleton";

export function HomeHeroSkeleton() {
    return (
        <div className="relative w-full aspect-[21/9] md:aspect-[21/7] lg:aspect-[21/6] overflow-hidden bg-muted">
            <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
        </div>
    );
}
