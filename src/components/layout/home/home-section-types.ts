import type { CmsPost } from "@/lib/swipall/types/types";

export type { BannerSliderBody } from "@/lib/swipall/types/types";

export const HOME_BLOCK_TYPES = {
    Banner: "home-banner",
    BannerSlider: "home-banner-slider",
    PromoBanner: "home-promo-banner",
    Categories: "home-categories",
    ProductsByCategory: "home-products-by-category",
    Html: "home-html",
    CompanyInfo: "home-company-info",
    TikTok: "tik-tok-section",
} as const;

export type HomeBlockType = (typeof HOME_BLOCK_TYPES)[keyof typeof HOME_BLOCK_TYPES];

const HOME_TYPE_ORDER: HomeBlockType[] = [
    HOME_BLOCK_TYPES.Banner,
    HOME_BLOCK_TYPES.BannerSlider,
    HOME_BLOCK_TYPES.PromoBanner,
    HOME_BLOCK_TYPES.Categories,
    HOME_BLOCK_TYPES.ProductsByCategory,
    HOME_BLOCK_TYPES.Html,
    HOME_BLOCK_TYPES.CompanyInfo,
    HOME_BLOCK_TYPES.TikTok,
];

export function getHomeBlockType(post: CmsPost): HomeBlockType | null {
    const categorySlugs = new Set(post.categories?.map((category) => category.slug) ?? []);    
    for (const type of HOME_TYPE_ORDER) {
        if (categorySlugs.has(type)) {
            return type;
        }
    }
    return null;
}

export function parsePostBody<T>(body: string | null | undefined): T | null {
    if (!body) return null;

    try {
        return JSON.parse(body) as T;
    } catch (error) {
        return null;
    }
}

/**
 * home-html bodies are meant to be raw HTML. Other block types (e.g.
 * home-company-info) store JSON.stringify(BlockBody) in the same field —
 * if a node is mistagged, this keeps that JSON from being dumped as HTML.
 */
export function looksLikeJson(body: string | null | undefined): boolean {
    if (!body) return false;
    const trimmed = body.trim();
    return trimmed.startsWith("{") || trimmed.startsWith("[");
}
