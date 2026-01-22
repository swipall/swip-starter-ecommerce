import {ProductCarousel} from "@/components/commerce/product-carousel";
import {cacheLife} from "next/cache";
import { searchProducts } from "@/lib/swipall/rest-adapter";

async function getFeaturedCollectionProducts() {
    'use cache'
    cacheLife('days')

    try {
        // Fetch featured products via REST search
        const result = await searchProducts({  limit: 10,offset: 0, });
        return result.results;
    } catch (error) {
        // Return empty array during build or when API is unavailable
        return [];
    }
}


export async function FeaturedProducts() {
    const products = await getFeaturedCollectionProducts();

    if (products.length === 0) {
        return null;
    }

    return (
        <ProductCarousel
            title="Productos Destacados"
            products={products}
        />
    )
}