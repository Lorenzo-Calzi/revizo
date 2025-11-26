import React, { useState, useEffect } from "react";
import Text from "@components/ui/Text/Text";
import styles from "./Catalog.module.scss";

import { uploadBusinessItemImage } from "@services/supabase/upload";

import type { Business, BusinessCategory, BusinessItem } from "@/types/database";

type ItemsByCategory = Record<string, BusinessItem[]>;

type HairdresserCatalogProps = {
    business: Business;
    categories: BusinessCategory[];
    items: ItemsByCategory;

    onAddCategory: (name: string) => void | Promise<void>;
    onUpdateCategory: (catId: string, name: string) => void | Promise<void>;
    onDeleteCategory: (catId: string) => void | Promise<void>;

    onAddItem: (catId: string, name: string) => void | Promise<void>;
    onUpdateItem: (
        itemId: string,
        catId: string,
        data: Partial<BusinessItem>
    ) => void | Promise<void>;
    onDeleteItem: (catId: string, itemId: string) => void | Promise<void>;
};

export default function HairdresserCatalog({
    business,
    categories,
    items,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
    onAddItem,
    onUpdateItem,
    onDeleteItem
}: HairdresserCatalogProps) {
    const [newCat, setNewCat] = useState("");
    const [openItemId, setOpenItemId] = useState<string | null>(null);

    const businessId = business.id;

    const handleSubmitNewCategory = async () => {
        const trimmed = newCat.trim();
        if (!trimmed) return;
        await onAddCategory(trimmed);
        setNewCat("");
    };

    return (
        <section className={styles.catalog}>
            <Text variant="title-lg">Servizi Parrucchiere</Text>

            {/* Add category */}
            <div className={styles.addCatForm}>
                <input
                    value={newCat}
                    placeholder="Nuova categoria"
                    onChange={e => setNewCat(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            void handleSubmitNewCategory();
                        }
                    }}
                />
                <button type="button" onClick={handleSubmitNewCategory}>
                    +
                </button>
            </div>

            <ul className={styles.categoryList}>
                {categories.map(cat => (
                    <li key={cat.id} className={styles.categoryCard}>
                        <div className={styles.categoryHeader}>
                            <input
                                value={cat.name}
                                onChange={e => onUpdateCategory(cat.id, e.target.value)}
                            />
                            <button type="button" onClick={() => onDeleteCategory(cat.id)}>
                                Elimina
                            </button>
                        </div>

                        <div className={styles.itemsList}>
                            {items[cat.id]?.map(item => (
                                <MemoizedHairItemCard
                                    key={item.id}
                                    businessId={businessId}
                                    categoryId={cat.id}
                                    item={item}
                                    isOpen={openItemId === item.id}
                                    onToggle={() =>
                                        setOpenItemId(prev => (prev === item.id ? null : item.id))
                                    }
                                    onUpdate={onUpdateItem}
                                    onDelete={onDeleteItem}
                                />
                            ))}

                            <AddHairItemForm
                                placeholder={`Aggiungi servizio in "${cat.name}"`}
                                onAdd={name => onAddItem(cat.id, name)}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

// ═══════════════════════════════════════════════════
// ITEM CARD (Hairdresser)
// ═══════════════════════════════════════════════════

function HairItemCard({
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
    onUpdate: (itemId: string, catId: string, data: Partial<BusinessItem>) => void | Promise<void>;
    onDelete: (catId: string, itemId: string) => void | Promise<void>;
}) {
    const [localName, setLocalName] = useState(item.name ?? "");
    const [localDescription, setLocalDescription] = useState(item.description ?? "");
    const [localPrice, setLocalPrice] = useState<string>(
        item.price != null ? String(item.price) : ""
    );
    const [localDuration, setLocalDuration] = useState<string>(
        item.duration != null ? String(item.duration) : ""
    );

    useEffect(() => {
        setLocalName(item.name ?? "");
        setLocalDescription(item.description ?? "");
        setLocalPrice(item.price != null ? String(item.price) : "");
        setLocalDuration(item.duration != null ? String(item.duration) : "");
    }, [item.id]);

    const displayPrice = item.price != null ? `€ ${item.price.toFixed(2)}` : "Prezzo non impostato";

    const handleBlurName = () => {
        if (localName !== (item.name ?? "")) {
            void onUpdate(item.id, categoryId, { name: localName });
        }
    };

    const handleBlurDescription = () => {
        if (localDescription !== (item.description ?? "")) {
            void onUpdate(item.id, categoryId, {
                description: localDescription || null
            });
        }
    };

    const handleBlurPrice = () => {
        const currentPrice = item.price != null ? String(item.price) : "";
        if (localPrice !== currentPrice) {
            void onUpdate(item.id, categoryId, {
                price: localPrice === "" ? null : Number(localPrice)
            });
        }
    };

    const handleBlurDuration = () => {
        const currentValue = item.duration != null ? String(item.duration) : "";
        if (localDuration !== currentValue) {
            void onUpdate(item.id, categoryId, {
                duration: localDuration === "" ? null : Number(localDuration)
            });
        }
    };

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
                                    <img src={item.image} className={styles.itemImage} />
                                    <button
                                        type="button"
                                        className={styles.removeImageBtn}
                                        onClick={() =>
                                            onUpdate(item.id, categoryId, { image: null })
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

            {/* BODY */}
            <div
                className={`${styles.itemBody} ${
                    isOpen ? styles.itemBodyOpen : styles.itemBodyClosed
                }`}
            >
                <div className={styles.itemForm}>
                    <label className={styles.formLabel}>
                        Servizio
                        <input
                            className={styles.formInput}
                            value={localName}
                            onChange={e => setLocalName(e.target.value)}
                            onBlur={handleBlurName}
                        />
                    </label>

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

                    <label className={styles.formLabel}>
                        Durata (min)
                        <input
                            className={styles.formInput}
                            type="number"
                            min="0"
                            step="5"
                            value={localDuration}
                            onChange={e => setLocalDuration(e.target.value)}
                            onBlur={handleBlurDuration}
                        />
                    </label>

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

const MemoizedHairItemCard = React.memo(HairItemCard);

// ═══════════════════════════════════════════════════
// Add item form (hairdresser)
// ═══════════════════════════════════════════════════

function AddHairItemForm({
    placeholder,
    onAdd
}: {
    placeholder: string;
    onAdd: (name: string) => void | Promise<void>;
}) {
    const [value, setValue] = useState("");

    const handleAdd = () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        void onAdd(trimmed);
        setValue("");
    };

    return (
        <div className={styles.addItemForm}>
            <input
                value={value}
                placeholder={placeholder}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        handleAdd();
                    }
                }}
            />
            <button type="button" onClick={handleAdd}>
                +
            </button>
        </div>
    );
}
