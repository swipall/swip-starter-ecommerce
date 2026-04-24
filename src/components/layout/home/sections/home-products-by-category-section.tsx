import { ProductCarousel } from "@/components/commerce/product-carousel";
import { searchProducts } from "@/lib/swipall/rest-adapter";
import { ProductKind } from "@/lib/swipall/types/types";
import type { CmsPost } from "@/lib/swipall/types/types";
import { parsePostBody } from "../home-section-types";

interface HomeProductsByCategoryBody {
    category_slug?: string;
    limit?: number;
    order?: string;
}

interface HomeProductsByCategorySectionProps {
    post: CmsPost;
}

const orderMapping: Record<string, string> = {
    popular: "popular",
    new: "new",
    price_asc: "price_asc",
    price_desc: "price_desc",
};

export async function HomeProductsByCategorySection({ post }: HomeProductsByCategorySectionProps) {
    const body = parsePostBody<HomeProductsByCategoryBody>(post.body);
    const categorySlug = body?.category_slug;
    const limit = body?.limit ?? 8;
    const ordering = body?.order ? orderMapping[body.order] ?? body.order : undefined;

    if (!categorySlug) {
        return null;
    }

    const result = await searchProducts({
        limit,
        offset: 0,
        ordering,
        taxonomies__slug__and: categorySlug,
    });

    const products = result.results.filter((product) => product.kind !== ProductKind.Service);

    if (products.length === 0) {
        return null;
    }

    return <ProductCarousel title={post.title ?? "Productos"} products={products} />;
}