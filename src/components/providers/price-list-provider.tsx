'use client';

import { usePriceListReprice } from '@/hooks/use-price-list-reprice';

export function PriceListProvider({ children }: { children: React.ReactNode }) {
    usePriceListReprice();
    return <>{children}</>;
}
