'use client';

import { useCallback, useEffect, useRef } from 'react';
import { getAuthUser, setAuthUser } from '@/lib/auth-client';
import { getCustomerInfoAction } from '@/app/account/actions';
import { PriceListInterface } from '@/lib/swipall/users/user.types';

export interface PriceListSyncResult {
    localPriceListId: string | null | undefined;
    remotePriceListId: string | null | undefined;
    changed: boolean;
    remotePriceList: PriceListInterface | null | undefined;
}

/**
 * Detecta si la price_list del cliente cambió respecto a lo almacenado localmente.
 * Se dispara cuando el usuario vuelve a poner la pestaña en primer plano.
 * Llama al callback `onPriceListChanged` si detecta un cambio.
 */
export function usePriceListSync(onPriceListChanged: (result: PriceListSyncResult) => void) {
    const isSyncing = useRef(false);

    const syncPriceList = useCallback(async () => {
        const localUser = getAuthUser();
        if (!localUser) return;
        if (isSyncing.current) return;

        isSyncing.current = true;
        try {
            const remoteInfo = await getCustomerInfoAction();
            if (!remoteInfo) return;
            const localPriceListId = localUser.price_list?.id ?? null;
            const remotePriceListId = remoteInfo.price_list?.id ?? null;

            if (localPriceListId !== remotePriceListId) {
                // Actualiza localStorage con la info remota actualizada
                setAuthUser({ ...localUser, ...remoteInfo });

                onPriceListChanged({
                    localPriceListId,
                    remotePriceListId,
                    changed: true,
                    remotePriceList: remoteInfo.price_list ?? null,
                });
            }
        } catch {
            // Silencia errores de red — best-effort
        } finally {
            isSyncing.current = false;
        }
    }, [onPriceListChanged]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                syncPriceList();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [syncPriceList]);
}
