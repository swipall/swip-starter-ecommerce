'use client';

interface PriceProps {
    value: number;
    currencyCode?: string;
}

export function Price({value, currencyCode = 'MXN'}: PriceProps) {
    return (
        <>
            {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyCode,
            }).format(value)}
        </>
    );
}
