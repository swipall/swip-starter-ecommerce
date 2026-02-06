import { ProductCarousel } from "@/components/commerce/product-carousel";
import { cacheLife, cacheTag } from "next/cache";
import { searchProducts } from '@/lib/swipall/rest-adapter';
import { InterfaceInventoryItem } from "@/lib/swipall/types/types";
import { getAuthUserCustomerId } from '@/lib/auth';

interface RelatedProductsProps {
    collectionSlug: string;
    currentProductId: string;
}

async function getRelatedProducts(collectionSlug: string, currentProductId: string, customerId?: string) {
    'use cache'
    cacheLife('hours')
    cacheTag(`related-products-${collectionSlug}`)

    const result = await searchProducts({
        search: collectionSlug,
        limit: 13, // Fetch extra to account for filtering out current product
        offset: 0
    }, customerId);

    // Filter out the current product and limit to 12
    return result.results
        .filter((product: InterfaceInventoryItem) => product.id !== currentProductId)
        .slice(0, 12);
}

export async function RelatedProducts({ collectionSlug, currentProductId }: RelatedProductsProps) {
    const customerId = await getAuthUserCustomerId();
    const products = await getRelatedProducts(collectionSlug, currentProductId, customerId);

    if (products.length === 0) {
        return null;
    }

    return (
        <ProductCarousel
            title="Related Products"
            products={products}
        />
    );
}
