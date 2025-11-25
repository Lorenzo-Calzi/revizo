import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

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

import { uploadBusinessItemImage } from "@services/supabase/upload";

import Text from "@components/ui/Text/Text";
import styles from "./Catalog.module.scss";

import type { Business, BusinessCategory, BusinessItem } from "@/types/database";
import { ALLERGENS } from "@/constants/allergens";

export default function RestaurantCatalog() {
    const [searchParams] = useSearchParams();
    const businessId = searchParams.get("businessId");

    const [business, setBusiness] = useState<Business | null>(null);
    const [categories, setCategories] = useState<BusinessCategory[]>([]);
    const [items, setItems] = useState<Record<string, BusinessItem[]>>({});
    const [loading, setLoading] = useState(true);

    const [newCat, setNewCat] = useState("");
    const [openItemId, setOpenItemId] = useState<string | null>(null);

    // ───────────────────────────────────────────────────────────────
    // LOAD DATA
    // ───────────────────────────────────────────────────────────────

    useEffect(() => {
        async function load() {
            if (!businessId) return;

            setLoading(true);

            const b = await getBusinessById(businessId);
            setBusiness(b);

            const cats = await getBusinessCategories(businessId);
            setCategories(cats);

            const itemsMap: Record<string, BusinessItem[]> = {};
            for (const c of cats) {
                itemsMap[c.id] = await getBusinessItemsByCategory(c.id);
            }
            setItems(itemsMap);

            setLoading(false);
        }

        void load();
    }, [businessId]);

    // ───────────────────────────────────────────────────────────────
    // CATEGORY CRUD
    // ───────────────────────────────────────────────────────────────

    const handleAddCategory = async () => {
        if (!businessId || !newCat.trim()) return;

        const created = await addBusinessCategory(businessId, newCat.trim());
        if (created) {
            setCategories(prev => [...prev, created]);
            setItems(prev => ({ ...prev, [created.id]: [] }));
            setNewCat("");
        }
    };

    const handleUpdateCategory = async (catId: string, name: string) => {
        await updateBusinessCategory(catId, name);

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

        if (openItemId) {
            const catItems = items[catId] || [];
            if (catItems.some(i => i.id === openItemId)) {
                setOpenItemId(null);
            }
        }
    };

    // ───────────────────────────────────────────────────────────────
    // ITEM CRUD
    // ───────────────────────────────────────────────────────────────

    const handleAddItem = async (catId: string, name: string) => {
        if (!name.trim()) return;

        const added = await addBusinessItem(catId, { name: name.trim() });

        setItems(prev => ({
            ...prev,
            [catId]: [...prev[catId], added]
        }));
    };

    const handleUpdateItem = async (itemId: string, catId: string, data: Partial<BusinessItem>) => {
        await updateBusinessItem(itemId, data);

        setItems(prev => ({
            ...prev,
            [catId]: prev[catId].map(it => (it.id === itemId ? { ...it, ...data } : it))
        }));
    };

    const handleDeleteItem = async (catId: string, itemId: string) => {
        await deleteBusinessItem(itemId);

        setItems(prev => ({
            ...prev,
            [catId]: prev[catId].filter(i => i.id !== itemId)
        }));

        if (openItemId === itemId) {
            setOpenItemId(null);
        }
    };

    // ───────────────────────────────────────────────────────────────

    if (loading || !business) {
        return <Text variant="body">Caricamento…</Text>;
    }

    return (
        <section className={styles.catalog}>
            <Text variant="title-lg">Menu ristorante</Text>

            {/* Add category */}
            <div className={styles.addCatForm}>
                <input
                    value={newCat}
                    placeholder="Nuova categoria"
                    onChange={e => setNewCat(e.target.value)}
                />
                <button type="button" onClick={handleAddCategory}>
                    +
                </button>
            </div>

            <ul className={styles.categoryList}>
                {categories.map(cat => (
                    <li key={cat.id} className={styles.categoryCard}>
                        <div className={styles.categoryHeader}>
                            <input
                                value={cat.name}
                                onChange={e => handleUpdateCategory(cat.id, e.target.value)}
                            />

                            <button type="button" onClick={() => handleDeleteCategory(cat.id)}>
                                Elimina
                            </button>
                        </div>

                        <div className={styles.itemsList}>
                            {items[cat.id]?.map(item => (
                                <MemoizedItemCard
                                    key={item.id}
                                    businessId={businessId!}
                                    categoryId={cat.id}
                                    item={item}
                                    isOpen={openItemId === item.id}
                                    onToggle={() =>
                                        setOpenItemId(prev => (prev === item.id ? null : item.id))
                                    }
                                    onUpdate={handleUpdateItem}
                                    onDelete={handleDeleteItem}
                                />
                            ))}

                            <AddItemForm
                                placeholder={`Aggiungi elemento in "${cat.name}"`}
                                onAdd={name => handleAddItem(cat.id, name)}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

// ═══════════════════════════════════════════════════
// ITEM CARD (Accordion)
// ═══════════════════════════════════════════════════

function RestaurantItemCard({
    businessId,
    categoryId,
    item,
    isOpen,
    onToggle,
    onUpdate,
    onDelete
}: {
    businessId: string;
    categoryId: string;
    item: BusinessItem;
    isOpen: boolean;
    onToggle: () => void;
    onUpdate: (itemId: string, catId: string, data: Partial<BusinessItem>) => Promise<void>;
    onDelete: (catId: string, itemId: string) => Promise<void>;
}) {
    // LOCAL STATE STABILIZZATO
    const [localName, setLocalName] = useState(item.name ?? "");
    const [localDescription, setLocalDescription] = useState(item.description ?? "");
    const [localPrice, setLocalPrice] = useState<string>(
        item.price != null ? String(item.price) : ""
    );

    useEffect(() => {
        setLocalName(item.name ?? "");
        setLocalDescription(item.description ?? "");
        setLocalPrice(item.price != null ? String(item.price) : "");
    }, [item.id]);

    const handleBlurName = async () => {
        if (localName !== (item.name ?? "")) {
            await onUpdate(item.id, categoryId, { name: localName });
        }
    };

    const handleBlurDescription = async () => {
        if (localDescription !== (item.description ?? "")) {
            await onUpdate(item.id, categoryId, {
                description: localDescription || null
            });
        }
    };

    const handleBlurPrice = async () => {
        const currentPrice = item.price != null ? String(item.price) : "";
        if (localPrice !== currentPrice) {
            await onUpdate(item.id, categoryId, {
                price: localPrice === "" ? null : Number(localPrice)
            });
        }
    };

    const toggleAllergen = async (id: string) => {
        const current = item.allergens ?? [];
        const next = current.includes(id) ? current.filter(a => a !== id) : [...current, id];

        await onUpdate(item.id, categoryId, { allergens: next });
    };

    const displayPrice = item.price != null ? `€ ${item.price.toFixed(2)}` : "Prezzo non impostato";

    return (
        <div className={styles.itemCard}>
            {/* HEADER */}
            <div className={styles.itemHeader}>
                <div className={styles.itemHeaderMain}>
                    {/* FOTO */}
                    <div className={styles.itemLeft}>
                        <div className={styles.itemImageWrap}>
                            {item.image ? (
                                <>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className={styles.itemImage}
                                    />
                                    <button
                                        type="button"
                                        className={styles.removeImageBtn}
                                        onClick={() =>
                                            onUpdate(item.id, categoryId, {
                                                image: null
                                            })
                                        }
                                    >
                                        Rimuovi
                                    </button>
                                </>
                            ) : (
                                <label className={styles.uploadBox}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async e => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            const url = await uploadBusinessItemImage(
                                                businessId,
                                                file
                                            );

                                            await onUpdate(item.id, categoryId, {
                                                image: url
                                            });
                                        }}
                                    />
                                    <span>+ Foto</span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* TITOLO + PREZZO */}
                    <div className={styles.itemHeaderText}>
                        <div className={styles.itemTitle}>{localName || "Senza titolo"}</div>

                        <div className={styles.itemPrice}>{displayPrice}</div>
                    </div>
                </div>

                {/* TOGGLE */}
                <button type="button" className={styles.itemToggleBtn} onClick={onToggle}>
                    <span>{isOpen ? "Chiudi" : "Modifica"}</span>
                    <span
                        className={`${styles.itemToggleIcon} ${
                            isOpen ? styles.itemToggleIconOpen : ""
                        }`}
                    >
                        ▾
                    </span>
                </button>
            </div>

            {/* BODY (accordion) */}
            <div
                key={item.id}
                className={`${styles.itemBody} ${
                    isOpen ? styles.itemBodyOpen : styles.itemBodyClosed
                }`}
            >
                <div className={styles.itemForm}>
                    {/* Titolo */}
                    <label className={styles.formLabel}>
                        Titolo
                        <input
                            className={styles.formInput}
                            value={localName}
                            onChange={e => setLocalName(e.target.value)}
                            onBlur={handleBlurName}
                        />
                    </label>

                    {/* Descrizione */}
                    <label className={styles.formLabel}>
                        Descrizione
                        <textarea
                            className={styles.formTextarea}
                            rows={2}
                            value={localDescription}
                            onChange={e => setLocalDescription(e.target.value)}
                            onBlur={handleBlurDescription}
                        />
                    </label>

                    {/* Prezzo */}
                    <label className={styles.formLabel}>
                        Prezzo €
                        <input
                            className={styles.formInput}
                            type="number"
                            min="0"
                            step="0.1"
                            value={localPrice}
                            onChange={e => setLocalPrice(e.target.value)}
                            onBlur={handleBlurPrice}
                        />
                    </label>

                    {/* Allergeni */}
                    <label className={styles.formLabel}>
                        Allergeni
                        <div className={styles.allergenList}>
                            {ALLERGENS.map(a => (
                                <label key={a.id} className={styles.allergenItem}>
                                    <input
                                        type="checkbox"
                                        checked={item.allergens?.includes(a.id) ?? false}
                                        onChange={() => toggleAllergen(a.id)}
                                    />
                                    {a.label}
                                </label>
                            ))}
                        </div>
                    </label>

                    {/* Elimina */}
                    <button
                        type="button"
                        className={styles.deleteItemBtn}
                        onClick={() => onDelete(categoryId, item.id)}
                    >
                        Elimina
                    </button>
                </div>
            </div>
        </div>
    );
}

// MEMOIZED PER EVITARE RE-RENDER INUTILI
const MemoizedItemCard = React.memo(RestaurantItemCard);

// ═══════════════════════════════════════════════════
// Add Item Form
// ═══════════════════════════════════════════════════

function AddItemForm({
    placeholder,
    onAdd
}: {
    placeholder: string;
    onAdd: (name: string) => void;
}) {
    const [value, setValue] = useState("");

    return (
        <div className={styles.addItemForm}>
            <input
                value={value}
                placeholder={placeholder}
                onChange={e => setValue(e.target.value)}
            />
            <button
                type="button"
                onClick={() => {
                    if (!value.trim()) return;
                    onAdd(value.trim());
                    setValue("");
                }}
            >
                +
            </button>
        </div>
    );
}
