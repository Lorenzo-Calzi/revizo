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
    updates: {
        name: string;
        city: string;
        address: string;
        slug: string;
        type: string;
    }
) {
    const { error } = await supabase.from("businesses").update(updates).eq("id", id);
    if (error) throw error;
}

export async function getBusinessById(id: string) {
    const { data, error } = await supabase.from("businesses").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
    const { data, error } = await supabase.from("businesses").select("*").eq("slug", slug).single();

    if (error) return null;
    return data;
}

export async function uploadBusinessCover(businessId: string, file: File): Promise<string | null> {
    const user = supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    if (!file) throw new Error("File mancante");

    // Estensione file
    const ext = file.name.split(".").pop() || "jpg";

    // Nome file unico
    const fileName = `${businessId}.${ext}`;

    // Upload
    const { data, error } = await supabase.storage.from("business-covers").upload(fileName, file, {
        upsert: true
    });

    if (error) {
        console.error("Errore upload cover:", error);
        throw new Error("Upload fallito");
    }

    // Ottieni URL pubblico
    const {
        data: { publicUrl }
    } = supabase.storage.from("business-covers").getPublicUrl(fileName);

    // Salva nel DB
    await supabase.from("businesses").update({ cover_image: publicUrl }).eq("id", businessId);

    return publicUrl;
}

export async function removeBusinessCover(businessId: string) {
    // Prendiamo l'estensione dal DB se serve
    const { data: biz } = await supabase
        .from("businesses")
        .select("cover_image")
        .eq("id", businessId)
        .single();

    if (!biz?.cover_image) return;

    // File name = businessId.ext
    const fileName = biz.cover_image.split("/").pop();

    if (fileName) {
        await supabase.storage.from("business-covers").remove([fileName]);
    }

    await supabase.from("businesses").update({ cover_image: null }).eq("id", businessId);
}
