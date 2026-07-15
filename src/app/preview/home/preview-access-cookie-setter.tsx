"use client";

import { useEffect, useRef } from "react";
import { setPreviewAccessCookie } from "./actions";

export function PreviewAccessCookieSetter({ pk }: { pk: string }) {
    const sentRef = useRef(false);

    useEffect(() => {
        if (sentRef.current) return;
        sentRef.current = true;
        void setPreviewAccessCookie(pk);
    }, [pk]);

    return null;
}
