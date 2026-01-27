import { getTaxonomies } from '@/lib/swipall/rest-adapter';
import { TaxonomyInterface } from '@/lib/swipall/types/types';
import { cacheLife } from 'next/cache';
import Image from "next/image";
import Link from "next/link";


async function Copyright() {
    'use cache'
    cacheLife('days');

    return (
        <div>
            © {new Date().getFullYear()} Vendure Store. All rights reserved.
        </div>
    )
}

async function fetchFooterCollections() {
    try {
        const params = {
            kind: 'family',
            is_visible_on_web: true,
        }
        return await getTaxonomies(params);
    } catch (error) {
        return { results: [], count: 0, next: null, previous: null };
    }

}

export async function Footer() {
    'use cache'
    cacheLife('days');
    const collections = await fetchFooterCollections();

    return (
        <footer className="border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <p className="text-sm font-semibold mb-4 uppercase tracking-wider">
                            Vendure Store
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4">Categorías</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {collections?.results.map((collection: TaxonomyInterface) => (
                                <li key={collection.id}>
                                    <Link
                                        href={`/collection/${collection.slug}`}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        {collection.value}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold mb-4">Vendure</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a
                                    href="https://github.com/vendure-ecommerce"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground transition-colors"
                                >
                                    GitHub
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://docs.vendure.io"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/vendure-ecommerce/vendure"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Source code
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div
                    className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <Copyright />
                    <div className="flex items-center gap-2">
                        <span>Powered by</span>
                        <a
                            href="https://swipall.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors"
                        >
                            <Image src="/swipall-icon.svg" alt="Swipall" width={40} height={27} className="h-4 w-auto dark:invert" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
