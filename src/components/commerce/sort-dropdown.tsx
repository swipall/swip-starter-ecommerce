'use client';


import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {usePathname, useRouter, useSearchParams} from "next/navigation";

const sortOptions = [
    {value: 'name-asc', label: 'Nombre: A a Z'},
    {value: 'name-desc', label: 'Nombre: Z a A'},
    {value: 'price-asc', label: 'Precio: Bajo a Alto'},
    {value: 'price-desc', label: 'Precio: Alto a Bajo'},
];

export function SortDropdown() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const currentSort = searchParams.get('ordering') || 'name-asc';

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('ordering', value);
        params.delete('page'); // Reset to page 1 when sort changes
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por"/>
            </SelectTrigger>
            <SelectContent>
                {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
