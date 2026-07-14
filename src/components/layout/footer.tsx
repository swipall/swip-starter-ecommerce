import { getPosts } from '@/lib/swipall/rest-adapter';
import { CmsPost } from '@/lib/swipall/types/types';
import { cacheLife } from 'next/cache';
import Image from "next/image";
import Link from "next/link";
import { getSiteLogoUrl, getSiteName, getSiteDescription } from '@/lib/swipall/site-assets';

const FALLBACK_LOGO =
    "https://mmcb.b-cdn.net/media/attachments/f/f/e/6/c77a2aed2634f9a90555c2db1507cad8ea06a1c4bf34c2e46ac3aeab0f61/logo-merida.png";

const FOOTER_MENUS = [
    { slug: 'informacion', title: 'Información' },
    { slug: 'ayuda', title: 'Ayuda' },
    { slug: 'datos-de-contacto', title: 'Datos de Contacto' },
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
    cacheLife('minutes');
    return (
        <div className='text-background/50'>
            © {new Date().getFullYear()} Mérida Mayoreo.
        </div>
    );
}

export async function Footer() {
    'use cache';
    cacheLife('minutes');

    const [logoUrl, siteName, siteDescription, menus] = await Promise.all([
        getSiteLogoUrl(),
        getSiteName(),
        getSiteDescription(),
        Promise.all(
            FOOTER_MENUS.map(async (menu) => ({
                ...menu,
                items: await fetchMenuChildren(menu.slug),
            }))
        ),
    ]);
    const logo = logoUrl ?? FALLBACK_LOGO;

    return (
        <footer className="bg-primary mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 sm:gap-8'>
                    {/* Brand column */}
                    <div className="flex flex-col gap-4 border border-background/20 p-4 mb-4 rounded-xl">
                        <Link href="/">
                            <Image
                                src={logo}
                                alt={siteName}
                                width={120}
                                height={40}
                                className="h-12 w-auto object-contain brightness-0 invert"
                            />
                            <div className='text-background/60 pt-6'>
                                {siteDescription}
                            </div>
                        </Link>
                    </div>
                    {/* Dynamic menu columns */}
                    {menus.map((menu) => (
                        <div key={menu.slug}>
                            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-background">
                                {menu.title}
                            </h4>
                            <ul className="space-y-2 text-md text-muted-foreground">
                                {menu.items.length === 0 && (
                                    <li className="italic opacity-40">Sin contenido</li>
                                )}
                                {menu.items.map((item) => (
                                    <li key={item.slug}>
                                        {item.slug === 'whatsapp' && item.link ? (
                                            <div className="pt-4">
                                                <Link
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold transition-colors"
                                                    style={{ backgroundColor: '#25D366' }}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                    {item.title}
                                                </Link>
                                            </div>
                                        ) : item.link ? (
                                            <Link
                                                href={item.link}
                                                className="hover:text-muted-foreground text-muted transition-colors flex gap-2"
                                            >
                                                {item.title}
                                            </Link>
                                        ) : (
                                            <span className="hover:text-muted transition-colors cursor-default">
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
                    <div className="flex items-center gap-2 text-background/50">
                        <span>Powered by</span>
                        <a
                            href="https://swipall.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors"
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
