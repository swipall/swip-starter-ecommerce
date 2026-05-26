import { ORDER_STATUS } from "@/app/account/orders/types";

export default function OrderStatusComponent({ status, kind, className = "font-medium text-foreground" }: { status: ORDER_STATUS; kind?: string; className?: string }) {
    if (kind === "requested") {
        return <span className={className}>En preparación</span>;
    }

    const getStatusText = (status: ORDER_STATUS) => {
        switch (status) {
            case ORDER_STATUS.COMPLETE: return "Completado";
            case ORDER_STATUS.CANCELED: return "Cancelado";
            case ORDER_STATUS.INVOICED: return "Facturado";
            case ORDER_STATUS.SCHEDULED: return "Programado";
            default: return "Desconocido";
        }
    };

    return <span className={className}>{getStatusText(status)}</span>;
}