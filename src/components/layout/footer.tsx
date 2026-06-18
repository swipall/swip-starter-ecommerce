import { getPosts } from '@/lib/swipall/rest-adapter';
import { CmsPost } from '@/lib/swipall/types/types';
import { cacheLife } from 'next/cache';
import Image from "next/image";
import Link from "next/link";

const FOOTER_MENUS = [
    { slug: 'informacion',        title: 'Información' },
    { slug: 'ayuda',              title: 'Ayuda' },
    { slug: 'datos-de-contacto',  title: 'Datos de Contacto' },
];

async function fetchMenuChildren(parentSlug: string): Promise<CmsPost[]> {
    try {
        const res = await getPosts({ parent__slug: parentSlug, ordering: 'ordering' });
        return res?.results ?? [];
    } catch {
        return [];
    }
}

async function Copyright() {
    'use cache';
    cacheLife('days');
    return (
        <div className='text-muted-foreground'>
            © {new Date().getFullYear()} KOI Collectibles. All rights reserved.
        </div>
    );
}

export async function Footer() {
    'use cache';
    cacheLife('days');

    const menus = await Promise.all(
        FOOTER_MENUS.map(async (menu) => ({
            ...menu,
            items: await fetchMenuChildren(menu.slug),
        }))
    );

    return (
        <footer className="border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Brand column */}
                    <div className="flex flex-col gap-4">
                        <Link href="/">
                            <Image
                                src="https://mmcb.b-cdn.net/media/attachments/0/c/4/0/60593b52331c1146353026da4cbc9ffbfd78b635db83fca47b25690df620/logo.jpg"
                                alt="Koi Collectibles"
                                width={120}
                                height={40}
                                className="h-12 w-auto rounded-md"
                            />
                        </Link>
                    </div>

                    {/* Dynamic menu columns */}
                    {menus.map((menu) => (
                        <div key={menu.slug}>
                            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-primary">
                                {menu.title}
                            </h4>
                            <ul className="space-y-2 text-md text-muted-foreground">
                                {menu.items.length === 0 && (
                                    <li className="italic opacity-40">Sin contenido</li>
                                )}
                                {menu.items.map((item) => (
                                    <li key={item.slug}>
                                        {item.link ? (
                                            <Link
                                                href={item.link}
                                                className="hover:text-primary text-muted-foreground transition-colors"
                                            >
                                                {item.title}
                                            </Link>
                                        ) : (
                                            <span className="hover:text-primary transition-colors cursor-default">
                                                {item.title}
                                                {item.excerpt && (
                                                    <span className="block text-md mt-0.5 opacity-70">
                                                        {item.excerpt}
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground">
                    <Copyright />
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span>Powered by</span>
                        <a
                            href="https://swipall.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                        >
                            <Image
                                src="https://mmcb.b-cdn.net/media/attachments/6/8/3/3/9a8955f143cdd1229610a38bdf23178fe55dcfd46f5ac580fb311c7861ad/logo.avif"
                                alt="Swipall"
                                width={40}
                                height={27}
                                className="h-4 w-auto dark:invert"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
        
    );
}
