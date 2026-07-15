import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { timingSafeEqual } from "crypto";
import { Suspense } from "react";
import { PreviewHomeClient } from "@/components/layout/home/preview/preview-home-client";
import { PreviewAccessCookieSetter } from "./preview-access-cookie-setter";

const PREVIEW_ACCESS_COOKIE = "swipall-preview-access";

function safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
}

export default function PreviewHomePage({
    searchParams,
}: {
    searchParams: Promise<{ pk?: string }>;
}) {
    return (
        <Suspense fallback={null}>
            <PreviewHomeGuard searchParams={searchParams} />
        </Suspense>
    );
}

async function PreviewHomeGuard({
    searchParams,
}: {
    searchParams: Promise<{ pk?: string }>;
}) {
    const secret = process.env.PREVIEW_ACCESS_SECRET;
    const allowedOrigins = (process.env.CMS_EDITOR_ORIGIN ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    if (!secret || allowedOrigins.length === 0) {
        notFound();
    }

    const { pk } = await searchParams;
    const cookieStore = await cookies();
    const existingCookie = cookieStore.get(PREVIEW_ACCESS_COOKIE)?.value;

    const hasValidQueryToken = typeof pk === "string" && safeEqual(pk, secret);
    const hasValidCookie = typeof existingCookie === "string" && safeEqual(existingCookie, secret);

    if (!hasValidQueryToken && !hasValidCookie) {
        notFound();
    }

    return (
        <>
            {hasValidQueryToken && <PreviewAccessCookieSetter pk={pk as string} />}
            <PreviewHomeClient allowedOrigins={allowedOrigins} />
        </>
    );
}
