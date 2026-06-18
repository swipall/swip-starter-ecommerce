import { OrderPaymentType } from "@/app/account/orders/types";

export default function PaymentTypeTextComponent({ paymentType, kind }: { paymentType: OrderPaymentType; kind?: string }) {
    if (kind === "requested") return null;

    const paymentTypeText = (paymentType: string): string => {
        switch (paymentType as OrderPaymentType) {
            case OrderPaymentType.cash:
                return "Efectivo";
            case OrderPaymentType.credit:
                return "Crédito";
            case OrderPaymentType.transfer:
                return "Transferencia";
            case OrderPaymentType.credit_card:
                return "Tarjeta de crédito";
            case OrderPaymentType.debit_card:
                return "Tarjeta de débito";
            case OrderPaymentType.ticket:
                return "Vale";
            case OrderPaymentType.digital_wallet:
                return "Billetera digital";
            case OrderPaymentType.nominal_check:
                return "Cheque nominativo";
            case OrderPaymentType.gift:
                return "Tarjeta de regalo";
            case OrderPaymentType.mixed:
                return "Pago mixto";
            case OrderPaymentType.all:
                return "Todos";
            default:
                return "Otro";
        }
    }

    const paymentTypeBgColor = (paymentType: string): string => {
        switch (paymentType as OrderPaymentType) {
            case OrderPaymentType.cash:
                return "#DBEAFE";
            case OrderPaymentType.credit:
                return "#ECFDF5";
            case OrderPaymentType.transfer:
                return "#FEF3C7";
            case OrderPaymentType.credit_card:
                return "#F1F5F9";
            case OrderPaymentType.debit_card:
                return "#E0E7FF";
            case OrderPaymentType.ticket:
                return "#FCE7F3";
            case OrderPaymentType.digital_wallet:
                return "#CCFBF1";
            case OrderPaymentType.nominal_check:
                return "#F3F4F6";
            case OrderPaymentType.gift:
                return "#FFEDD5";
            case OrderPaymentType.mixed:
                return "#FEE2E2";
            case OrderPaymentType.all:
                return "#F8FAFC";
            default:
                return "#F8FAFC";
        }
    }

    const paymentTypeTextColor = (paymentType: string): string => {
        switch (paymentType as OrderPaymentType) {
            case OrderPaymentType.cash:
                return "#1E40AF";
            case OrderPaymentType.credit:
                return "#065F46";
            case OrderPaymentType.transfer:
                return "#92400E";
            case OrderPaymentType.credit_card:
                return "#62748E";
            case OrderPaymentType.debit_card:
                return "#4338CA";
            case OrderPaymentType.ticket:
                return "#DB2777";
            case OrderPaymentType.digital_wallet:
                return "#0D9488";
            case OrderPaymentType.nominal_check:
                return "#374151";
            case OrderPaymentType.gift:
                return "#C2410C";
            case OrderPaymentType.mixed:
                return "#B91C1C";
            case OrderPaymentType.all:
                return "#1E293B";
            default:
                return "#1E293B";
        }
    }

    return (
        <span className="font-medium text-foreground">{paymentTypeText(paymentType)}</span>
    )
}