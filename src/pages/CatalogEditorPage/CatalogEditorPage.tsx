import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import BuilderLayout from "@components/CatalogBuilder/BuilderLayout/BuilderLayout";

import { getBusinessById } from "@services/supabase/businesses";
import { getBusinessCategories, getBusinessItemsByBusiness } from "@services/supabase/catalog";

import type { Business, BusinessCategory, BusinessItem } from "@/types/database";

// stesso shape usato dentro PublicCatalog
type ItemsByCategory = Record<string, BusinessItem[]>;

export default function CatalogEditorPage() {
    const { businessId } = useParams<{ businessId: string }>();

    const [business, setBusiness] = useState<Business | null>(null);
    const [categories, setCategories] = useState<BusinessCategory[]>([]);
    const [itemsByCategory, setItemsByCategory] = useState<ItemsByCategory>({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            if (!businessId) return;

            try {
                setLoading(true);
                setError(null);

                // 1) Business
                const data = await getBusinessById(businessId);
                setBusiness(data as Business);

                // 2) Categorie
                const cats = await getBusinessCategories(businessId);
                setCategories(cats);

                // 3) Tutti gli item del business
                const allItems = await getBusinessItemsByBusiness(businessId);

                // 4) Raggruppiamo per category_id → ItemsByCategory
                const grouped: ItemsByCategory = {};
                for (const item of allItems) {
                    const cid = item.category_id;
                    if (!grouped[cid]) grouped[cid] = [];
                    grouped[cid].push(item);
                }

                setItemsByCategory(grouped);
            } catch (err) {
                console.error(err);
                setError("Errore nel caricamento del catalogo");
            } finally {
                setLoading(false);
            }
        }

        void load();
    }, [businessId]);

    if (!businessId) {
        return <p>Business non valido.</p>;
    }

    if (loading) {
        return <p>Loading…</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!business) {
        return <p>Nessun business trovato.</p>;
    }

    return (
        <BuilderLayout
            business={business}
            categories={categories}
            items={itemsByCategory}
            initialTheme={business.theme ?? null}
        />
    );
}
