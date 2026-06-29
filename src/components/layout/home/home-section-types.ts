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