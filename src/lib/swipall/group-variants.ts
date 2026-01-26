import { get } from './api';
import { ProductVariant } from './types/types';

interface ApiGetGroupVariantsParams {
    [key: string]: any;
}
export async function getGroupVariantByTaxonomies(itemId: string, params?: ApiGetGroupVariantsParams): Promise<ProductVariant> {
  return get<ProductVariant>(`/api/v1/shop/group/${itemId}/variants`,params);
}
