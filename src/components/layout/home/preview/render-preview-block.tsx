"use server";

import type { ReactNode } from "react";
import { PreviewSectionRenderer } from "./preview-section-renderer";
import type { AdaptedBlock } from "./serialized-block-adapter";

export async function renderPreviewBlock(block: AdaptedBlock): Promise<ReactNode> {
    return <PreviewSectionRenderer block={block} />;
}
