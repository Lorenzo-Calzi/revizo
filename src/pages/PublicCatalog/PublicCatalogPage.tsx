import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Text from "@components/ui/Text/Text";
import PublicCatalog from "@components/PublicCatalog/PublicCatalog";

import { getBusinessBySlug } from "@services/supabase/businesses";
import { getBusinessCategories, getBusinessItemsByCategory } from "@services/supabase/catalog";
import { getPublicCollection } from "@services/supabase/collections";

import type { Business, BusinessCategory, BusinessItem } from "@/types/database";

import { CatalogThemeProvider } from "@context/CatalogThemeContext/CatalogThemeProvider";
import { defaultTheme } from "@/constants/catalogTheme";

type PublicItem = {
    id: string;
    name: string;
    description?: string;
    price?: number;
    image?: string;
    category_id: string;
};

type ItemsByCategory = Record<string, PublicItem[]>;

export default function PublicCatalogPage() {
    const { slug } = useParams<{ slug: string }>();

    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState<Business | null>(null);
    const [categories, setCategories] = useState<BusinessCategory[]>([]);
    const [items, setItems] = useState<ItemsByCategory>({});

    function toBusinessCategoryList(
        cats: { id: string; name: string; order_index: number }[],
        businessId: string
    ): BusinessCategory[] {
        return cats.map(c => ({
            id: c.id,
            business_id: businessId,
            name: c.name,
            order_index: c.order_index,
            visible: true,
            created_at: "" // TS richiede questo campo, ma al pubblico non serve
        }));
    }

    function toBusinessItemsMap(itemsByCat: ItemsByCategory): Record<string, BusinessItem[]> {
        const result: Record<string, BusinessItem[]> = {};

        for (const catId of Object.keys(itemsByCat)) {
            const list = itemsByCat[catId];

            result[catId] = list.map(i => ({
                id: i.id,
                category_id: i.category_id,
                name: i.name,
                description: i.description ?? null,
                price: i.price ?? null,
                duration: null,
                allergens: null,
                image: i.image ?? null,
                order_index: 0,
                visible: true,
                created_at: ""
            }));
        }

        return result;
    }

    useEffect(() => {
        async function load() {
            if (!slug) return;

            setLoading(true);

            // 1) CARICA BUSINESS
            const biz = await getBusinessBySlug(slug);
            setBusiness(biz);

            if (!biz) {
                setLoading(false);
                return;
            }

            // 2) SE ESISTE UN MENU ATTIVO → MOSTRA QUELLO
            if (biz.active_collection_id) {
                const { categories, items } = await getPublicCollection(biz.active_collection_id);

                setCategories(toBusinessCategoryList(categories, biz.id));
                setItems(items);
                setLoading(false);
                return;
            }

            // 3) FALLBACK: TUTTE LE CATEGORIE DEL BUSINESS
            const cats = await getBusinessCategories(biz.id);
            setCategories(cats);

            const map: ItemsByCategory = {};

            for (const c of cats) {
                const raw = await getBusinessItemsByCategory(c.id);
                map[c.id] = raw.map(it => ({
                    id: it.id,
                    name: it.name,
                    description: it.description ?? undefined,
                    price: it.price ?? undefined,
                    image: it.image ?? undefined,
                    category_id: c.id
                }));
            }

            setItems(map);
            setLoading(false);
        }

        load();
    }, [slug]);

    if (loading) return <Text>Caricamento…</Text>;

    if (!business) {
        return <Text colorVariant="warning">Business non trovato.</Text>;
    }

    return (
        <CatalogThemeProvider theme={business.theme ?? defaultTheme}>
            <PublicCatalog
                business={business}
                categories={toBusinessCategoryList(categories, business.id)}
                items={toBusinessItemsMap(items)}
                theme={business.theme ?? defaultTheme}
            />
        </CatalogThemeProvider>
    );
}
