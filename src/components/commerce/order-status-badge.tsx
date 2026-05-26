import {Badge} from '@/components/ui/badge';
import {
    ShoppingCart,
    CreditCard,
    Clock,
    CheckCircle,
    Truck,
    PackageCheck,
    Package,
    XCircle,
    type LucideIcon,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: LucideIcon }> = {
    AddingItems: {color: 'bg-muted text-white', label: 'Adding Items', icon: ShoppingCart},
    ArrangingPayment: {color: 'bg-yellow-900 text-yellow-200', label: 'Arranging Payment', icon: CreditCard},
    PaymentAuthorized: {color: 'bg-blue-900 text-blue-200', label: 'Payment Authorized', icon: Clock},
    PaymentSettled: {color: 'bg-green-900 text-green-200', label: 'Payment Settled', icon: CheckCircle},
    PartiallyShipped: {color: 'bg-indigo-900 text-indigo-200', label: 'Partially Shipped', icon: Package},
    Shipped: {color: 'bg-purple-900 text-purple-200', label: 'Shipped', icon: Truck},
    PartiallyDelivered: {color: 'bg-cyan-900 text-cyan-200', label: 'Partially Delivered', icon: PackageCheck},
    Delivered: {color: 'bg-emerald-900 text-emerald-200', label: 'Delivered', icon: PackageCheck},
    Cancelled: {color: 'bg-red-900 text-red-200', label: 'Cancelled', icon: XCircle},
};

interface OrderStatusBadgeProps {
    state: string;
}

export function OrderStatusBadge({state}: OrderStatusBadgeProps) {
    const config = STATUS_CONFIG[state] || {color: 'bg-muted text-white', label: state, icon: Clock};
    const Icon = config.icon;

    return (
        <Badge className={config.color} variant="secondary">
            <Icon className="h-3 w-3 mr-1"/>
            {config.label}
        </Badge>
    );
}
