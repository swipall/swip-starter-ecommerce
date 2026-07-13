import type { CmsPost } from "@/lib/swipall/types/types";
import type { HomeBlockType } from "../home-section-types";

export interface SerializedBlockNode {
    id: string;
    type: HomeBlockType;
    slug: string;
    title: string;
    excerpt: string;
    categories: { id: string; slug: string; name: string }[];
    ordering: number;
    link: string;
    featured_image: string;
    body: string;
    parent?: string;
}

export interface AdaptedBlock {
    node: SerializedBlockNode;
    post: CmsPost;
    children: AdaptedBlock[];
}

function toCmsPost(node: SerializedBlockNode): CmsPost {
    return {
        slug: node.slug,
        title: node.title,
        excerpt: node.excerpt || null,
        body: node.body,
        categories: node.categories.map((c) => ({ name: c.name, slug: c.slug })),
        link: node.link || null,
        updated_at: new Date().toISOString(),
        featured_image: node.featured_image || null,
        ordering: node.ordering,
        author: null,
        modified_by: null,
        version: 0,
        parent: null,
    };
}

export function adaptSerializedBlocks(nodes: SerializedBlockNode[]): AdaptedBlock[] {
    const childrenByParentId = new Map<string, SerializedBlockNode[]>();
    const roots: SerializedBlockNode[] = [];

    for (const node of nodes) {
        if (node.parent) {
            const siblings = childrenByParentId.get(node.parent) ?? [];
            siblings.push(node);
            childrenByParentId.set(node.parent, siblings);
        } else {
            roots.push(node);
        }
    }

    const buildBlock = (node: SerializedBlockNode): AdaptedBlock => {
        const childNodes = (childrenByParentId.get(node.id) ?? [])
            .slice()
            .sort((a, b) => (a.ordering ?? 0) - (b.ordering ?? 0));

        return {
            node,
            post: toCmsPost(node),
            children: childNodes.map(buildBlock),
        };
    };

    return roots
        .slice()
        .sort((a, b) => (a.ordering ?? 0) - (b.ordering ?? 0))
        .map(buildBlock);
}
