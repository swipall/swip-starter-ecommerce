import Image from 'next/image';
import { Price } from '@/components/commerce/price';
import { Suspense } from "react";
import Link from "next/link";
import { InterfaceInventoryItem } from '@/lib/swipall/types/types';

interface ProductCardProps {
    product: InterfaceInventoryItem;
}

export function ProductCard({product}: ProductCardProps) {
    const priceVal = product.price ? parseFloat(product.price) : undefined;
    const webPriceVal = product.web_price ? parseFloat(product.web_price) : undefined;
    const finalPrice = priceVal ?? webPriceVal;
    const originalPrice = priceVal && webPriceVal && webPriceVal > priceVal ? webPriceVal : undefined;
    const hasDiscount = !!originalPrice;
    const imageUrl = product.featured_image || product.pictures?.[0]?.url;
    return (
        <Link
            href={`/product/${product.id}`}
            className="group block bg-card rounded-lg overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all"
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
                    <div className="w-full h-full flex items-center justify-center text-foreground">
                        Sin imagen
                    </div>
                )}
            </div>
            <div className="p-4 space-y-2">
                <h3 className="font-medium text-muted-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                </h3>
                <Suspense fallback={<div className="h-8 w-36 rounded bg-muted"></div>}>
                    <div className="flex flex-col gap-0.5">
                        {finalPrice ? (
                            <p className="text-lg font-bold text-primary">
                                <Price value={finalPrice} />
                            </p>
                        ) : (
                            <span className="text-foreground">Precio no disponible</span>
                        )}
                        {hasDiscount && (
                            <p className="text-sm text-muted-foreground line-through">
                                <Price value={originalPrice} />
                            </p>
                        )}
                    </div>
                </Suspense>
            </div>
        </Link>
    );
}
