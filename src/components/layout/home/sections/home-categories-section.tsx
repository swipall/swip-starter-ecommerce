import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CmsPost } from "@/lib/swipall/types/types";
import { parsePostBody } from "../home-section-types";
import { CategoriesCarousel } from "./categories-carousel";

interface HomeCategoriesBody {
    items?: Array<{
        slug: string;
        image?: string;
        title?: string;
        link: string;
    }>;
    viewAllHref?: string;
    eyebrow?: string;
}

interface HomeCategoriesSectionProps {
    post: CmsPost;
}

export function HomeCategoriesSection({ post }: HomeCategoriesSectionProps) {
    const body = parsePostBody<HomeCategoriesBody>(post.body);
    const items = body?.items ?? [];
    const eyebrow = body?.eyebrow ?? post.excerpt ?? "EXPLORAR";
    const viewAllHref = post.link ?? body?.viewAllHref ?? "/search";

    if (items.length === 0) return null;

    return (
        <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <p className="font-jost text-[#FF637E] text-[11px] font-bold uppercase tracking-[2px] mb-1">
                            {eyebrow}
                        </p>
                        {post.title && (
                            <h2 className="font-jost text-2xl md:text-3xl font-black uppercase tracking-[2px]">
                                {post.title}
                            </h2>
                        )}
                    </div>
                    <Link
                        href={viewAllHref}
                        className="flex items-center gap-1 font-jost text-[11px] font-bold uppercase tracking-[2px] hover:text-[#FF637E] transition-colors shrink-0"
                    >
                        VER TODAS <ChevronRight size={14} />
                    </Link>
                </div>

                <CategoriesCarousel items={items} />
            </div>
        </section>
    );
}
