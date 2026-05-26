import type {Metadata} from 'next';
import { getCustomerOrders } from '@/lib/swipall/rest-adapter';
import { getAuthToken } from '@/lib/auth';

export const metadata: Metadata = {
    title: 'Mis Órdenes',
};
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {ArrowRightIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Price} from '@/components/commerce/price';
import {formatDate} from '@/lib/format';
import Link from "next/link";
import {redirect} from "next/navigation";
import OrderIsPaidComponent from '@/components/commerce/order-is-paid';
import OrderStatusComponent from '@/components/commerce/order-status';

const ITEMS_PER_PAGE = 10;

export default async function OrdersPage(props: PageProps<'/account/orders'>) {
    // Verificar autenticación
    const authToken = await getAuthToken();
    if (!authToken) {
        redirect('/sign-in');
    }

    const searchParams = await props.searchParams;
    const pageParam = searchParams.page;
    const currentPage = parseInt(Array.isArray(pageParam) ? pageParam[0] : pageParam || '1', 10);
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const result = await getCustomerOrders(
        {
            limit: ITEMS_PER_PAGE,
            offset,
            kind__in: 'order,requested',
        },
        { useAuthToken: true }
    );
    console.log(result);
    

    const orders = result.results || [];
    const totalItems = result.count || 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Mis Pedidos</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-foreground">Aún no has realizado ningún pedido.</p>
                </div>
            ) : (
                <>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader className="bg-muted">
                                <TableRow>
                                    <TableHead>Número de Pedido</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Pagado</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            <Button asChild variant="outline">
                                                <Link
                                                    href={`/account/orders/${order.id}`}
                                                >
                                                    {order.folio} <ArrowRightIcon className="ml-2 h-4 w-4"/>
                                                </Link>
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-sm text-foreground">
                                            {formatDate(order.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <OrderStatusComponent className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-muted text-foreground" status={order.status} kind={order.kind} />
                                        </TableCell>
                                        <TableCell>
                                            <OrderIsPaidComponent className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-muted text-foreground" isPaid={order.is_paid} kind={order.kind} />
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            <Price value={parseFloat(order.grand_total)} currencyCode="MXN"/>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={
                                                currentPage > 1
                                                    ? `/account/orders?page=${currentPage - 1}`
                                                    : '#'
                                            }
                                            className={
                                                currentPage === 1
                                                    ? 'pointer-events-none opacity-50 cursor-not-allowed'
                                                    : 'cursor-pointer'
                                            }
                                        />
                                    </PaginationItem>

                                    {Array.from({length: totalPages}, (_, i) => i + 1).map(
                                        (page) => {
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 &&
                                                    page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationLink
                                                            href={`/account/orders?page=${page}`}
                                                            isActive={page === currentPage}
                                                        >
                                                            {page}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            } else if (
                                                page === currentPage - 2 ||
                                                page === currentPage + 2
                                            ) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationEllipsis/>
                                                    </PaginationItem>
                                                );
                                            }
                                            return null;
                                        }
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            href={
                                                currentPage < totalPages
                                                    ? `/account/orders?page=${currentPage + 1}`
                                                    : '#'
                                            }
                                            className={
                                                currentPage === totalPages
                                                    ? 'pointer-events-none opacity-50 cursor-not-allowed'
                                                    : 'cursor-pointer'
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
