'use client';

import {ProductCard} from "@/components/commerce/product-card";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,} from "@/components/ui/carousel";
import { InterfaceInventoryItem } from "@/lib/swipall/types/types";
import Link from "next/link";
import {useId} from "react";

export interface ProductCarouselFilter {
    id: string;
    label: string;
    href: string;
}

interface ProductCarouselClientProps {
    title: string;
    excerpt?: string | null;
    products: InterfaceInventoryItem[];
    filters?: ProductCarouselFilter[];
}

export function ProductCarousel({title, excerpt, products, filters}: ProductCarouselClientProps) {
    const id = useId();

    if(!products){
        return null;
    }

    return (
        <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
                {excerpt && <p className="font-jost text-[#FF637E] text-[11px] font-bold uppercase tracking-[2px] mb-1">{excerpt}</p>}
                <h2 className="font-jost text-2xl md:text-3xl font-black uppercase tracking-[2px] mb-8">{title}</h2>
                {filters && filters.length > 0 && (
                    <div className="flex flex-nowrap overflow-x-auto gap-2 mb-6 -mx-4 px-4 scrollbar-hide">
                        {filters.map((filter) => (
                            <Link
                                key={filter.id}
                                href={filter.href}
                                className="flex-shrink-0 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white text-black border border-gray-300 hover:border-primary hover:text-primary transition-colors"
                            >
                                {filter.label}
                            </Link>
                        ))}
                    </div>
                )}
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {products.map((product, i) => (
                            <CarouselItem key={id + i}
                                          className="pl-2 md:pl-4 basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                <ProductCard product={product}/>
                            </CarouselItem>
                        ))}
                    </CarouselContent> 
                    <CarouselPrevious className="hidden md:flex left-2"/>
                    <CarouselNext className="hidden md:flex right-2"/>
                </Carousel>
            </div>
        </section>
    );
}
