import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { renderToReadableStream } from "react-dom/server.edge";
import { PreviewSectionRenderer } from "@/components/layout/home/preview/preview-section-renderer";
import { adaptSerializedBlocks, type SerializedBlockNode } from "@/components/layout/home/preview/serialized-block-adapter";

export const runtime = "edge";

const PREVIEW_ACCESS_COOKIE = "swipall-preview-access";

function safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
}

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = "";
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
    }
    return result;
}

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    const secret = process.env.PREVIEW_ACCESS_SECRET;
    const accessCookie = cookieStore.get(PREVIEW_ACCESS_COOKIE)?.value;

    if (!secret || typeof accessCookie !== "string" || !safeEqual(accessCookie, secret)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const node = (await req.json()) as SerializedBlockNode;
    const [block] = adaptSerializedBlocks([node]);
    if (!block) {
        return NextResponse.json({ error: "Invalid block" }, { status: 400 });
    }

    try {
        const stream = await renderToReadableStream(<PreviewSectionRenderer block={block} />);
        const html = await streamToString(stream);
        const status = html.match(/data-block-status="([^"]*)"/)?.[1] ?? "hydrated";
        return NextResponse.json({ html, status });
    } catch {
        return NextResponse.json({ error: "Failed to render block" }, { status: 500 });
    }
}
