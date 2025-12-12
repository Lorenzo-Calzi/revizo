import {
    Business,
    Collection,
    CollectionCategory,
    CollectionItem,
    FullCollection,
    RawCategoryRow,
    RawItemRow
} from "@/types/database";
import { supabase } from "./client";

type PublicItem = {
    id: string;
    name: string;
    description?: string;
    price?: number;
    image?: string;
    category_id: string;
};

/* ============================
   CRUD COLLECTIONS
============================ */

export async function createCollection(
    businessId: string,
    data: {
        name: string;
        description?: string;
        highlighted?: boolean;
    }
): Promise<Collection> {
    const { data: collection, error } = await supabase
        .from("collections")
        .insert({
            business_id: businessId,
            name: data.name,
            description: data.description ?? null,
            highlighted: data.highlighted ?? false
        })
        .select()
        .single();

    if (error) throw error;
    return collection as Collection;
}

export async function getCollections(businessId: string): Promise<Collection[]> {
    const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as Collection[];
}

export async function updateCollection(
    id: string,
    fields: Partial<{
        name: string;
        description: string;
        highlighted: boolean;
    }>
): Promise<Collection> {
    const { data, error } = await supabase
        .from("collections")
        .update(fields)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as Collection;
}

export async function deleteCollection(id: string): Promise<boolean> {
    const { error } = await supabase.from("collections").delete().eq("id", id);

    if (error) throw error;
    return true;
}

/* ============================
   CATEGORIE NELLA COLLECTION
============================ */

export async function addCategoryToCollection(collectionId: string, categoryId: string) {
    const { data, error } = await supabase
        .from("collection_categories")
        .insert({
            collection_id: collectionId,
            category_id: categoryId
        })
        .select()
        .single();

    if (error) throw error;
    return data as CollectionCategory;
}

/* ============================
   HIGHLIGHTED (MENÙ IN EVIDENZA)
============================ */

export async function setExclusiveHighlighted(
    businessId: string,
    collectionId: string | null
): Promise<void> {
    // Se collectionId è null → rimuoviamo solo l'evidenza da tutti
    if (!collectionId) {
        const { error } = await supabase
            .from("collections")
            .update({ highlighted: false })
            .eq("business_id", businessId);

        if (error) throw error;
        return;
    }

    // 1) Rimuoviamo l'evidenza da tutte le altre
    const { error: resetErr } = await supabase
        .from("collections")
        .update({ highlighted: false })
        .eq("business_id", businessId);

    if (resetErr) throw resetErr;

    // 2) Impostiamo quella scelta come evidenziata
    const { error: setErr } = await supabase
        .from("collections")
        .update({ highlighted: true })
        .eq("id", collectionId);

    if (setErr) throw setErr;
}

export async function getHighlightedCollectionForBusiness(
    businessId: string
): Promise<Collection | null> {
    const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("business_id", businessId)
        .eq("highlighted", true)
        .maybeSingle();

    if (error) throw error;

    return (data as Collection) ?? null;
}

export async function removeCategoryFromCollection(collectionId: string, categoryId: string) {
    const { error } = await supabase
        .from("collection_categories")
        .delete()
        .eq("collection_id", collectionId)
        .eq("category_id", categoryId);

    if (error) throw error;
    return true;
}

export async function reorderCollectionCategories(
    collectionId: string,
    orderedCategoryIds: string[]
) {
    const updates = orderedCategoryIds.map((categoryId, index) => ({
        collection_id: collectionId,
        category_id: categoryId,
        order_index: index
    }));

    const { error } = await supabase.from("collection_categories").upsert(updates, {
        onConflict: "collection_id,category_id"
    });

    if (error) throw error;
    return true;
}

/* ============================
   ITEM NELLA COLLECTION
============================ */

export async function addItemToCollection(
    collectionId: string,
    itemId: string,
    categoryId: string
) {
    const { data, error } = await supabase
        .from("collection_items")
        .insert({
            collection_id: collectionId,
            item_id: itemId,
            category_id: categoryId,
            visible: true
        })
        .select()
        .single();

    if (error) throw error;
    return data as CollectionItem;
}

export async function removeItemFromCollection(collectionId: string, itemId: string) {
    const { error } = await supabase
        .from("collection_items")
        .delete()
        .eq("collection_id", collectionId)
        .eq("item_id", itemId);

    if (error) throw error;
    return true;
}

export async function reorderCollectionItems(collectionId: string, orderedItemIds: string[]) {
    const updates = orderedItemIds.map((itemId, index) => ({
        collection_id: collectionId,
        item_id: itemId,
        order_index: index
    }));

    const { error } = await supabase.from("collection_items").upsert(updates, {
        onConflict: "collection_id,item_id"
    });

    if (error) throw error;
    return true;
}

export async function setCollectionItemVisibility(
    collectionItemId: string,
    visible: boolean
): Promise<CollectionItem> {
    const { data, error } = await supabase
        .from("collection_items")
        .update({ visible })
        .eq("id", collectionItemId)
        .select()
        .single();

    if (error) throw error;
    return data as CollectionItem;
}

/* ============================
   FETCH COMPLETO PER L'EDITOR
============================ */

