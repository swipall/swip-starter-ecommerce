import { getAuthToken } from '@/lib/auth';
import { getShipmentTracking } from '@/lib/swipall/rest-adapter';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ shipmentId: string }> }
) {
    const { shipmentId } = await params;

    const token = await getAuthToken();
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await getShipmentTracking(shipmentId);
        console.log('Shipment Tracking Response:', JSON.stringify(data, null, 2));
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch tracking' }, { status: 502 });
    }
}
