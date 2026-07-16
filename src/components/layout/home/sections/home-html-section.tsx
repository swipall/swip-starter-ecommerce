import type { CmsPost } from "@/lib/swipall/types/types";
import { looksLikeJson } from "../home-section-types";

interface HomeHtmlSectionProps {
    post: CmsPost;
}

export function HomeHtmlSection({ post }: HomeHtmlSectionProps) {
    if (!post.body || looksLikeJson(post.body)) {
        return null;
    }

    return (
        <section>
            <div
                className="container mx-auto prose prose-neutral max-w-none"
                dangerouslySetInnerHTML={{ __html: post.body }}
            />
        </section>
    );
}
