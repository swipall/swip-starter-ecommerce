import type {Metadata} from 'next';
import { getCustomerOrders } from '@/lib/swipall/rest-adapter';

export const metadata: Metadata = {
    title: 'My Orders',
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
import {OrderStatusBadge} from '@/components/commerce/order-status-badge';
import {formatDate} from '@/lib/format';
import Link from "next/link";
import {redirect} from "next/navigation";

const ITEMS_PER_PAGE = 10;

export default async function OrdersPage(props: PageProps<'/account/orders'>) {
    const searchParams = await props.searchParams;
    const pageParam = searchParams.page;
    const currentPage = parseInt(Array.isArray(pageParam) ? pageParam[0] : pageParam || '1', 10);
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    const result = await getCustomerOrders({
        take: ITEMS_PER_PAGE,
        skip,
    });

    if (!result.results || result.results.length === 0) {
        return redirect('/sign-in');
    }

    const orders = result.results;
    const totalItems = result.count || 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
                </div>
            ) : (
                <>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader className="bg-muted">
                                <TableRow>
                                    <TableHead>Order Number</TableHead>
                                    {/* Date column removed due to REST schema */}
                                    <TableHead>Status</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            <Button asChild variant="outline">
                                                <Link
                                                    href={`/account/orders/${order.code}`}
                                                >
                                                    {order.code} <ArrowRightIcon/>
                                                </Link>
                                            </Button>
                                        </TableCell>
                                        {/* Created date not available in REST response */}
                                        <TableCell>
                                            <OrderStatusBadge state={order.state}/>
                                        </TableCell>
                                        <TableCell>
                                            {order.lines.length}{' '}
                                            {order.lines.length === 1 ? 'item' : 'items'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Price value={order.totalWithTax} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-6">
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
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
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
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
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
