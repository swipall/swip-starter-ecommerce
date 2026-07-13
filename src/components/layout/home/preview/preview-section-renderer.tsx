import type { CmsPost } from "@/lib/swipall/types/types";
import { getHomeBlockType, parsePostBody } from "../home-section-types";
import type { AdaptedBlock } from "./serialized-block-adapter";
import { HomeBannerSection } from "../sections/home-banner-section";
import { HomePromoBannerSection } from "../sections/home-promo-banner-section";
import { HomeCategoriesSection } from "../sections/home-categories-section";
import { HomeProductsByCategorySection } from "../sections/home-products-by-category-section";
import { HomeHtmlSection } from "../sections/home-html-section";
import { HomeBannerSliderSection } from "../sections/home-banner-slider-section";
import { CompanyInfoCarousel } from "../sections/company-info-carousel";
import { searchProducts } from "@/lib/swipall/rest-adapter";
import { getAuthUserCustomerId } from "@/lib/auth";
import Image from "next/image";

interface PreviewSectionRendererProps {
    block: AdaptedBlock;
}

/**
 * Block status is surfaced via a `data-block-status` attribute on the wrapper
 * (read by `preview-home-client.tsx`) rather than a JS callback, since these
 * renderers are async Server Components resolved inside a Suspense boundary.
 */
export async function PreviewSectionRenderer({ block }: PreviewSectionRendererProps) {
    const { post, node, children } = block;
    const type = getHomeBlockType(post) ?? node.type;

    if (!type) {
        return <div data-block-status="unknown-type" className="border-2 border-dashed border-amber-500 p-4 text-xs text-amber-700">Unknown block type: {node.type}</div>;
    }

    switch (type) {
        case "home-banner":
            return <div data-block-status="hydrated"><HomeBannerSection post={post} /></div>;
        case "home-banner-slider":
            return <div data-block-status="hydrated"><HomeBannerSliderSection post={post} items={children.map((c) => c.post)} /></div>;
        case "home-promo-banner":
            return <div data-block-status="hydrated"><HomePromoBannerSection post={post} /></div>;
        case "home-categories":
            return <div data-block-status="hydrated"><HomeCategoriesSection post={post} /></div>;
        case "home-products-by-category":
            return <PreviewProductsByCategorySection post={post} />;
        case "home-html":
            return <div data-block-status="hydrated"><HomeHtmlSection post={post} /></div>;
        case "home-company-info":
            return <div data-block-status="hydrated"><PreviewCompanyInfoSection items={children.map((c) => c.post)} /></div>;
        default:
            return null;
    }
}

interface HomeProductsByCategoryBody {
    category_slug?: string;
    limit?: number;
    order?: string;
}

async function PreviewProductsByCategorySection({ post }: { post: CmsPost }) {
    const body = parsePostBody<HomeProductsByCategoryBody>(post.body);
    const categorySlug = body?.category_slug;

    if (!categorySlug) {
        return <div data-block-status="hydrated"><HomeProductsByCategorySection post={post} /></div>;
    }

    const customerId = await getAuthUserCustomerId();
    let allOutOfStock = false;
    try {
        const result = await searchProducts(
            { limit: body?.limit ?? 8, offset: 0, taxonomies__slug__and: categorySlug },
            customerId,
        );
        allOutOfStock = result.results.length > 0 && result.results.every((p) => (p.available?.quantity ?? 0) <= 0);
    } catch {
        // best-effort — fall through to 'hydrated', the section itself handles fetch failures
    }

    return (
        <div data-block-status={allOutOfStock ? "out-of-stock" : "hydrated"}>
            <HomeProductsByCategorySection post={post} />
        </div>
    );
}

function PreviewCompanyInfoSection({ items }: { items: CmsPost[] }) {
    if (items.length === 0) return null;

    return (
        <section className="w-full border-y border-border bg-white">
            <div className="container mx-auto px-4 py-4">
                <div className="md:hidden">
                    <CompanyInfoCarousel items={items} />
                </div>
                <div className="hidden md:flex gap-0 justify-center">
                    {items.map((item) => (
                        <div key={item.slug} className="flex items-center gap-3 md:px-6 lg:px-8 first:pl-0 last:pr-0">
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
                    ))}
                </div>
            </div>
        </section>
    );
}
