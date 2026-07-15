"use server";

import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";

const PREVIEW_ACCESS_COOKIE = "swipall-preview-access";

function safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
}

export async function setPreviewAccessCookie(pk: string): Promise<void> {
    const secret = process.env.PREVIEW_ACCESS_SECRET;
    if (!secret || !safeEqual(pk, secret)) return;

    const cookieStore = await cookies();
    cookieStore.set(PREVIEW_ACCESS_COOKIE, secret, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
    });
}
