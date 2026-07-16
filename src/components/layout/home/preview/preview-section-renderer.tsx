import type { CmsPost } from "@/lib/swipall/types/types";
import { getHomeBlockType, looksLikeJson, parsePostBody } from "../home-section-types";
import type { AdaptedBlock } from "./serialized-block-adapter";
import { searchProducts } from "@/lib/swipall/rest-adapter";
import { getAuthUserCustomerId } from "@/lib/auth";

interface PreviewSectionRendererProps {
    block: AdaptedBlock;
}

/**
 * Renders a plain, static HTML approximation of each block type for the CMS
 * live preview iframe. It intentionally avoids next/image, next/link, and
 * any "use client" components — this tree is rendered with react-dom's raw
 * renderToReadableStream outside of Next's own request pipeline, which does
 * not have the RSC/client-manifest wiring those APIs depend on.
 *
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
            return <div data-block-status="hydrated"><PreviewBannerSection post={post} /></div>;
        case "home-banner-slider":
            return <div data-block-status="hydrated"><PreviewBannerSliderSection items={children.map((c) => c.post)} /></div>;
        case "home-promo-banner":
            return <div data-block-status="hydrated"><PreviewPromoBannerSection post={post} /></div>;
        case "home-categories":
            return <div data-block-status="hydrated"><PreviewCategoriesSection post={post} /></div>;
        case "home-products-by-category":
            return <PreviewProductsByCategorySection post={post} />;
        case "home-html":
            return <div data-block-status="hydrated"><PreviewHtmlSection post={post} /></div>;
        case "home-company-info":
            return <div data-block-status="hydrated"><PreviewCompanyInfoSection items={children.map((c) => c.post)} /></div>;
        default:
            return null;
    }
}

interface HomeBannerBody {
    subtitle?: string;
    buttonText?: string;
}

function PreviewBannerSection({ post }: { post: CmsPost }) {
    if (!post.featured_image) return null;

    const body = parsePostBody<HomeBannerBody>(post.body);
    const subtitle = body?.subtitle;
    const buttonText = body?.buttonText ?? "Ver más";

    return (
        <section className="relative w-full overflow-hidden bg-muted">
            <div className="relative w-full aspect-[21/9] md:aspect-[21/7] lg:aspect-[21/6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.featured_image} alt={post.title ?? "Banner"} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                    <div className="container mx-auto px-4">
                        <div className="max-w-xl text-white space-y-4">
                            {subtitle && <p className="text-sm uppercase tracking-[0.2em] text-white/80">{subtitle}</p>}
                            {post.title && <h2 className="text-3xl md:text-5xl font-bold leading-tight">{post.title}</h2>}
                            {post.excerpt && <p className="text-base md:text-lg text-white/90">{post.excerpt}</p>}
                            {post.link && (
                                <a href={post.link} className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
                                    {buttonText}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

interface BannerItemBody {
    subtitle?: string;
    buttonText?: string;
}

function PreviewBannerSliderSection({ items }: { items: CmsPost[] }) {
    if (!items || items.length === 0) return null;

    return (
        <section className="w-full">
            <div className="relative w-full overflow-hidden">
                {/* Static preview: shows only the first slide, no carousel behavior */}
                <PreviewBannerSliderItem item={items[0]} />
            </div>
        </section>
    );
}

