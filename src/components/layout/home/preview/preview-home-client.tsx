"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { adaptSerializedBlocks, type AdaptedBlock, type SerializedBlockNode } from "./serialized-block-adapter";
import { renderPreviewBlock } from "./render-preview-block";
import { HomeHeroSkeleton } from "@/components/shared/skeletons/home-hero-skeleton";
import { HomeCategoriesSkeleton } from "@/components/shared/skeletons/home-categories-skeleton";
import { HomeProductGridSkeleton } from "@/components/shared/skeletons/home-product-grid-skeleton";

interface PreviewSyncMessage {
    type: "swipall-cms:sync-layout";
    payload: {
        blocks: SerializedBlockNode[];
        activeBlockId: string | null;
    };
}

type BlockStatus = "hydrated" | "loading" | "out-of-stock" | "unknown-type";

function isPreviewSyncMessage(data: unknown): data is PreviewSyncMessage {
    if (typeof data !== "object" || data === null) return false;
    const candidate = data as Record<string, unknown>;
    if (candidate.type !== "swipall-cms:sync-layout") return false;
    const payload = candidate.payload as Record<string, unknown> | undefined;
    if (typeof payload !== "object" || payload === null) return false;
    if (!Array.isArray(payload.blocks)) return false;
    if (payload.activeBlockId !== null && typeof payload.activeBlockId !== "string") return false;
    return payload.blocks.every(
        (block) =>
            typeof block === "object" &&
            block !== null &&
            typeof (block as Record<string, unknown>).id === "string" &&
            typeof (block as Record<string, unknown>).type === "string" &&
            typeof (block as Record<string, unknown>).slug === "string",
    );
}

function skeletonForType(type: string) {
    switch (type) {
        case "home-banner":
        case "home-banner-slider":
        case "home-promo-banner":
            return <HomeHeroSkeleton />;
        case "home-categories":
            return <HomeCategoriesSkeleton />;
        case "home-products-by-category":
            return <HomeProductGridSkeleton />;
        default:
            return null;
    }
}

interface PreviewHomeClientProps {
    allowedOrigin: string;
}

export function PreviewHomeClient({ allowedOrigin }: PreviewHomeClientProps) {
    const [blocks, setBlocks] = useState<AdaptedBlock[]>([]);
    const readySentRef = useRef(false);

    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (event.origin !== allowedOrigin) return;
            if (!isPreviewSyncMessage(event.data)) return;
            setBlocks(adaptSerializedBlocks(event.data.payload.blocks));
        }

        window.addEventListener("message", handleMessage);

        if (!readySentRef.current) {
            readySentRef.current = true;
            window.parent.postMessage({ type: "swipall-cms:ready" }, allowedOrigin);
        }

        return () => window.removeEventListener("message", handleMessage);
    }, [allowedOrigin]);

    if (blocks.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen">
            {blocks.map((block) => (
                <BlockBoundary key={block.node.id} block={block} allowedOrigin={allowedOrigin} />
            ))}
        </div>
    );
}

function BlockBoundary({ block, allowedOrigin }: { block: AdaptedBlock; allowedOrigin: string }) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const lastReportedRef = useRef<{ status: BlockStatus; top: number; height: number } | null>(null);
    const [content, setContent] = useState<ReactNode>(null);
    const [status, setStatus] = useState<BlockStatus>("loading");

    const report = (nextStatus: BlockStatus) => {
        const el = wrapperRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const boundingRect = { top: rect.top, height: rect.height };

        const last = lastReportedRef.current;
        if (last && last.status === nextStatus && last.top === boundingRect.top && last.height === boundingRect.height) {
            return;
        }
        lastReportedRef.current = { status: nextStatus, ...boundingRect };

        window.parent.postMessage(
            {
                type: "swipall-cms:block-rendered",
                payload: { blockId: block.node.id, status: nextStatus, boundingRect },
            },
            allowedOrigin,
        );
    };

    useEffect(() => {
        let cancelled = false;
        setStatus("loading");
        report("loading");

        renderPreviewBlock(block)
            .then((rendered) => {
                if (cancelled) return;
                setContent(rendered);
                const el = wrapperRef.current;
                const statusEl = el?.querySelector<HTMLElement>("[data-block-status]");
                const resolvedStatus = (statusEl?.dataset.blockStatus as BlockStatus | undefined) ?? "hydrated";
                setStatus(resolvedStatus);
            })
            .catch(() => {
                if (!cancelled) setStatus("unknown-type");
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [block]);

    useEffect(() => {
        report(status);

        const el = wrapperRef.current;
        if (!el) return;

        const resizeObserver = new ResizeObserver(() => report(status));
        resizeObserver.observe(el);

        return () => resizeObserver.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, content]);

    return (
        <div ref={wrapperRef} data-block-id={block.node.id}>
            {content ?? skeletonForType(block.node.type)}
        </div>
    );
}
