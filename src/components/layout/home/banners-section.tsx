import { getCatalogs } from "@/lib/swipall/cached";
import { cacheLife } from "next/cache";
import { BannerCarousel } from "./carousel";
import { CatalogInterface } from "@/lib/swipall/types/types";

export async function FeaturedBannersDisplay() {
    "use cache";
    cacheLife("days");
    
    const params = {
        parent__slug: "mmcb-ecommerce-banners",
    };
    const collections = await getCatalogs(params);
    const banners = collections.results?.filter((banner: CatalogInterface) => banner.settings?.url);

    return <BannerCarousel banners={banners} />;
}