function PreviewBannerSliderItem({ item }: { item: CmsPost }) {
    if (!item.featured_image) return null;

    const itemBody = parsePostBody<BannerItemBody>(item.body);
    const eyebrow = itemBody?.subtitle;
    const buttonText = itemBody?.buttonText ?? "Ver más";
    const bodyHtml = !itemBody && item.body?.trim() ? item.body : null;
    const categorySlugs = new Set(item.categories?.map((cat) => cat.slug) ?? []);
    const isFullBanner = Boolean(item.title || item.excerpt) || categorySlugs.has("home-banner");

    if (!isFullBanner) {
        const img = (
            <div className="relative w-full aspect-[16/7] min-h-[280px] rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.featured_image} alt="Banner" className="absolute inset-0 h-full w-full object-cover" />
            </div>
        );
        return item.link ? <a href={item.link} className="block w-full">{img}</a> : img;
    }

    return (
        <div className="flex w-full min-h-[340px] md:min-h-[600px] overflow-hidden bg-black">
            <div className="flex flex-1 items-center px-8 md:px-12 lg:px-16 py-10">
                <div className="w-full max-w-sm text-white space-y-4">
                    {eyebrow && <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-white/70 font-semibold">{eyebrow}</p>}
                    {item.title && <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">{item.title}</h2>}
                    {item.excerpt && <p className="text-sm md:text-base text-white/85">{item.excerpt}</p>}
                    {bodyHtml && <div className="text-sm md:text-base text-white/85 [&_p]:mb-2 [&_strong]:font-bold" dangerouslySetInnerHTML={{ __html: bodyHtml }} />}
                    {item.link && (
                        <div className="pt-2">
                            <a href={item.link} className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-medium">
                                {buttonText}
                            </a>
                        </div>
                    )}
                </div>
            </div>
            <div className="relative w-[45%] md:w-1/2 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.featured_image} alt={item.title ?? "Banner"} className="absolute inset-0 h-full w-full object-cover" />
            </div>
        </div>
    );
}

interface PromoBannerBody {
    buttonText?: string;
    subtitle?: string;
}

function PreviewPromoBannerSection({ post }: { post: CmsPost }) {
    if (!post.title) return null;

    const body = parsePostBody<PromoBannerBody>(post.body);
    const subtitle = body?.subtitle ?? post.excerpt;
    const buttonText = body?.buttonText;

    if (post.featured_image) {
        const content = (
            <div className="container mx-auto rounded-xl relative w-full aspect-[21/6] md:aspect-[21/5] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.featured_image} alt={post.title ?? "Banner promocional"} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/0" />
                <div className="absolute inset-0 flex flex-col items-start justify-center text-white text-left px-8 space-y-3">
                    {subtitle && <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-white/75 font-semibold">{subtitle}</p>}
                    <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-wide leading-tight">{post.title}</h2>
                    {post.link && buttonText && (
                        <div className="pt-1">
                            <span className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-medium">{buttonText}</span>
                        </div>
                    )}
                </div>
            </div>
        );

        return post.link ? (
            <section className="container px-4 mx-auto"><a href={post.link} className="block">{content}</a></section>
        ) : (
            <section>{content}</section>
        );
    }

    const inner = (
        <div className="w-full bg-accent text-accent-foreground py-4 px-6 flex items-start justify-center gap-3">
            <div className="text-left space-y-0.5">
                {subtitle && <p className="text-xs uppercase tracking-widest opacity-80">{subtitle}</p>}
                <p className="font-bold text-sm md:text-base uppercase tracking-widest">{post.title}</p>
                {buttonText && <p className="text-xs mt-1 underline">{buttonText}</p>}
            </div>
        </div>
    );

    return post.link ? (
        <section><a href={post.link} className="block">{inner}</a></section>
    ) : (
        <section>{inner}</section>
    );
}

interface HomeCategoriesBody {
    items?: Array<{ slug: string; image?: string; title?: string; link: string }>;
    viewAllHref?: string;
    eyebrow?: string;
}

function PreviewCategoriesSection({ post }: { post: CmsPost }) {
    const body = parsePostBody<HomeCategoriesBody>(post.body);
    const items = body?.items ?? [];
    const eyebrow = body?.eyebrow ?? post.excerpt ?? "EXPLORAR";
    const viewAllHref = post.link ?? body?.viewAllHref ?? "/search";

    if (items.length === 0) return null;

    return (
        <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <p className="text-[#FF637E] text-[11px] font-bold uppercase tracking-[2px] mb-1">{eyebrow}</p>
                        {post.title && <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[2px]">{post.title}</h2>}
                    </div>
                    <a href={viewAllHref} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[2px] shrink-0">VER TODAS</a>
                </div>
                <div className="flex gap-4 overflow-x-auto">
                    {items.map((item) => (
                        <a key={item.slug} href={item.link} className="shrink-0 w-32 text-center">
                            {item.image && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={item.image} alt={item.title ?? ""} className="w-32 h-32 object-cover rounded-lg" />
                            )}
                            {item.title && <p className="mt-2 text-xs font-semibold uppercase">{item.title}</p>}
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

function PreviewHtmlSection({ post }: { post: CmsPost }) {
    if (!post.body || looksLikeJson(post.body)) return null;

    return (
        <section>
            <div className="container mx-auto prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: post.body }} />
        </section>
    );
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
        return <div data-block-status="hydrated" className="p-4 text-xs text-muted-foreground">Products by category: no category selected.</div>;
    }

    const customerId = await getAuthUserCustomerId();
    let allOutOfStock = false;
    let products: Awaited<ReturnType<typeof searchProducts>>["results"] = [];
    try {
        const result = await searchProducts(
            { limit: body?.limit ?? 8, offset: 0, taxonomies__slug__and: categorySlug },
            customerId,
        );
        products = result.results;
        allOutOfStock = products.length > 0 && products.every((p) => (p.available?.quantity ?? 0) <= 0);
    } catch {
        // best-effort — fall through to 'hydrated', the section itself handles fetch failures
    }

    return (
        <div data-block-status={allOutOfStock ? "out-of-stock" : "hydrated"}>
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    {post.title && <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[2px] mb-6">{post.title}</h2>}
                    <div className="flex gap-4 overflow-x-auto">
                        {products.map((product) => (
                            <div key={product.id} className="shrink-0 w-40">
                                {product.featured_image && (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={product.featured_image} alt={product.name} className="w-40 h-40 object-cover rounded-lg" />
                                )}
                                <p className="mt-2 text-xs font-semibold truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground">${product.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function PreviewCompanyInfoSection({ items }: { items: CmsPost[] }) {
    if (items.length === 0) return null;

    return (
        <section className="w-full border-y border-border bg-white">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-wrap gap-0 justify-center">
                    {items.map((item) => (
                        <div key={item.slug} className="flex items-center gap-3 md:px-6 lg:px-8 first:pl-0 last:pr-0">
                            {item.featured_image && (
                                <div className="shrink-0 w-10 h-10 rounded-full bg-[#FF637E]/10 flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.featured_image} alt={item.title ?? ""} width={22} height={22} className="object-contain" />
                                </div>
                            )}
                            <div className="min-w-0">
                                {item.title && <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-foreground leading-tight">{item.title}</p>}
                                {item.excerpt && <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{item.excerpt}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
