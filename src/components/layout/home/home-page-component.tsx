import { cacheLife } from "next/cache";
import { getPosts } from "@/lib/swipall/rest-adapter";
import { HomeSectionRenderer } from "./home-section-renderer";
import { getHomeBlockType } from "./home-section-types";

const HOME_PARENT_SLUG = "ecommerce-home";

export async function HomePageComponent() {
    "use cache";
    cacheLife("hours");

    const postsResponse = await getPosts({ parent__slug: HOME_PARENT_SLUG });
    const blocks = (postsResponse.results ?? [])
        .filter((post) => getHomeBlockType(post))
        .sort((a, b) => (a.ordering ?? 0) - (b.ordering ?? 0));

    if (blocks.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen mt-[118px] bg-muted/50">
            {blocks.map((post) => (
                <HomeSectionRenderer key={post.slug} post={post} />
            ))}
        </div>
    );
}