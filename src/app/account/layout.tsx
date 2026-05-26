import type {Metadata} from 'next';
import Link from 'next/link';
import {Package, User, MapPin} from 'lucide-react';
import {noIndexRobots} from '@/lib/metadata';

export const metadata: Metadata = {
    robots: noIndexRobots(),
};

const navItems = [
    {href: '/account/orders', label: 'Pedidos', icon: Package},
    {href: '/account/addresses', label: 'Direcciones', icon: MapPin},
    {href: '/account/profile', label: 'Perfil', icon: User},
];

export default async function AccountLayout({children}: LayoutProps<'/account'>) {
    return (
        <div className="container mx-auto px-4 py-12 md:py-30 mt-[100px] sm:mt-16">
            <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                <aside className="w-full md:w-64 md:shrink-0">
                    <nav className="grid grid-cols-3 gap-1 md:grid-cols-1 md:space-y-1 md:gap-0">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium rounded-md hover:bg-accent transition-colors text-center md:flex-row md:justify-start md:gap-3 md:px-4 md:py-2 md:text-sm md:text-left border border-white/50"
                            >
                                <item.icon className="h-5 w-5 shrink-0"/>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
