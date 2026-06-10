'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShipmentTrackingResponse } from '@/lib/swipall/rest-adapter';
import { OrderShipmentInterface } from '@/lib/swipall/users/user.types';
import { CheckCircle, ExternalLink, Home, Loader2, Package } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

function formatTrackingDate(dateTime: string): string {
    const date = new Date(dateTime.replace(' ', 'T'));
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
}

type StatusCode = 'delivered' | 'quote' | string;

function StatusPill({ statusCode, statusDescription }: { statusCode: StatusCode; statusDescription: string }) {
    if (statusCode === 'delivered') {
        return (
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                Entregado
            </span>
        );
    }
    if (statusCode === 'quote') {
        return (
            <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-800">
                En proceso
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
            {statusDescription}
        </span>
    );
}

function ShipmentPending({ shipment, index }: { shipment: OrderShipmentInterface; index: number }) {
    const rate = shipment.rate ?? shipment.rates?.[0] ?? null;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Envío #{index + 1}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                    Pendiente de envío
                </span>
                {rate && (
                    <div className="flex items-center gap-3 pt-1">
                        {rate.provider_img && (
                            <div className="relative h-8 w-16 shrink-0">
                                <Image
                                    src={rate.provider_img}
                                    alt={rate.provider}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        )}
                        <div className="text-sm">
                            <p className="font-medium">{rate.provider}</p>
                            <p className="text-muted-foreground capitalize">{rate.servicelevel} · {rate.duration_terms}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ShipmentTrackingActive({ shipment, index }: { shipment: OrderShipmentInterface; index: number }) {
    const shipmentId = shipment.id;
    const [data, setData] = useState<ShipmentTrackingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const fetchedRef = useRef(false);

    const fetchTracking = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`/api/shipment-tracking/${shipmentId}`);
            if (!res.ok) throw new Error('fetch failed');
            const result: ShipmentTrackingResponse = await res.json();
            setData(result);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [shipmentId]);

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchTracking();
    }, [fetchTracking]);

    const rate = shipment.rate ?? shipment.rates?.[0] ?? null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {rate?.provider_img && (
                        <div className="relative h-6 w-12 shrink-0">
                            <Image src={rate.provider_img} alt={rate.provider} fill className="object-contain" />
                        </div>
                    )}
                    Envío #{index + 1}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!loading && error && (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                        <p className="text-sm text-muted-foreground">No se pudo obtener la información de rastreo</p>
                        <button
                            onClick={() => {
                                fetchedRef.current = false;
                                fetchTracking();
                            }}
                            className="text-sm font-medium text-primary underline underline-offset-2"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {!loading && !error && data && !data.tracking && (
                    <p className="text-sm text-muted-foreground py-4">El rastreo aún no está disponible</p>
                )}

                {!loading && !error && data && data.tracking && (
                    <div className="space-y-4">
                        <StatusPill
                            statusCode={data.tracking.status_code}
                            statusDescription={data.tracking.status_description}
                        />

                        {data.label && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    N° de rastreo:{' '}
                                    <span className="font-mono font-medium text-foreground">
                                        {data.label.tracking_number}
                                    </span>
                                </span>
                                <a
                                    href={data.label.tracking_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
                                >
                                    Ver rastreo
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        )}

                        {data.tracking.events.length > 0 && (
                            <ol className="relative mt-2 space-y-0">
                                {data.tracking.events.map((event, index) => {
                                    const isFirst = index === 0;
                                    const isLast = index === data.tracking!.events.length - 1;
                                    const isDelivered = event.code === 'delivered';

                                    return (
                                        <li key={index} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isDelivered ? 'bg-green-100 text-green-700' : isFirst ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'}`}>
                                                    {isFirst && !isDelivered
                                                        ? <Home className="h-3.5 w-3.5" />
                                                        : isDelivered
                                                            ? <CheckCircle className="h-3.5 w-3.5" />
                                                            : <span className="h-2 w-2 rounded-full bg-current" />
                                                    }
                                                </div>
                                                {!isLast && (
                                                    <div className="w-px flex-1 bg-border my-1" />
                                                )}
                                            </div>
                                            <div className="pb-4 pt-0.5">
                                                <p className="text-xs text-muted-foreground">{formatTrackingDate(event.date_time)}</p>
                                                <p className="text-sm font-semibold">{event.description}</p>
                                                {event.area && (
                                                    <p className="text-xs text-muted-foreground">{event.area}</p>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function ShipmentTracking({ shipment, index }: { shipment: OrderShipmentInterface; index: number }) {
    if (shipment.kind !== 'payment') {
        return <ShipmentPending shipment={shipment} index={index} />;
    }
    return <ShipmentTrackingActive shipment={shipment} index={index} />;
}
