import { InterfaceApiListResponse } from "../swipall/types/types";

interface PostalCodeCatalogs {
    state: string;
    municipal_delegation: string;
    settlement: string;
    city: string;
}

export function fetchZipCode(body: {
    postal_code: string;
}): Promise<InterfaceApiListResponse<PostalCodeCatalogs>> {
    const swipAppUrl = "https://swip-catalogs-443115567646.us-central1.run.app";
    const url = new URL(`${swipAppUrl}/api/v1/catalogs/postalcodes`);
    url.searchParams.append('postal_code', body.postal_code);
    
    return fetch(url.toString(), {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
    }).then(response => response.json());
}
