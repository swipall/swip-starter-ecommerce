import Image from "next/image";
import { getPosts } from "@/lib/swipall/rest-adapter";
import { cacheLife } from "next/cache";
import type { CmsPost } from "@/lib/swipall/types/types";
import { CompanyInfoCarousel } from "./company-info-carousel";

interface HomeCompanyInfoSectionProps {
    post: CmsPost;
}

export async function HomeCompanyInfoSection({ post }: HomeCompanyInfoSectionProps) {
    "use cache";
    cacheLife("hours");

    let items: CmsPost[] = [];
    try {
        const res = await getPosts({ parent__slug: post.slug });
        items = (res.results ?? []).sort((a, b) => (a.ordering ?? 0) - (b.ordering ?? 0));
    } catch {
        return null;
    }

    if (items.length === 0) return null;

    return (
        <section className="w-full border-y border-border bg-white">
            <div className="container mx-auto px-4 py-4">
                {/* Mobile: carrusel uno a uno */}
                <div className="md:hidden">
                    <CompanyInfoCarousel items={items} />
                </div>

                {/* Desktop: todos en fila */}
                <div className="hidden md:flex gap-0 justify-center">
                    {items.map((item) => (
                        <CompanyInfoItem key={item.slug} item={item} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function CompanyInfoItem({ item }: { item: CmsPost }) {
    return (
        <div className="flex items-center gap-3 md:px-6 lg:px-8 first:pl-0 last:pr-0">
            {/* Icono */}
            {item.featured_image && (
                <div className="shrink-0 w-10 h-10 rounded-full bg-[#FF637E]/10 flex items-center justify-center">
                    <Image
                        src={item.featured_image}
                        alt={item.title ?? ""}
                        width={22}
                        height={22}
                        className="object-contain"
                    />
                </div>
            )}
            {/* Texto */}
            <div className="min-w-0">
                {item.title && (
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-foreground font-jost leading-tight">
                        {item.title}
                    </p>
                )}
                {item.excerpt && (
                    <p className="text-[11px] text-muted-foreground font-inter leading-tight mt-0.5">
                        {item.excerpt}
                    </p>
                )}
            </div>
        </div>
    );
}
