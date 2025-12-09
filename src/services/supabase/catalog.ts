import { supabase } from "./client";
import type { BusinessCategory, BusinessItem } from "@/types/database";

/* ============================
   CATEGORIE
============================ */

/** Restituisce tutte le categorie di un business, ordinate per order_index */
export async function getBusinessCategories(businessId: string): Promise<BusinessCategory[]> {
    const { data, error } = await supabase
        .from("business_categories")
        .select("*")
        .eq("business_id", businessId)
        .order("order_index", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

/** Crea una nuova categoria per un business */
export async function addBusinessCategory(
    businessId: string,
    name: string
): Promise<BusinessCategory> {
    const { data, error } = await supabase
        .from("business_categories")
        .insert({
            business_id: businessId,
            name
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/** Aggiorna una categoria (nome, visibilità, ordine, ecc.) */
export async function updateBusinessCategory(
    categoryId: string,
    updates: Partial<Pick<BusinessCategory, "name" | "order_index" | "visible">>
): Promise<BusinessCategory> {
    const { data, error } = await supabase
        .from("business_categories")
        .update(updates)
        .eq("id", categoryId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/** Elimina una categoria (e, grazie alla FK, anche i suoi item) */
export async function deleteBusinessCategory(categoryId: string): Promise<void> {
    const { error } = await supabase.from("business_categories").delete().eq("id", categoryId);

    if (error) throw error;
}

/* ============================
   ITEMS
============================ */

/** Restituisce tutti gli item di una categoria */
export async function getBusinessItemsByCategory(categoryId: string): Promise<BusinessItem[]> {
    const { data, error } = await supabase
        .from("business_items")
        .select("*")
        .eq("category_id", categoryId)
        .order("order_index", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

/** (Opzionale ma comodo) tutti gli item di un business, già joinati per categoria */
export async function getBusinessItemsByBusiness(businessId: string): Promise<BusinessItem[]> {
    const { data, error } = await supabase
        .from("business_items")
        .select("*, business_categories!inner(business_id)")
        .eq("business_categories.business_id", businessId)
        .order("order_index", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

/** Crea un item (piatto/servizio/prodotto) per una categoria */
export async function addBusinessItem(
    categoryId: string,
    input: {
        name: string;
        description?: string;
        price?: number;
        duration?: number;
        allergens?: string[];
        image?: string;
    }
): Promise<BusinessItem> {
    const { data, error } = await supabase
        .from("business_items")
        .insert({
            category_id: categoryId,
            name: input.name,
            description: input.description ?? null,
            price: input.price ?? null,
            duration: input.duration ?? null,
            allergens: input.allergens ?? null,
            image: input.image ?? null
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/** Aggiorna un item */
export async function updateBusinessItem(
    itemId: string,
    updates: Partial<
        Pick<
            BusinessItem,
            | "name"
            | "description"
            | "price"
            | "duration"
            | "allergens"
            | "image"
            | "order_index"
            | "visible"
        >
    >
): Promise<BusinessItem> {
    const { data, error } = await supabase
        .from("business_items")
        .update(updates)
        .eq("id", itemId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/** Elimina un item */
export async function deleteBusinessItem(itemId: string): Promise<void> {
    const { error } = await supabase.from("business_items").delete().eq("id", itemId);

    if (error) throw error;
}

export async function getAllBusinessCategories(businessId: string): Promise<BusinessCategory[]> {
    const { data, error } = await supabase
        .from("business_categories")
        .select("*")
        .eq("business_id", businessId)
        .order("order_index", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

export async function getAllBusinessItems(businessId: string): Promise<BusinessItem[]> {
    const { data, error } = await supabase
        .from("business_items")
        .select("*, business_categories!inner(business_id)")
        .eq("business_categories.business_id", businessId)
        .order("order_index", { ascending: true });

    if (error) throw error;
    return data ?? [];
}
