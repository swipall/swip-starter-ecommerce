import type {Metadata} from "next";
import { HomePageComponent } from "@/components/layout/home/home-page-component";
import {SITE_NAME, SITE_URL, buildCanonicalUrl} from "@/lib/metadata";

export const metadata: Metadata = {
    title: {
        absolute: `${SITE_NAME} - Coleccionables Pokémon,¡Haz que tu deck evolucione con KOI!`,
    },
    description:
        "En KOI, sabemos que cada carta cuenta una historia y cada sobre es una oportunidad de encontrar esa pieza legendaria que le falta a tu deck. Por eso, hemos curado la mejor selección de productos oficiales de Pokémon TCG, desde ediciones especiales hasta piezas de lujo para los coleccionistas más exigentes.",
    alternates: {
        canonical: buildCanonicalUrl("/"),
    },
    openGraph: {
        title: `${SITE_NAME} - Coleccionables Pokémon,¡Haz que tu deck evolucione con KOI!`,
        description:
            "En KOI, sabemos que cada carta cuenta una historia y cada sobre es una oportunidad de encontrar esa pieza legendaria que le falta a tu deck. Por eso, hemos curado la mejor selección de productos oficiales de Pokémon TCG, desde ediciones especiales hasta piezas de lujo para los coleccionistas más exigentes.",
        type: "website",
        url: SITE_URL,
    },
};

export default async function Home(_props: PageProps<'/'>) {
    return (
        <HomePageComponent />
    );
}
