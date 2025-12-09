import { useMemo, useState, useEffect } from "react";
import Text from "@/components/ui/Text/Text";
import type { FullCollection } from "@/types/database";
import type { BusinessCategory, BusinessItem } from "@/types/database";
import { getAllBusinessCategories, getAllBusinessItems } from "@/services/supabase/catalog";
import CollectionCategories from "./CollectionCategories";
import CollectionItems from "./CollectionItems";
import styles from "./CollectionEditor.module.scss";
import {
    addCategoryToCollection,
    addItemToCollection,
    removeCategoryFromCollection,
    removeItemFromCollection
} from "@/services/supabase/collections";

// NEW IMPORTS
import SelectionDrawer from "../SelectionDrawer/SelectionDrawer";
import CategorySelectionPanel from "../CatalogPanels/CatalogPanels";
import ItemSelectionPanel from "../ItemSelectionPanel/ItemSelectionPanel";

interface PreviewItem {
    id: string;
    name: string;
    description?: string;
    price?: number;
    image?: string;
}

interface PreviewCategory {
    id: string;
    name: string;
    items: PreviewItem[];
}

interface PreviewData {
    id: string;
    name: string;
    categories: PreviewCategory[];
}

interface CollectionEditorProps {
    data: FullCollection;
    onPreviewUpdate?: (preview: PreviewData) => void;
}

