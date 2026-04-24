"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import type { CmsPost } from "@/lib/swipall/types/types";
import { BannerSliderBody, parsePostBody } from "../home-section-types";

interface HomeBannerSliderSectionProps {
    post: CmsPost;
    items: CmsPost[];
}

interface BannerItemBody {
    subtitle?: string;
    buttonText?: string;
}

export function HomeBannerSliderSection({
    post,
    items,
}: HomeBannerSliderSectionProps) {
    if (!items || items.length === 0) {
        return null;
    }

    const sliderConfig = parsePostBody<BannerSliderBody>(post.body);
    const autoplay = sliderConfig?.autoplay ?? true;
    const duration = sliderConfig?.duration ?? 5000;

    // Determinar el tipo de cada item
    const getItemType = (item: CmsPost): "banner" | "image" => {
        const categorySlugs = new Set(item.categories?.map((cat) => cat.slug) ?? []);
        return categorySlugs.has("home-banner") ? "banner" : "image";
    };

    return (
        <section className="relative w-full overflow-hidden bg-muted">
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                plugins={
                    autoplay
                        ? [
                              Autoplay({
                                  delay: duration,
                                  stopOnInteraction: true,
                              }),
                          ]
                        : []
                }
                className="w-full"
            >
                <CarouselContent>
                    {items.map((item) => {
                        const itemType = getItemType(item);

                        if (itemType === "banner") {
                            return (
                                <CarouselItem key={item.slug}>
                                    <BannerSliderItemFull item={item} />
                                </CarouselItem>
                            );
                        } else {
                            return (
                                <CarouselItem key={item.slug}>
                                    <BannerSliderItemSimple item={item} />
                                </CarouselItem>
                            );
                        }
                    })}
                </CarouselContent>
                <div className="hidden md:block">
                    <CarouselPrevious className="left-4 size-10" />
                    <CarouselNext className="right-4 size-10" />
                </div>
            </Carousel>
        </section>
    );
}

// Componente para banner completo (con título, subtítulo y botón)
function BannerSliderItemFull({ item }: { item: CmsPost }) {
    if (!item.featured_image) {
        return null;
    }

    const itemBody = parsePostBody<BannerItemBody>(item.body);
    const subtitle = itemBody?.subtitle;
    const buttonText = itemBody?.buttonText ?? "Ver más";

    return (
        <div className="relative w-full aspect-[21/9] md:aspect-[21/7] lg:aspect-[21/6]">
            <Image
                src={item.featured_image}
                alt={item.title ?? "Banner"}
                fill
                className="object-cover"
                priority
                sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-xl text-white space-y-4">
                        {subtitle && (
                            <p className="text-sm uppercase tracking-[0.2em] text-white/80">
                                {subtitle}
                            </p>
                        )}
                        {item.title && (
                            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                                {item.title}
                            </h2>
                        )}
                        {item.excerpt && (
                            <p className="text-base md:text-lg text-white/90">
                                {item.excerpt}
                            </p>
                        )}
                        {item.link && (
                            <Button asChild size="lg">
                                <Link href={item.link}>{buttonText}</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Componente para imagen simple (sin texto, con link opcional)
function BannerSliderItemSimple({ item }: { item: CmsPost }) {
    if (!item.featured_image) {
        return null;
    }

    // Si tiene link, la imagen es clickeable
    if (item.link) {
        return (
            <Link href={item.link}>
                <div className="relative w-full aspect-[21/9] md:aspect-[21/7] lg:aspect-[16/6] cursor-pointer group">
                    <Image
                        src={item.featured_image}
                        alt="Banner"
                        fill
                        className="object-cover group-hover:opacity-90 transition-opacity"
                        priority
                        sizes="100vw"
                    />
                </div>
            </Link>
        );
    }

    // Sin link, solo la imagen
    return (
        <div className="relative w-full aspect-[21/9] md:aspect-[21/7] lg:aspect-[16/6]">
            <Image
                src={item.featured_image}
                alt="Banner"
                fill
                className="object-cover"
                priority
                sizes="100vw"
            />
        </div>
    );
}
