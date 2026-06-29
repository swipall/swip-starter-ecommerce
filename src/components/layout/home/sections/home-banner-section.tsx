import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CmsPost } from "@/lib/swipall/types/types";
import { parsePostBody } from "../home-section-types";

interface HomeBannerBody {
    subtitle?: string;
    autoplay?: boolean;
    buttonText?: string;
}

interface HomeBannerSectionProps {
    post: CmsPost;
}

export function HomeBannerSection({ post }: HomeBannerSectionProps) {
    if (!post.featured_image) {
        return null;
    }

    const body = parsePostBody<HomeBannerBody>(post.body);
    const subtitle = body?.subtitle;
    const buttonText = body?.buttonText ?? "Ver más";

    return (
        <section className="relative w-full overflow-hidden bg-muted">
            <div className="relative w-full aspect-[21/9] md:aspect-[21/7] lg:aspect-[21/6]">
                <Image
                    src={post.featured_image}
                    alt={post.title ?? "Banner"}
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
                            {post.title && (
                                <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                                    {post.title}
                                </h2>
                            )}
                            {post.excerpt && (
                                <p className="text-base md:text-lg text-white/90">
                                    {post.excerpt}
                                </p>
                            )}
                            {post.link && (
                                <Button asChild size="lg">
                                    <Link href={post.link}>{buttonText} DFDF</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}