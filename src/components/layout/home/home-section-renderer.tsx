import { cacheLife } from "next/cache";
import { getPostDetail, getPosts } from "@/lib/swipall/rest-adapter";
import type { CmsPost } from "@/lib/swipall/types/types";
import { getHomeBlockType, type HomeBlockType } from "./home-section-types";
import { HomeBannerSection } from "./sections/home-banner-section";
import { HomeBannerSliderSection } from "./sections/home-banner-slider-section";
import { HomeCategoriesSection } from "./sections/home-categories-section";
import { HomeProductsByCategorySection } from "./sections/home-products-by-category-section";
import { HomeHtmlSection } from "./sections/home-html-section";
import { JSX } from "react";
import { HomeBannerSliderSectionWrapper } from "./sections/home-banner-slider";

interface HomeSectionRendererProps {
    post: CmsPost;
}

const SECTION_RENDERERS: Record<HomeBlockType, (props: { post: CmsPost; items?: CmsPost[] }) => JSX.Element | Promise<JSX.Element | null>> = {
    "home-banner": HomeBannerSection as any,
    "home-banner-slider": HomeBannerSliderSectionWrapper,
    "home-categories": HomeCategoriesSection as any,
    "home-products-by-category": HomeProductsByCategorySection as any,
    "home-html": HomeHtmlSection as any,
};


const USER_DEPENDENT_SECTIONS: HomeBlockType[] = ["home-products-by-category"];

async function CachedSectionRenderer({ post }: HomeSectionRendererProps) {
    "use cache";
    cacheLife("hours");
    const type = getHomeBlockType(post);
    if (!type) return null;
    const Renderer = SECTION_RENDERERS[type];
    return <Renderer post={post} />;
}

export async function HomeSectionRenderer({ post }: HomeSectionRendererProps) {
    const type = getHomeBlockType(post);
    if (!type) return null;

    if (USER_DEPENDENT_SECTIONS.includes(type)) {
        const Renderer = SECTION_RENDERERS[type];
        return <Renderer post={post} />;
    }

    return <CachedSectionRenderer post={post} />;
}