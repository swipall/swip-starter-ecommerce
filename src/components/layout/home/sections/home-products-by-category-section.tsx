import { ProductCarousel } from "@/components/commerce/product-carousel";
import { getTaxonomyBySlugCached, getTaxonomyChildrenCached } from "@/lib/swipall/cached";
import { searchProducts } from "@/lib/swipall/rest-adapter";
import { sortByLabel } from "@/lib/swipall/taxonomy-helpers";
import { ProductKind } from "@/lib/swipall/types/types";
import type { CmsPost } from "@/lib/swipall/types/types";
import { parsePostBody } from "../home-section-types";
import { getAuthUserCustomerId } from "@/lib/auth";

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

    const customerId = await getAuthUserCustomerId();

    let result;
    try {
        result = await searchProducts({
            limit,
            offset: 0,
            ordering,
            taxonomies__slug__and: categorySlug,
        }, customerId);
    } catch {
        return null;
    }

    const products = result.results.filter((product) => product.kind !== ProductKind.Service);

    if (products.length === 0) {
        return null;
    }

    const parentTaxonomy = await getTaxonomyBySlugCached(categorySlug);
    const children = parentTaxonomy ? sortByLabel(await getTaxonomyChildrenCached(parentTaxonomy.id)) : [];
    const filters = children.map((child) => ({
        id: child.id,
        label: child.value ?? child.name,
        href: `/collection/${child.slug}`,
    }));

    return <ProductCarousel title={post.title ?? "Productos"} excerpt={post.excerpt} products={products} filters={filters} />;
}