export default function CollectionEditor({ data, onPreviewUpdate }: CollectionEditorProps) {
    const { collection } = data;
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
    const [allCategories, setAllCategories] = useState<BusinessCategory[]>([]);
    const [allItems, setAllItems] = useState<BusinessItem[]>([]);

    // NEW — quale categoria sto modificando per il drawer item
    const [selectedCategoryForItems, setSelectedCategoryForItems] =
        useState<BusinessCategory | null>(null);

    // NEW — drawer status
    const [drawerCategoriesOpen, setDrawerCategoriesOpen] = useState(false);
    const [drawerItemsOpen, setDrawerItemsOpen] = useState(false);

    // Estraggo le categorie "pulite"
    const categories: BusinessCategory[] = useMemo(() => {
        // prendo gli ID delle categorie che esistono ancora nel catalogo
        const existingIds = new Set(allCategories.map(c => c.id));

        return data.categories
            .map(cc => cc.category)
            .filter((cat): cat is BusinessCategory => !!cat && existingIds.has(cat.id));
    }, [data.categories, allCategories]);

    const availableCategories = useMemo(() => {
        const usedIds = new Set(categories.map(c => c.id));
        return allCategories.filter(cat => !usedIds.has(cat.id));
    }, [allCategories, categories]);

    const availableItems = useMemo(() => {
        if (!activeCategoryId) return [];

        // item già usati nella collection
        const usedIds = new Set(
            data.items.filter(i => i.category_id === activeCategoryId).map(i => i.item.id)
        );

        return allItems.filter(it => it.category_id === activeCategoryId && !usedIds.has(it.id));
    }, [activeCategoryId, allItems, data.items]);

    // ----------------------------------------------
    // PREVIEW DATA (menu da mostrare nella Preview)
    // ----------------------------------------------
    const previewData = useMemo(() => {
        return {
            id: collection.id,
            name: collection.name,
            categories: data.categories
                .flatMap(c => {
                    const cat = c.category;
                    if (!cat) return [];
                    return [
                        {
                            id: cat.id,
                            name: cat.name,
                            order_index: c.order_index,
                            items: data.items
                                .filter(i => i.category_id === cat.id)
                                .map(i => ({
                                    id: i.item.id,
                                    name: i.item.name,
                                    description: i.item.description ?? undefined,
                                    price: i.item.price ?? undefined,
                                    image: i.item.image ?? undefined
                                }))
                        }
                    ];
                })
                .sort((a, b) => a.order_index - b.order_index)
        };
    }, [collection.id, collection.name, data.categories, data.items]);

    useEffect(() => {
        if (categories.length > 0) {
            setActiveCategoryId(prev => prev ?? categories[0].id);
        } else {
            setActiveCategoryId(null);
        }
    }, [categories]);

    useEffect(() => {
        async function loadCategories() {
            const businessCats = await getAllBusinessCategories(collection.business_id);
            setAllCategories(businessCats);
        }
        void loadCategories();
    }, [collection.business_id]);

    useEffect(() => {
        async function loadItems() {
            const items = await getAllBusinessItems(collection.business_id);
            setAllItems(items);
        }
        void loadItems();
    }, [collection.business_id]);

    useEffect(() => {
        if (onPreviewUpdate) {
            onPreviewUpdate(previewData);
        }
    }, [previewData, onPreviewUpdate]);

    // Item per la categoria attiva
    const itemsForActiveCategory: BusinessItem[] = useMemo(() => {
        if (!activeCategoryId) return [];

        // item che esistono ancora nel catalogo
        const existingItemIds = new Set(allItems.map(i => i.id));

        return data.items
            .filter(
                i => i.category_id === activeCategoryId && i.item && existingItemIds.has(i.item.id)
            )
            .map(i => i.item as BusinessItem);
    }, [data.items, activeCategoryId, allItems]);

    const activeCategoryName = useMemo(() => {
        if (!activeCategoryId) return undefined;
        return categories.find(c => c.id === activeCategoryId)?.name;
    }, [categories, activeCategoryId]);

    // -------------------------------------------------
    // CRUD ACTIONS — le sue rimangono IDENTICHE, nessun cambiamento
    // -------------------------------------------------

    async function handleAddCategory(categoryId: string) {
        await addCategoryToCollection(collection.id, categoryId);

        const catObj = allCategories.find(c => c.id === categoryId);
        if (!catObj) return;

        const newEntry = {
            id: crypto.randomUUID(),
            order_index: categories.length,
            category: catObj
        };

        data.categories = [...data.categories, newEntry];
        setActiveCategoryId(categoryId);
    }

    async function handleAddItem(itemId: string) {
        if (!activeCategoryId) return;

        await addItemToCollection(collection.id, itemId, activeCategoryId);

        const itemObj = allItems.find(it => it.id === itemId);
        if (!itemObj) return;

        const newEntry = {
            id: crypto.randomUUID(),
            order_index: itemsForActiveCategory.length,
            category_id: activeCategoryId,
            item: itemObj
        };

        data.items = [...data.items, newEntry];
        setAllItems([...allItems]);
    }

    async function handleRemoveCategory(categoryId: string) {
        await removeCategoryFromCollection(collection.id, categoryId);

        data.categories = data.categories.filter(c => c.category.id !== categoryId);
        data.items = data.items.filter(it => it.category_id !== categoryId);

        const remaining = data.categories.map(c => c.category);
        setActiveCategoryId(remaining.length ? remaining[0].id : null);

        setAllCategories(prev => [...prev]);
    }

    async function handleRemoveItem(itemId: string) {
        if (!activeCategoryId) return;

        await removeItemFromCollection(collection.id, itemId);
        data.items = data.items.filter(it => it.item.id !== itemId);

        setAllItems([...allItems]);
    }

    // -------------------------------------------------
    // RENDER
    // -------------------------------------------------

    return (
        <div className={styles.wrapper}>
            {/* HEADER */}
            <header className={styles.header}>
                <div className={styles.headerInfo}>
                    <Text as="h3" weight={600}>
                        {collection.name}
                    </Text>

                    {collection.description && <Text as="p">{collection.description}</Text>}
                </div>

                <div className={styles.badges}>
                    {collection.highlighted && (
                        <span className={`${styles.badge} ${styles.badgePrimary}`}>
                            <Text as="span" weight={500}>
                                In evidenza
                            </Text>
                        </span>
                    )}
                </div>
            </header>

            {/* LAYOUT PRINCIPALE */}
            <div className={styles.layout}>
                {/* COLONNA CATEGORIE */}
                <aside className={styles.categoriesColumn}>
                    <CollectionCategories
                        categories={categories}
                        availableCategories={availableCategories}
                        onAddCategory={() => setDrawerCategoriesOpen(true)}
                        activeCategoryId={activeCategoryId}
                        onSelectCategory={setActiveCategoryId}
                        onRemoveCategory={handleRemoveCategory}
                    />
                </aside>

                {/* COLONNA ITEMS */}
                <main className={styles.itemsColumn}>
                    <CollectionItems
                        items={itemsForActiveCategory}
                        categoryName={activeCategoryName}
                        availableItems={availableItems}
                        activeCategoryId={activeCategoryId!} // certo che non è null qui
                        onAddItem={categoryId => {
                            const categoryObj = categories.find(c => c.id === categoryId);
                            if (!categoryObj) return;

                            setSelectedCategoryForItems(categoryObj);
                            setDrawerItemsOpen(true);
                        }}
                        onRemoveItem={handleRemoveItem}
                    />
                </main>
            </div>

            {/* -------------------------------------- */}
            {/* DRAWER CATEGORIE */}
            {/* -------------------------------------- */}
            <SelectionDrawer
                title="Aggiungi categorie"
                isOpen={drawerCategoriesOpen}
                onClose={() => setDrawerCategoriesOpen(false)}
            >
                <CategorySelectionPanel
                    categories={allCategories}
                    alreadySelected={categories.map(c => c.id)}
                    onSelect={ids => {
                        ids.forEach(handleAddCategory);
                        setDrawerCategoriesOpen(false);
                    }}
                />
            </SelectionDrawer>

            {/* -------------------------------------- */}
            {/* DRAWER ITEMS */}
            {/* -------------------------------------- */}
            <SelectionDrawer
                title={
                    selectedCategoryForItems
                        ? `Aggiungi elementi in “${selectedCategoryForItems.name}”`
                        : "Aggiungi elementi"
                }
                isOpen={drawerItemsOpen}
                onClose={() => setDrawerItemsOpen(false)}
            >
                {selectedCategoryForItems && (
                    <ItemSelectionPanel
                        items={allItems.filter(
                            it => it.category_id === selectedCategoryForItems.id
                        )}
                        alreadySelected={data.items
                            .filter(it => it.category_id === selectedCategoryForItems.id)
                            .map(it => it.item.id)}
                        onSelect={ids => {
                            ids.forEach(handleAddItem);
                            setDrawerItemsOpen(false);
                        }}
                    />
                )}
            </SelectionDrawer>
        </div>
    );
}
