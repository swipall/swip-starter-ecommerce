"use client";

import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { CatalogInterface } from "@/lib/swipall/types/types";

interface HeroCarouselProps {
    banners: CatalogInterface[];
}

export function BannerCarousel({ banners }: HeroCarouselProps) {
    if (banners?.length === 0 || !banners) {
        return null;
    }

    return (
        <section className="relative w-full overflow-hidden bg-muted">
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                plugins={[
                    Autoplay({
                        delay: 5000,
                        stopOnInteraction: true,
                    }),
                ]}
                className="w-full"
            >
                <CarouselContent>
                    {banners.map((banner) => (
                        <CarouselItem key={banner.id}>
                            <div className="relative w-full aspect-[21/9] md:aspect-[21/7] lg:aspect-[21/6]">
                                <Image
                                    src={banner.settings!.url}
                                    alt={banner.name}
                                    fill
                                    className="object-contain"
                                    priority
                                    sizes="100vw"
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="hidden md:block">
                    <CarouselPrevious className="left-4 size-10" />
                    <CarouselNext className="right-4 size-10" />
                </div>
            </Carousel>
        </section>
    );
}
