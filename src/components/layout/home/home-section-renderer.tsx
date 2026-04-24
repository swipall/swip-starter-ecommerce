import type { CmsPost } from "@/lib/swipall/types/types";
import { cacheLife } from "next/cache";
import { JSX } from "react";
import { getHomeBlockType, type HomeBlockType } from "./home-section-types";
import { HomeBannerSection } from "./sections/home-banner-section";
import { HomeBannerSliderSectionWrapper } from "./sections/home-banner-slider";
import { HomeCategoriesSection } from "./sections/home-categories-section";
import { HomeHtmlSection } from "./sections/home-html-section";
import { HomeProductsByCategorySection } from "./sections/home-products-by-category-section";

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


export async function HomeSectionRenderer({ post }: HomeSectionRendererProps) {
    "use cache";
    cacheLife("hours");
    const type = getHomeBlockType(post);
    if (!type) {
        return null;
    }

    const Renderer = SECTION_RENDERERS[type];
    return <Renderer post={post} />;
}