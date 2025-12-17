import { supabase } from "./client";
import type {
    Collection,
    CollectionSection,
    CollectionItem,
    Item,
    CollectionItemWithItem
} from "@/types/database";

/* ============================
   COLLECTIONS (CRUD)
============================ */

export async function listCollections(): Promise<Collection[]> {
    const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

export async function createCollection(data: {
    name: string;
    description?: string;
    collection_type?: string;
}): Promise<Collection> {
    const { data: collection, error } = await supabase
        .from("collections")
        .insert({
            name: data.name,
            description: data.description ?? null,
            collection_type: data.collection_type ?? "generic"
        })
        .select()
        .single();

    if (error) throw error;
    return collection;
}

export async function updateCollection(
    id: string,
    fields: Partial<Pick<Collection, "name" | "description" | "style">>
): Promise<Collection> {
    const { data, error } = await supabase
        .from("collections")
        .update(fields)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteCollection(id: string): Promise<void> {
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) throw error;
}

/* ============================
   SECTIONS
============================ */

export async function listSections(collectionId: string): Promise<CollectionSection[]> {
    const { data, error } = await supabase
        .from("collection_sections")
        .select("*")
        .eq("collection_id", collectionId)
        .order("order_index");

    if (error) throw error;
    return data ?? [];
}

export async function createSection(
    collectionId: string,
    name: string
): Promise<CollectionSection> {
    const { data, error } = await supabase
        .from("collection_sections")
        .insert({ collection_id: collectionId, name })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/* ============================
   ITEMS (GLOBAL)
============================ */

export async function searchItems(query: string): Promise<Item[]> {
    const { data, error } = await supabase
        .from("items")
        .select("*")
        .ilike("name", `%${query}%`)
        .limit(20);

    if (error) throw error;
    return data ?? [];
}

export async function createItem(data: {
    name: string;
    description?: string;
    base_price?: number;
    duration?: number;
}): Promise<Item> {
    const { data: item, error } = await supabase
        .from("items")
        .insert({
            name: data.name,
            description: data.description ?? null,
            base_price: data.base_price ?? null,
            duration: data.duration ?? null
        })
        .select()
        .single();

    if (error) throw error;
    return item;
}

export async function listItems(limit = 50): Promise<Item[]> {
    const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data ?? [];
}

export async function updateItem(
    id: string,
    fields: Partial<Pick<Item, "name" | "description" | "base_price" | "duration" | "metadata">>
): Promise<Item> {
    const { data, error } = await supabase
        .from("items")
        .update(fields)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteItem(id: string): Promise<void> {
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) throw error;
}

/* ============================
   COLLECTION ITEMS
============================ */

export async function listCollectionItems(collectionId: string): Promise<CollectionItem[]> {
    const { data, error } = await supabase
        .from("collection_items")
        .select("*")
        .eq("collection_id", collectionId)
        .order("order_index");

    if (error) throw error;
    return data ?? [];
}

export async function addItemToCollection(
    collectionId: string,
    itemId: string,
    sectionId?: string
): Promise<CollectionItem> {
    const { data, error } = await supabase
        .from("collection_items")
        .insert({
            collection_id: collectionId,
            item_id: itemId,
            section_id: sectionId ?? null
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateCollectionItem(
    id: string,
    fields: Partial<Pick<CollectionItem, "section_id" | "order_index" | "visible">>
): Promise<CollectionItem> {
    const { data, error } = await supabase
        .from("collection_items")
        .update(fields)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function removeItemFromCollection(id: string): Promise<void> {
    const { error } = await supabase.from("collection_items").delete().eq("id", id);

    if (error) throw error;
}

export async function getCollectionBuilderData(collectionId: string) {
    const [{ data: collection }, { data: sections }, { data: items }] = await Promise.all([
        supabase.from("collections").select("*").eq("id", collectionId).single(),
        supabase
            .from("collection_sections")
            .select("*")
            .eq("collection_id", collectionId)
            .order("order_index"),
        supabase
            .from("collection_items")
            .select("*")
            .eq("collection_id", collectionId)
            .order("order_index")
    ]);

    if (!collection) {
        throw new Error("Collection not found");
    }

    return {
        collection,
        sections: sections ?? [],
        items: items ?? []
    };
}

export async function renameSection(sectionId: string, name: string) {
    const { data, error } = await supabase
        .from("collection_sections")
        .update({ name })
        .eq("id", sectionId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getCollectionItemsWithData(
    collectionId: string
): Promise<CollectionItemWithItem[]> {
    const { data, error } = await supabase
        .from("collection_items")
        .select(
            `
            id,
            collection_id,
            section_id,
            order_index,
            visible,
            item:items (
                id,
                name,
                description,
                base_price,
                duration,
                metadata,
                created_at,
                updated_at
            )
        `
        )
        .eq("collection_id", collectionId)
        .order("order_index");

    if (error) throw error;

    return (data ?? []).map(row => {
        const rawItem = Array.isArray(row.item) ? row.item[0] : row.item;

        if (!rawItem) {
            throw new Error("Item relation missing");
        }

        return {
            id: row.id,
            collection_id: row.collection_id,
            section_id: row.section_id,
            order_index: row.order_index,
            visible: row.visible,
            item: {
                id: rawItem.id,
                name: rawItem.name,
                description: rawItem.description,
                base_price: rawItem.base_price,
                duration: rawItem.duration,
                metadata: rawItem.metadata ?? null,
                created_at: rawItem.created_at,
                updated_at: rawItem.updated_at
            }
        };
    });
}

export async function getPreviewCollectionItemsWithOverrides(
    collectionId: string,
    businessId: string
): Promise<CollectionItemWithItem[]> {
    // 1) item base della collezione
    const items = await getCollectionItemsWithData(collectionId);

    // 2) override per il business
    const { data: overrides, error } = await supabase
        .from("business_item_overrides")
        .select("item_id, price_override, visible_override")
        .eq("business_id", businessId);

    if (error) throw error;

    const overrideMap = new Map<string, { price: number | null; visible: boolean | null }>();

    for (const o of overrides ?? []) {
        overrideMap.set(o.item_id, {
            price: o.price_override,
            visible: o.visible_override
        });
    }

    // 3) applicazione override
    return items
        .map(row => {
            const override = overrideMap.get(row.item.id);

            const visible = override?.visible ?? row.visible ?? true;

            if (!visible) return null;

            return {
                ...row,
                item: {
                    ...row.item,
                    base_price: override?.price ?? row.item.base_price
                }
            };
        })
        .filter(Boolean) as CollectionItemWithItem[];
}
