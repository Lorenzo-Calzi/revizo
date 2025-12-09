import { useEffect, useState, useCallback } from "react";
import {
    getBusinessCategories,
    getBusinessItemsByBusiness,
    addBusinessCategory,
    updateBusinessCategory,
    deleteBusinessCategory,
    addBusinessItem,
    updateBusinessItem,
    deleteBusinessItem
} from "@services/supabase/catalog";

import RestaurantCatalog from "./RestaurantCatalog";
import type { Business, BusinessCategory, BusinessItem } from "@/types/database";

type ItemsByCategory = Record<string, BusinessItem[]>;

interface CatalogProps {
    business: Business;
}

export default function Catalog({ business }: CatalogProps) {
    const businessId = business.id;

    const [categories, setCategories] = useState<BusinessCategory[]>([]);
    const [itemsByCategory, setItemsByCategory] = useState<ItemsByCategory>({});
    const [loading, setLoading] = useState(true);

    // ===== LOAD =====
    async function loadAll() {
        setLoading(true);

        const cats = await getBusinessCategories(businessId);
        const items = await getBusinessItemsByBusiness(businessId);

        const grouped: ItemsByCategory = {};
        items.forEach(item => {
            if (!item.category_id) return;
            if (!grouped[item.category_id]) grouped[item.category_id] = [];
            grouped[item.category_id].push(item);
        });

        setCategories(cats);
        setItemsByCategory(grouped);

        setLoading(false);
    }

    useEffect(() => {
        void loadAll();
    }, [businessId]);

    // ===== CALLBACK CRUD =====

    const handleAddCategory = useCallback(
        async (name: string) => {
            await addBusinessCategory(businessId, name);
            await loadAll();
        },
        [businessId]
    );

    const handleUpdateCategory = useCallback(async (catId: string, name: string) => {
        await updateBusinessCategory(catId, { name });
        await loadAll();
    }, []);

    const handleDeleteCategory = useCallback(async (catId: string) => {
        await deleteBusinessCategory(catId);
        await loadAll();
    }, []);

    const handleAddItem = useCallback(async (catId: string, name: string) => {
        await addBusinessItem(catId, { name });
        await loadAll();
    }, []);

    const handleUpdateItem = useCallback(
        async (itemId: string, catId: string, data: Partial<BusinessItem>) => {
            await updateBusinessItem(itemId, data);
            await loadAll();
        },
        []
    );

    const handleDeleteItem = useCallback(async (catId: string, itemId: string) => {
        await deleteBusinessItem(itemId);
        await loadAll();
    }, []);

    if (loading) return <div>Caricamento…</div>;

    return (
        <RestaurantCatalog
            business={business}
            categories={categories}
            items={itemsByCategory}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
        />
    );
}
