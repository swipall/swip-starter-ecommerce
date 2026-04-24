import { PostSkeleton } from '@/components/shared/skeletons/post-skeleton';

export default function CollectionLoading() {
    return (
        <div className="container mx-auto px-4 py-8 mt-[118px]">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <div className="h-64 animate-pulse bg-muted rounded-lg" />
                </aside>

                <div className="lg:col-span-3">
                    <PostSkeleton />
                </div>
            </div>
        </div>
    );
}
