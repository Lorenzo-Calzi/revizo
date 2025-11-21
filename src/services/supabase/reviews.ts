import { supabase } from "./client";
import type { Review } from "@/types/database";

export type AnalyticsReview = Pick<Review, "id" | "rating" | "source" | "created_at">;

export async function getUserReviews(userId: string): Promise<Review[]> {
    // 1) prendo gli id dei locali dell'utente
    const { data: restaurants, error: restError } = await supabase
        .from("restaurants")
        .select("id")
        .eq("user_id", userId);

    if (restError) throw restError;
    if (!restaurants || restaurants.length === 0) return [];

    const restaurantIds = restaurants.map(r => r.id);

    // 2) prendo le recensioni di quei locali
    const { data: reviews, error: revError } = await supabase
        .from("reviews")
        .select("*")
        .in("restaurant_id", restaurantIds)
        .order("created_at", { ascending: false });

    if (revError) throw revError;
    return reviews ?? [];
}

export async function getReviewsByUser(userId: string) {
    const { data, error } = await supabase
        .from("reviews")
        .select("*, restaurants!inner(user_id)")
        .eq("restaurants.user_id", userId);
    if (error) throw error;
    return data;
}

/** Se in futuro vuoi filtrare per singolo locale */
export async function getRestaurantReviews(restaurantId: string): Promise<Review[]> {
    const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

export async function addReview(userId: string, rating: number, comment: string) {
    const { error } = await supabase.from("reviews").insert([
        {
            user_id: userId,
            rating,
            comment
        }
    ]);

    if (error) {
        console.error("Errore durante l'inserimento recensione:", error.message);
        throw error;
    }
}

export async function deleteReview(reviewId: string) {
    const { data, error } = await supabase.from("reviews").delete().eq("id", reviewId).select("id");

    if (error) {
        console.error("Errore Supabase deleteReview:", error);
        throw error;
    }

    if (!data || data.length === 0) {
        // utile per capire se l'id non matcha nessuna riga
        throw new Error("Nessuna recensione trovata da eliminare.");
    }

    return data[0]; // opzionale, ma comodo se vuoi usarlo
}

export async function updateReviewResponse(reviewId: string, response: string) {
    const { error } = await supabase
        .from("reviews")
        .update({ response, response_date: new Date().toISOString() })
        .eq("id", reviewId);

    if (error) throw error;
}

/** Ottiene tutte le recensioni per un ristorante o globali */
export async function getAnalyticsReviews() {
    const { data, error } = await supabase
        .from("reviews")
        .select(
            `
            id,
            rating,
            created_at,
            source,
            restaurant_id,
            restaurants:restaurant_id (
                name,
                user_id
            )
        `
        )
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Errore caricamento analytics reviews:", error);
        return [];
    }

    // Normalizzazione
    return data.map(r => ({
        ...r,
        restaurant_name: r.restaurants?.name ?? null,
        restaurant_owner_id: r.restaurants?.user_id ?? null
    }));
}