export async function getFullCollection(collectionId: string): Promise<FullCollection> {
    // 1) Collection
    const { data: collection, error: err1 } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

    if (err1) throw err1;

    // 2) Categories join
    const { data: categoriesRaw, error: err2 } = await supabase
        .from("collection_categories")
        .select(
            `
            id,
            order_index,
            category:business_categories(*)
        `
        )
        .eq("collection_id", collectionId)
        .order("order_index", { ascending: true });

    if (err2) throw err2;

    // 3) Items join
    const { data: itemsRaw, error: err3 } = await supabase
        .from("collection_items")
        .select(
            `
            id,
            order_index,
            category_id,
            visible,
            item:business_items(*)
        `
        )
        .eq("collection_id", collectionId)
        .order("order_index", { ascending: true });

    if (err3) throw err3;

    // 🔄 Normalizzazione categorie
    const categories: FullCollection["categories"] = (categoriesRaw as RawCategoryRow[])
        .map(row => {
            if (!row) return null;

            const cat = Array.isArray(row.category) ? row.category[0] : row.category;

            if (!cat) return null;

            return {
                id: row.id,
                order_index: row.order_index,
                category: cat
            };
        })
        .filter(Boolean) as FullCollection["categories"];

    // 🔄 Normalizzazione items
    const items: FullCollection["items"] = (itemsRaw as RawItemRow[])
        .map(row => {
            if (!row) return null;

            const rawItem = Array.isArray(row.item) ? row.item[0] : row.item;

            if (!rawItem) return null;

            return {
                id: row.id,
                order_index: row.order_index,
                category_id: row.category_id,
                item: rawItem,
                visible: row.visible ?? true
            };
        })
        .filter(Boolean) as FullCollection["items"];

    return {
        collection: collection as Collection,
        categories,
        items
    };
}

/* ============================
   FETCH PER LA PAGINA PUBBLICA
============================ */

export async function getPublicCollection(collectionId: string) {
    // 1) Categorie collegate a questa collection
    const { data: catRows, error: catErr } = await supabase
        .from("collection_categories")
        .select(
            `
            order_index,
            category:business_categories (
                id,
                name,
                order_index
            )
        `
        )
        .eq("collection_id", collectionId)
        .order("order_index", { ascending: true });

    if (catErr) throw catErr;

    const categories = catRows
        .map(row => {
            const cat = Array.isArray(row.category) ? row.category[0] : row.category;
            if (!cat) return null;

            return {
                id: cat.id,
                name: cat.name,
                order_index: row.order_index ?? cat.order_index ?? 0
            };
        })
        .filter(Boolean) as { id: string; name: string; order_index: number }[];

    // 2) Items collegati a questa collection
    const { data: itemRows, error: itemErr } = await supabase
        .from("collection_items")
        .select(
            `
            category_id,
            order_index,
            visible,
            item:business_items (
                id,
                name,
                description,
                price,
                image
            )
        `
        )
        .eq("collection_id", collectionId)
        .order("order_index", { ascending: true });

    if (itemErr) throw itemErr;

    // 3) Mappiamo gli item per categoria
    const itemsByCategory: Record<string, PublicItem[]> = {};

    for (const row of itemRows) {
        // se non è visibile, lo saltiamo
        if (row.visible === false) continue;

        const rawItem = Array.isArray(row.item) ? row.item[0] : row.item;
        if (!rawItem) continue;

        const catId = row.category_id;
        if (!itemsByCategory[catId]) itemsByCategory[catId] = [];

        itemsByCategory[catId].push({
            id: rawItem.id,
            name: rawItem.name,
            description: rawItem.description ?? undefined,
            price: rawItem.price ?? undefined,
            image: rawItem.image ?? undefined,
            category_id: catId
        });
    }

    return {
        categories: categories.sort((a, b) => a.order_index - b.order_index),
        items: itemsByCategory
    };
}

/* ============================
   MENÙ PUBBLICI PER IL BUSINESS
   (PRINCIPALE + EVENTUALE SPECIALE)
============================ */

export async function getPublicMenusForBusiness(business: Business) {
    const mainId = business.active_collection_id;

    // se non c'è menù principale, non mostriamo nulla
    if (!mainId) {
        return {
            main: null as Awaited<ReturnType<typeof getPublicCollection>> | null,
            highlighted: null as Awaited<ReturnType<typeof getPublicCollection>> | null
        };
    }

    // Menù principale
    const main = await getPublicCollection(mainId);

    // Menù speciale (se esiste e diverso dal principale)
    const highlightedCollection = await getHighlightedCollectionForBusiness(business.id);

    let highlighted: Awaited<ReturnType<typeof getPublicCollection>> | null = null;

    if (highlightedCollection && highlightedCollection.id !== mainId) {
        highlighted = await getPublicCollection(highlightedCollection.id);
    }

    return { main, highlighted };
}

type PublicCollectionResult = Awaited<ReturnType<typeof getPublicCollection>>;

/**
 * Combina menù principale + eventuale menù speciale
 * in un unico set di categorie + items per il catalogo pubblico.
 *
 * - Le categorie del menù speciale vengono prima
 * - Le categorie del menù principale vengono dopo
 * - Per evitare collisioni di ID, aggiungiamo un prefix
 */
export function buildCombinedPublicCollection(
    main: PublicCollectionResult | null,
    highlighted: PublicCollectionResult | null
) {
    const categories: { id: string; name: string; order_index: number }[] = [];
    const items: Record<string, PublicItem[]> = {};

    // 1) Menù speciale (se presente)
    if (highlighted) {
        highlighted.categories.forEach(cat => {
            const newId = `highlighted-${cat.id}`;

            categories.push({
                id: newId,
                name: `⭐ ${cat.name} (Menù del giorno)`,
                order_index: cat.order_index ?? 0
            });

            const catItems = highlighted.items[cat.id] ?? [];
            items[newId] = catItems;
        });
    }

    // 2) Menù principale (se presente)
    if (main) {
        main.categories.forEach(cat => {
            const newId = `main-${cat.id}`;

            categories.push({
                id: newId,
                name: cat.name,
                order_index: cat.order_index ?? 0
            });

            const catItems = main.items[cat.id] ?? [];
            items[newId] = catItems;
        });
    }

    // Ordine finale per sicurezza
    categories.sort((a, b) => a.order_index - b.order_index);

    return { categories, items };
}
