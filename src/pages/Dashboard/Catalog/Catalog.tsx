import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Text from "@components/ui/Text/Text";

import { getBusinessById } from "@services/supabase/businesses";
import {
    getBusinessCategories,
    getBusinessItemsByCategory,
    addBusinessCategory,
    updateBusinessCategory,
    deleteBusinessCategory,
    addBusinessItem,
    updateBusinessItem,
    deleteBusinessItem
} from "@services/supabase/catalog";

import RestaurantCatalog from "./RestaurantCatalog";
import BarCatalog from "./BarCatalog";
import HairdresserCatalog from "./HairdresserCatalog";
import ShopCatalog from "./ShopCatalog";

import type { Business, BusinessCategory, BusinessItem } from "@/types/database";

export default function Catalog() {
    const [searchParams] = useSearchParams();
    const businessId = searchParams.get("businessId");

    const [business, setBusiness] = useState<Business | null>(null);
    const [categories, setCategories] = useState<BusinessCategory[]>([]);
    const [items, setItems] = useState<Record<string, BusinessItem[]>>({});
    const [loading, setLoading] = useState(true);

    // ────────────────────────────────────────────────
    // FETCH PRINCIPALE
    // ────────────────────────────────────────────────

    useEffect(() => {
        async function load() {
            if (!businessId) return;

            setLoading(true);

            // 1. Fetch business
            const b = await getBusinessById(businessId);
            setBusiness(b);

            if (!b) {
                setLoading(false);
                return;
            }

            // 2. Fetch categorie
            const cats = await getBusinessCategories(businessId);
            setCategories(cats);

            // 3. Fetch items per categoria (mappa)
            const itemsMap: Record<string, BusinessItem[]> = {};
            for (const c of cats) {
                const its = await getBusinessItemsByCategory(c.id);
                itemsMap[c.id] = its;
            }
            setItems(itemsMap);

            setLoading(false);
        }

        void load();
    }, [businessId]);

    // ────────────────────────────────────────────────
    // CATEGORY CRUD
    // ────────────────────────────────────────────────

    const handleAddCategory = async (name: string) => {
        if (!businessId || !name.trim()) return;

        const created = await addBusinessCategory(businessId, name.trim());
        setCategories(prev => [...prev, created]);
        setItems(prev => ({ ...prev, [created.id]: [] }));
    };

    const handleUpdateCategory = async (catId: string, name: string) => {
        await updateBusinessCategory(catId, { name });
        setCategories(prev => prev.map(c => (c.id === catId ? { ...c, name } : c)));
    };

    const handleDeleteCategory = async (catId: string) => {
        await deleteBusinessCategory(catId);

        setCategories(prev => prev.filter(c => c.id !== catId));

        setItems(prev => {
            const copy = { ...prev };
            delete copy[catId];
            return copy;
        });
    };

    // ────────────────────────────────────────────────
    // ITEM CRUD
    // ────────────────────────────────────────────────

    const handleAddItem = async (catId: string, name: string) => {
        if (!name.trim()) return;

        const created = await addBusinessItem(catId, { name: name.trim() });

        setItems(prev => ({
            ...prev,
            [catId]: [...prev[catId], created]
        }));
    };

    const handleUpdateItem = async (itemId: string, catId: string, data: Partial<BusinessItem>) => {
        await updateBusinessItem(itemId, data);

        setItems(prev => ({
            ...prev,
            [catId]: prev[catId].map(i => (i.id === itemId ? { ...i, ...data } : i))
        }));
    };

    const handleDeleteItem = async (catId: string, itemId: string) => {
        await deleteBusinessItem(itemId);

        setItems(prev => ({
            ...prev,
            [catId]: prev[catId].filter(i => i.id !== itemId)
        }));
    };

    // ────────────────────────────────────────────────
    // UI DI CARICAMENTO / ERRORI
    // ────────────────────────────────────────────────

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

    // ────────────────────────────────────────────────
    // SWITCH DEL CATALOGO
    // ────────────────────────────────────────────────

    switch (business.type) {
        case "restaurant":
            return (
                <RestaurantCatalog
                    business={business}
                    categories={categories}
                    items={items}
                    onAddCategory={handleAddCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onAddItem={handleAddItem}
                    onUpdateItem={handleUpdateItem}
                    onDeleteItem={handleDeleteItem}
                />
            );
        case "bar":
            return (
                <BarCatalog
                    business={business}
                    categories={categories}
                    items={items}
                    onAddCategory={handleAddCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onAddItem={handleAddItem}
                    onUpdateItem={handleUpdateItem}
                    onDeleteItem={handleDeleteItem}
                />
            );
        case "hairdresser":
            return (
                <HairdresserCatalog
                    business={business}
                    categories={categories}
                    items={items}
                    onAddCategory={handleAddCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onAddItem={handleAddItem}
                    onUpdateItem={handleUpdateItem}
                    onDeleteItem={handleDeleteItem}
                />
            );
        case "shop":
            return (
                <ShopCatalog
                    business={business}
                    categories={categories}
                    items={items}
                    onAddCategory={handleAddCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onAddItem={handleAddItem}
                    onUpdateItem={handleUpdateItem}
                    onDeleteItem={handleDeleteItem}
                />
            );

        default:
            return (
                <Text variant="body" colorVariant="warning">
                    Tipo di business non ancora supportato.
                </Text>
            );
    }
}
