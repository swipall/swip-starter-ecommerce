import { NavbarLink } from '@/components/layout/navbar/navbar-link';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { getPosts } from '@/lib/swipall/rest-adapter';
import { CmsPost } from '@/lib/swipall/types/types';
import { cacheLife } from 'next/cache';

export async function NavbarCollections() {
    "use cache";
    cacheLife('days');
    const params = { parent__slug: 'menu-principal' }
    const taxonomies = await getPosts(params);
    const redirectUrl = (collection: CmsPost) => {
        if(collection.link){
            return collection.link;
        }
        return `/collection/${collection.slug}`;
    }    
    return (
        <NavigationMenu>
            <NavigationMenuList>
                {(taxonomies?.results ?? []).map((collection: CmsPost) => (
                    <NavigationMenuItem key={collection.slug}>
                        <NavbarLink href={redirectUrl(collection)}>
                            {collection.title}
                        </NavbarLink>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
