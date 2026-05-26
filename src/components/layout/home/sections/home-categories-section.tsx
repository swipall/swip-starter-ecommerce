import Image from "next/image";
import Link from "next/link";
import type { CmsPost } from "@/lib/swipall/types/types";
import { parsePostBody } from "../home-section-types";

interface HomeCategoriesBody {
    items?: Array<{
        slug: string;
        image?: string;
        title?: string;
    }>;
}

interface HomeCategoriesSectionProps {
    post: CmsPost;
}

function humanizeSlug(value: string) {
    return value
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function HomeCategoriesSection({ post }: HomeCategoriesSectionProps) {
    const body = parsePostBody<HomeCategoriesBody>(post.body);
    const items = body?.items ?? [];

    if (items.length === 0) {
        return null;
    }

    return (
        <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
                {post.title && (
                    <h2 className="text-3xl md:text-4xl font-bold mb-8">
                        {post.title}
                    </h2>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {items.map((item) => {
                        const label = item.title ?? humanizeSlug(item.slug);
                        return (
                            <Link
                                key={item.slug}
                                href={`/collection/${item.slug}`}
                                className="group rounded-2xl border bg-background/60 hover:bg-background transition-colors overflow-hidden"
                            >
                                <div className="relative aspect-square overflow-hidden">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={label}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            sizes="(min-width: 768px) 25vw, 50vw"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-muted text-foreground text-sm">
                                            {label}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 text-center">
                                    <p className="text-sm font-medium">{label}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}