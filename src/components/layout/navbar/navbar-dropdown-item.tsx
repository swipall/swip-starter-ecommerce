'use client';

import Link from 'next/link';
import {
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

interface SubmenuItem {
    slug: string;
    title: string;
    link: string | null;
    excerpt: string | null;
}

interface NavbarDropdownItemProps {
    title: string;
    href: string;
    items: SubmenuItem[];
}

export function NavbarDropdownItem({ title, href, items }: NavbarDropdownItemProps) {
    return (
        <NavigationMenuItem>
            <NavigationMenuTrigger>{title}</NavigationMenuTrigger>
            <NavigationMenuContent>
                <ul className="w-48 p-1 bg-nav-background ">
                    <li>
                        <NavigationMenuLink asChild>
                            <Link
                                href={href}
                                className={cn(
                                    "flex select-none bg-nav-background rounded-md px-3 py-2 text-sm font-semibold leading-none no-underline outline-none transition-colors",
                                    "text-primary hover:text-white hover:text-primary-foreground"
                                )}
                            >
                                Ver todos
                            </Link>
                        </NavigationMenuLink>
                    </li>
                    <li className="my-1 h-px bg-border" />
                    {items.map((item) => (
                        <li key={item.slug}>
                            <NavigationMenuLink asChild>
                                <Link
                                    href={item.link || `/collection/${item.slug}`}
                                    className={cn(
                                        "flex select-none rounded-md px-3 py-2 text-sm leading-none no-underline outline-none transition-colors",
                                        "hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
                                    )}
                                >
                                    <span className="font-medium">{item.title}</span>
                                    {item.excerpt && (
                                        <span className="ml-2 line-clamp-1 text-xs text-foreground">
                                            {item.excerpt}
                                        </span>
                                    )}
                                </Link>
                            </NavigationMenuLink>
                        </li>
                    ))}
                </ul>
            </NavigationMenuContent>
        </NavigationMenuItem>
    );
}
