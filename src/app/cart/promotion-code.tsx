import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tag } from 'lucide-react';
import { applyPromotionCode } from './actions';
import { Order } from '@/lib/swipall/types/types';

export async function PromotionCode({activeOrder}: { activeOrder: Order }) {
    return null;
    // TODO: Implement promotion code application UI and logic
    // return (
    //     <Card className="mt-4">
    //         <CardHeader>
    //             <CardTitle className="text-lg flex items-center gap-2">
    //                 <Tag className="h-5 w-5"/>
    //                 Código de promoción
    //             </CardTitle>
    //             <CardDescription>
    //                 Ingresa tu código de descuento abajo
    //             </CardDescription>
    //         </CardHeader>
    //         <CardContent>
    //             <form action={applyPromotionCode} className="flex gap-2">
    //                 <Input
    //                     type="text"
    //                     name="code"
    //                     placeholder="Enter code"
    //                     className="flex-1"
    //                     required
    //                 />
    //                 <Button type="submit">Aplicar</Button>
    //             </form>
    //         </CardContent>
    //     </Card>
    // );
}
