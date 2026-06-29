import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CmsPost } from "@/lib/swipall/types/types";
import { parsePostBody } from "../home-section-types";

interface PromoBannerBody {
    buttonText?: string;
    subtitle?: string;
}

export function HomePromoBannerSection({ post }: { post: CmsPost }) {
    if (!post.title) return null;

    const body = parsePostBody<PromoBannerBody>(post.body);
    const subtitle = body?.subtitle ?? post.excerpt;
    const buttonText = body?.buttonText;

    if (post.featured_image) {
        return <PromoBannerWithImage post={post} subtitle={subtitle} buttonText={buttonText} />;
    }

    return <PromoBannerStrip post={post} subtitle={subtitle} buttonText={buttonText} />;
}

function PromoBannerWithImage({
    post,
    subtitle,
    buttonText,
}: {
    post: CmsPost;
    subtitle?: string | null;
    buttonText?: string;
}) {
    const content = (
        <div className={`container mx-auto rounded-xl relative w-full aspect-[21/6] md:aspect-[21/5] overflow-hidden${post.link ? " group" : ""}`}>
            <Image
                src={post.featured_image!}
                alt={post.title ?? "Banner promocional"}
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/0" />
            <div className="absolute inset-0 flex flex-col items-start justify-center text-white text-left px-4 space-y-3">
                {subtitle && (
                    <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-white/75 font-jost font-semibold">
                        {subtitle}
                    </p>
                )}
                <h2 className="text-2xl md:text-4xl font-bold font-jost uppercase tracking-wide leading-tight">
                    {post.title}
                </h2>
                {post.link && buttonText && (
                    <div className="pt-1">
                        <Button asChild size="lg" variant="accent" className="">
                            <span>{buttonText}</span>
                        </Button>
                    </div>
                )}
                {post.link && !buttonText && (
                    <ArrowRight className="w-6 h-6 mt-1 transition-transform group-hover:translate-x-1" />
                )}
            </div>
        </div>
    );

    if (post.link) {
        return (
            <section>
                <Link href={post.link} className="block">
                    {content}
                </Link>
            </section>
        );
    }

    return <section>{content}</section>;
}

function PromoBannerStrip({
    post,
    subtitle,
    buttonText,
}: {
    post: CmsPost;
    subtitle?: string | null;
    buttonText?: string;
}) {
    const inner = (
        <div className={`w-full bg-accent text-accent-foreground py-4 px-6 flex items-start justify-center gap-3${post.link ? " group" : ""}`}>
            <div className="text-left space-y-0.5">
                {subtitle && (
                    <p className="text-xs uppercase tracking-widest opacity-80 font-jost">
                        {subtitle}
                    </p>
                )}
                <p className="font-bold text-sm md:text-base font-jost uppercase tracking-widest">
                    {post.title}
                </p>
                {buttonText && (
                    <p className="text-xs mt-1 underline font-inter">{buttonText}</p>
                )}
            </div>
            {post.link && (
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
            )}
        </div>
    );

    if (post.link) {
        return (
            <section>
                <Link href={post.link} className="block hover:opacity-90 transition-opacity">
                    {inner}
                </Link>
            </section>
        );
    }

    return <section>{inner}</section>;
}
