import { supabase } from "./client";
import type { Business } from "@/types/database";
import type { CatalogTheme } from "@/types/theme";

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
): Promise<Business> {
    const { data, error } = await supabase
        .from("businesses")
        .insert([{ user_id: userId, name, city, address, slug, type }])
        .select("*")
        .single();

    if (error) throw error;
    return data as Business;
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
    // Recuperiamo la sessione corretta
    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
        throw new Error("Not authenticated: session missing");
    }

    if (!file) {
        throw new Error("File mancante");
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${businessId}.${ext}`;

    console.log("Uploading file:", fileName);

    // Forziamo l'Authorization header
    const { error: uploadError } = await supabase.storage
        .from("business-covers")
        .upload(fileName, file, {
            upsert: true,
            contentType: file.type,
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        });

    if (uploadError) {
        console.error("Errore upload cover:", uploadError);
        throw uploadError;
    }

    const {
        data: { publicUrl }
    } = supabase.storage.from("business-covers").getPublicUrl(fileName);

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

export async function updateBusinessTheme(businessId: string, theme: CatalogTheme) {
    const { error } = await supabase.from("businesses").update({ theme }).eq("id", businessId);

    if (error) throw error;
}
