'use server';

import { getCustomerInfoServer } from '@/lib/swipall/users/server';
import { CustomerInfoInterface } from '@/lib/swipall/users/user.types';

export async function getCustomerInfoAction(): Promise<CustomerInfoInterface | null> {
    try {
        return await getCustomerInfoServer();
    } catch {
        return null;
    }
}
