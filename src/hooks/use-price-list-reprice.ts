'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { repricePriceListCart } from '@/app/cart/actions';
import { usePriceListSync, PriceListSyncResult } from './use-price-list-sync';

/**
 * Orquesta la sincronización de price_list con repricing del carrito.
 * Cuando el usuario vuelve a primer plano y la price_list cambió,
 * invoca la Server Action de reprice y recarga la app con router.refresh().
 * Errores silenciados (best-effort).
 */
export function usePriceListReprice() {
    const router = useRouter();

    const handlePriceListChanged = useCallback(async (result: PriceListSyncResult) => {
        const repriced = await repricePriceListCart(
            result.localPriceListId,
            result.remotePriceListId
        );
        if (repriced) {
            router.refresh();
        }
    }, [router]);

    usePriceListSync(handlePriceListChanged);
}
