import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PublicCatalog from "@components/PublicCatalog/PublicCatalog";
import { getBusinessBySlug } from "@services/supabase/businesses";
import { getBusinessCategories, getBusinessItemsByCategory } from "@services/supabase/catalog";
import Text from "@components/ui/Text/Text";
import type { Business, BusinessCategory, BusinessItem } from "@/types/database";
import { CatalogThemeProvider } from "@context/CatalogThemeContext/CatalogThemeProvider";
import { defaultTheme } from "@/constants/catalogTheme";

type ItemsByCategory = Record<string, BusinessItem[]>;

export default function PublicCatalogPage() {
    // dalla route: /business/:slug
    const { slug } = useParams<{ slug: string }>();

    const [loading, setLoading] = useState<boolean>(true);
    const [business, setBusiness] = useState<Business | null>(null);
    const [categories, setCategories] = useState<BusinessCategory[]>([]);
    const [items, setItems] = useState<ItemsByCategory>({});

    useEffect(() => {
        async function load() {
            if (!slug) {
                setLoading(false);
                return;
            }

            setLoading(true);

            // 👇 QUI: se slug ≠ id, dovrai usare una funzione tipo getBusinessBySlug(slug)
            // Per ora assumo che slug contenga l'id del business.
            const b = await getBusinessBySlug(slug);
            setBusiness(b);

            if (!b) {
                setLoading(false);
                return;
            }

            const cats = await getBusinessCategories(b.id);
            setCategories(cats);

            const map: ItemsByCategory = {};
            for (const c of cats) {
                const its = await getBusinessItemsByCategory(c.id);
                map[c.id] = its;
            }
            setItems(map);

            setLoading(false);
        }

        void load();
    }, [slug]);

    if (loading) {
        return <Text variant="body">Caricamento…</Text>;
    }

    if (!business) {
        return (
            <Text variant="body" colorVariant="warning">
                Business non trovato.
            </Text>
        );
    }

    return (
        <CatalogThemeProvider theme={business.theme ?? defaultTheme}>
            <PublicCatalog
                business={business}
                categories={categories}
                items={items}
                theme={business.theme ?? defaultTheme}
            />
        </CatalogThemeProvider>
    );
}
