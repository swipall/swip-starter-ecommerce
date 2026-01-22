import Image from 'next/image';
import { Price } from '@/components/commerce/price';
import { Suspense } from "react";
import Link from "next/link";
import type { InterfaceInventoryItem } from '@/lib/swipall/rest-adapter';

interface ProductCardProps {
    product: InterfaceInventoryItem;
}

export function ProductCard({product}: ProductCardProps) {
    const price = product.web_price ? parseFloat(product.web_price) : undefined;
    const imageUrl = product.featured_image || product.pictures?.[0]?.url;

    return (
        <Link
            href={`/product/${product.slug}`}
            className="group block bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow"
        >
            <div className="aspect-square relative bg-muted">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Sin imagen
                    </div>
                )}
            </div>
            <div className="p-4 space-y-2">
                <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                </h3>
                <Suspense fallback={<div className="h-8 w-36 rounded bg-muted"></div>}>
                    <p className="text-lg font-bold">
                        {price ? (
                            <Price value={price} />
                        ) : (
                            <span className="text-muted-foreground">Precio no disponible</span>
                        )}
                    </p>
                </Suspense>
            </div>
        </Link>
    );
}
