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

    // Usar banner completo si el item tiene título, excerpt o slug de categoría "home-banner"
    const getItemType = (item: CmsPost): "banner" | "image" => {
        if (item.title || item.excerpt) return "banner";
        const categorySlugs = new Set(item.categories?.map((cat) => cat.slug) ?? []);
        return categorySlugs.has("home-banner") ? "banner" : "image";
    };

    return (
        <section className="w-full">
            <div className="relative w-full overflow-hidden">
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
                    {items.length > 1 && (
                        <div className="hidden md:block">
                            <CarouselPrevious className="left-4 size-10" />
                            <CarouselNext className="right-4 size-10" />
                        </div>
                    )}
                </Carousel>
            </div>
        </section>
    );
}

// Componente para banner completo: flex dos columnas (texto | imagen)
function BannerSliderItemFull({ item }: { item: CmsPost }) {
    if (!item.featured_image) {
        return null;
    }

    const itemBody = parsePostBody<BannerItemBody>(item.body);
    const eyebrow = itemBody?.subtitle;
    const buttonText = itemBody?.buttonText ?? "Ver más";
    const bodyHtml = !itemBody && item.body?.trim() ? item.body : null;

    return (
        <div className="flex w-full min-h-[340px] md:min-h-[600px] overflow-hidden bg-black">
            {/* Columna texto */}
            <div className="flex flex-1 items-center px-8 md:px-12 lg:px-16 py-10">
                <div className="w-full max-w-sm text-white space-y-4">
                    {eyebrow && (
                        <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-white/70 font-jost font-semibold">
                            {eyebrow}
                        </p>
                    )}
                    {item.title && (
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight font-jost">
                            {item.title}
                        </h2>
                    )}
                    {item.excerpt && (
                        <p className="text-sm md:text-base text-white/85 font-inter">
                            {item.excerpt}
                        </p>
                    )}
                    {bodyHtml && (
                        <div
                            className="text-sm md:text-base text-white/85 font-inter [&_p]:mb-2 [&_strong]:font-bold"
                            dangerouslySetInnerHTML={{ __html: bodyHtml }}
                        />
                    )}
                    {item.link && (
                        <div className="pt-2">
                            <Button asChild size="lg">
                                <Link href={item.link}>{buttonText}</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            {/* Columna imagen */}
            <div className="relative w-[45%] md:w-1/2 shrink-0">
                <Image
                    src={item.featured_image}
                    alt={item.title ?? "Banner"}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover h-full"
                    priority
                />
            </div>
        </div>
    );
}

// Componente para imagen simple (sin texto, con link opcional)
function BannerSliderItemSimple({ item }: { item: CmsPost }) {
    if (!item.featured_image) {
        return null;
    }

    const img = (
        <div className="relative w-full aspect-[16/7] min-h-[280px] rounded-2xl overflow-hidden">
            <Image
                src={item.featured_image}
                alt="Banner"
                fill
                sizes="100vw"
                className="object-cover"
                priority
            />
        </div>
    );

    if (item.link) {
        return (
            <Link href={item.link} className="block w-full hover:opacity-95 transition-opacity">
                {img}
            </Link>
        );
    }

    return img;
}
