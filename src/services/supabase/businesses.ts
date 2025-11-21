import { supabase } from "./client";
import type { Business } from "@/types/database";

export async function getUserBusinesses(userId: string): Promise<Business[]> {
    const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

export async function addBusiness(
    userId: string,
    name: string,
    city: string,
    address: string,
    slug: string,
    type: string
) {
    const { error } = await supabase
        .from("businesses")
        .insert([{ user_id: userId, name, city, address, slug, type }]);
    if (error) throw error;
}

export async function deleteBusiness(id: string) {
    const { error } = await supabase.from("businesses").delete().eq("id", id);
    if (error) throw error;
}

export async function updateBusiness(
    id: string,
    updates: { name: string; city: string; address: string; slug: string; type: string }
) {
    const { error } = await supabase.from("businesses").update(updates).eq("id", id);
    if (error) throw error;
}

export async function getBusinessById(id: string) {
    const { data, error } = await supabase.from("businesses").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
}
