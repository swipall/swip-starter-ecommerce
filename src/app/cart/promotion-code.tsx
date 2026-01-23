import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Order } from '@/lib/swipall/rest-adapter';
import { Tag } from 'lucide-react';
import { applyPromotionCode } from './actions';

export async function PromotionCode({activeOrder}: { activeOrder: Order }) {
    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-5 w-5"/>
                    Promotion Code
                </CardTitle>
                <CardDescription>
                    Enter your discount code below
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={applyPromotionCode} className="flex gap-2">
                    <Input
                        type="text"
                        name="code"
                        placeholder="Enter code"
                        className="flex-1"
                        required
                    />
                    <Button type="submit">Apply</Button>
                </form>
            </CardContent>
        </Card>
    );
}
