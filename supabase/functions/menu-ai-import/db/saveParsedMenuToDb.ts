// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { ParsedMenu, ParsedMenuCategory } from "../types/aiMenu.ts";

type SaveResult = {
    insertedCategories: number;
    insertedItems: number;
};

export async function saveParsedMenuToDb(
    parsedMenu: ParsedMenu,
    businessId: string
): Promise<SaveResult> {
    // ───────────────────────────────────────────────────────
    // 1. Inizializza Supabase client
    // ───────────────────────────────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false
        }
    });

    // ───────────────────────────────────────────────────────
    // 2. Cancella tutte le categorie del business (cascade)
    //    → elimina TUTTI gli item collegati
    // ───────────────────────────────────────────────────────
    const deleteResult = await supabase
        .from("business_categories")
        .delete()
        .match({ business_id: businessId });

    if (deleteResult.error) {
        throw new Error(
            "Errore durante la cancellazione del catalogo esistente: " + deleteResult.error.message
        );
    }

    // ───────────────────────────────────────────────────────
    // 3. Inserisci nuove categorie
    // ───────────────────────────────────────────────────────
    const categoriesToInsert = parsedMenu.categories.map(
        (cat: ParsedMenuCategory, index: number) => ({
            business_id: businessId,
            name: cat.name,
            order_index: index,
            visible: true
        })
    );

    const insertCat = await supabase
        .from("business_categories")
        .insert(categoriesToInsert)
        .select("id, name");

    if (insertCat.error) {
        throw new Error("Errore durante l'inserimento delle categorie: " + insertCat.error.message);
    }

    const createdCategories = insertCat.data;

    // Mappa: nome categoria AI → id categoria DB
    const categoryIdMap = new Map<string, string>();
    parsedMenu.categories.forEach((cat, i) => {
        categoryIdMap.set(cat.name, createdCategories[i].id);
    });

    // ───────────────────────────────────────────────────────
    // 4. Inserisci gli ITEMS
    // ───────────────────────────────────────────────────────
    const itemsToInsert = [];

    parsedMenu.categories.forEach((cat, catIndex) => {
        const dbCategoryId = categoryIdMap.get(cat.name);

        cat.items.forEach((item, itemIndex) => {
            itemsToInsert.push({
                category_id: dbCategoryId,
                name: item.name,
                description: item.description ?? null,
                price: item.price ?? null,
                order_index: itemIndex,
                visible: true,
                allergens: item.allergens ?? null,
                image: null,
                duration: null
            });
        });
    });

    if (itemsToInsert.length > 0) {
        const insertItems = await supabase.from("business_items").insert(itemsToInsert);

        if (insertItems.error) {
            throw new Error(
                "Errore durante l'inserimento degli items: " + insertItems.error.message
            );
        }
    }

    // ───────────────────────────────────────────────────────
    // 5. Ritorna un report
    // ───────────────────────────────────────────────────────
    return {
        insertedCategories: categoriesToInsert.length,
        insertedItems: itemsToInsert.length
    };
}
