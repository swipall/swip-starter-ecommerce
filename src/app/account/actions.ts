'use server';

import { getCustomerInfoServer } from '@/lib/swipall/users/server';
import { SwipallAPIError } from '@/lib/swipall/api';
import { CustomerInfoInterface } from '@/lib/swipall/users/user.types';

export type GetCustomerInfoResult =
    | { sessionExpired: true }
    | { sessionExpired: false; data: CustomerInfoInterface | null };

export async function getCustomerInfoAction(): Promise<GetCustomerInfoResult> {
    try {
        const data = await getCustomerInfoServer();
        return { sessionExpired: false, data };
    } catch (err) {
        if (err instanceof SwipallAPIError && err.status === 404) {
            return { sessionExpired: true };
        }
        return { sessionExpired: false, data: null };
    }
}
