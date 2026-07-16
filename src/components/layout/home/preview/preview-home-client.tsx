"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { adaptSerializedBlocks, type AdaptedBlock, type SerializedBlockNode } from "./serialized-block-adapter";
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
    allowedOrigins: string[];
}

export function PreviewHomeClient({ allowedOrigins }: PreviewHomeClientProps) {
    const [blocks, setBlocks] = useState<AdaptedBlock[]>([]);
    const readySentRef = useRef(false);
    const activeOriginRef = useRef<string>(allowedOrigins[0]);

    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (!allowedOrigins.includes(event.origin)) return;
            if (!isPreviewSyncMessage(event.data)) return;
            activeOriginRef.current = event.origin;
            setBlocks(adaptSerializedBlocks(event.data.payload.blocks));
        }

        window.addEventListener("message", handleMessage);

        if (!readySentRef.current) {
            readySentRef.current = true;
            for (const origin of allowedOrigins) {
                window.parent.postMessage({ type: "swipall-cms:ready" }, origin);
            }
        }

        return () => window.removeEventListener("message", handleMessage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (blocks.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen">
            {blocks.map((block) => (
                <BlockBoundary key={block.node.id} block={block} activeOriginRef={activeOriginRef} />
            ))}
        </div>
    );
}

function BlockBoundary({
    block,
    activeOriginRef,
}: {
    block: AdaptedBlock;
    activeOriginRef: RefObject<string>;
}) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const lastReportedRef = useRef<{ status: BlockStatus; top: number; height: number } | null>(null);
    const [html, setHtml] = useState<string | null>(null);
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
            activeOriginRef.current,
        );
    };

    const flattenNodes = (b: AdaptedBlock): SerializedBlockNode[] => [b.node, ...b.children.flatMap(flattenNodes)];
    const blockContentKey = useMemo(() => JSON.stringify(flattenNodes(block)), [block]);

    useEffect(() => {
        let cancelled = false;
        setStatus("loading");
        report("loading");

        fetch("/api/preview/render-block", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(flattenNodes(block)),
        })
            .then((res) => {
                if (!res.ok) throw new Error("render failed");
                return res.json() as Promise<{ html: string; status: BlockStatus }>;
            })
            .then(({ html: rendered, status: resolvedStatus }) => {
                if (cancelled) return;
                setHtml(rendered);
                setStatus(resolvedStatus);
            })
            .catch(() => {
                if (!cancelled) setStatus("unknown-type");
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blockContentKey]);

    useEffect(() => {
        report(status);

        const el = wrapperRef.current;
        if (!el) return;

        const resizeObserver = new ResizeObserver(() => report(status));
        resizeObserver.observe(el);

        return () => resizeObserver.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, html]);

    return (
        <div ref={wrapperRef} data-block-id={block.node.id}>
            {html !== null ? (
                <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
                skeletonForType(block.node.type)
            )}
        </div>
    );
}
