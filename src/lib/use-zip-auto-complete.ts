
import React from "react";
import { fetchZipCode } from "./utils/zip-code-catalogs";

export default function useZipAutoComplete(zipCode: string): any {
    const [fetchingZip, setFetchingZip] = React.useState(false);
    const [states, setStates] = React.useState<string[]>([]);
    const [cities, setCities] = React.useState<string[]>([]);
    const [suburbs, setSuburbs] = React.useState<string[]>([]);

    const fetchStates = async () => {
        const body = {
            postal_code: zipCode,
        };
        setFetchingZip(true);
        try {
            const data = await fetchZipCode(body);
            const nData: {
                states: string[];
                cities: string[];
                suburbs: string[];
            } = {
                states: [],
                cities: [],
                suburbs: [],
            };
            data.results.forEach(
                (el: { state: string; city: string; municipal_delegation: string; settlement: string }) => {
                    nData.states.push(el.state);
                    nData.cities.push(el.city || el.municipal_delegation);
                    nData.suburbs.push(el.settlement);
                },
            );
            setStates([...new Set(nData.states)]);
            setCities([...new Set(nData.cities)]);
            setSuburbs([...new Set(nData.suburbs)]);
        } catch (e) {
            console.error("Error fetching zip code data:", e);
        } finally {
            setFetchingZip(false);
        }
    };

    const fetchStatesMemoized = React.useCallback(() => {
        if (!zipCode || zipCode.length !== 5 || fetchingZip) return;
        fetchStates();
    }, [zipCode]);

    React.useEffect(() => {
        fetchStatesMemoized();
    }, [fetchStatesMemoized]);
    return { fetchingZip, states, cities, suburbs };
}
