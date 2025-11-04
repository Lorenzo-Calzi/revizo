import { supabase } from "./client";
import type { Restaurant } from "@/types/database";

export async function getUserRestaurants(userId: string): Promise<Restaurant[]> {
    const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

export async function addRestaurant(userId: string, name: string, city: string, slug: string) {
    const { error } = await supabase
        .from("restaurants")
        .insert([{ user_id: userId, name, city, slug }]);
    if (error) throw error;
}

export async function deleteRestaurant(id: string) {
    const { error } = await supabase.from("restaurants").delete().eq("id", id);
    if (error) throw error;
}
