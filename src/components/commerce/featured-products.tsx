import { ProductCarousel } from "@/components/commerce/product-carousel";
import { searchProducts } from "@/lib/swipall/rest-adapter";
import { ProductKind } from "@/lib/swipall/types/types";
import { cacheLife } from "next/cache";
import { getAuthUserCustomerId } from '@/lib/auth';

async function getFeaturedCollectionProducts(customerId?: string) {
    'use cache'
    cacheLife('days')

    try {
        const params = {
            limit: 10,
            offset: 0,
        };     
        // Fetch featured products via REST search
        const result = await searchProducts(params, customerId);
        return result.results.filter(product => product.kind !== ProductKind.Service);
    } catch (error) {
        // Return empty array during build or when API is unavailable
        return [];
    }
}


export async function FeaturedProducts() {
    const customerId = await getAuthUserCustomerId();
    const products = await getFeaturedCollectionProducts(customerId);    
    if (products?.length === 0) {
        return null;
    }

    return (
        <ProductCarousel
            title="Productos Destacados"
            products={products}
        />
    )
}