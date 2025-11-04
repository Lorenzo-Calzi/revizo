import { useEffect, useState } from "react";
import { DashboardLayout } from "@layouts/DashboardLayout/DashboardLayout";
import { useAuth } from "@context/useAuth";
import { getProfile, updateProfile, uploadAvatar } from "@services/supabase/profile";
import type { Profile } from "@/types/database";
import { Input, Button } from "@components/ui";
import styles from "./Profile.module.scss";

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            getProfile(user.id).then(data => {
                setProfile(data);
                setAvatarPreview(data?.avatar_url || null);
            });
        }
    }, [user]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user || !profile) return;

        setLoading(true);
        setMessage("");

        try {
            // 👇 passiamo il vecchio avatar
            const avatarUrl = await uploadAvatar(
                user.id,
                avatarFile,
                profile.avatar_url || undefined
            );

            await updateProfile(user.id, {
                name: profile.name || "",
                avatar_url: avatarUrl
            });

            setProfile({ ...profile, avatar_url: avatarUrl });
            setAvatarPreview(avatarUrl);
            setMessage("Profilo aggiornato con successo! ✅");
        } catch (err) {
            console.error(err);
            setMessage("Errore durante l'aggiornamento del profilo.");
        } finally {
            setLoading(false);
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    }

    if (!user) return null;

    return (
        <DashboardLayout>
            <div className={styles.profile}>
                <h1>Il tuo profilo</h1>

                <form onSubmit={handleSubmit}>
                    <div className={styles.avatarSection}>
                        <img
                            src={avatarPreview || "/default-avatar.svg"}
                            alt="Foto profilo"
                            className={styles.avatar}
                        />
                        <label htmlFor="avatarUpload" className={styles.uploadLabel}>
                            Cambia foto
                            <input
                                id="avatarUpload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                hidden
                            />
                        </label>
                    </div>

                    <Input
                        label="Nome"
                        type="text"
                        value={profile?.name || ""}
                        onChange={e => setProfile({ ...profile!, name: e.target.value })}
                    />

                    <Input label="Email" type="email" value={user.email ?? ""} disabled />

                    <Button
                        label={loading ? "Salvataggio..." : "Salva modifiche"}
                        variant="primary"
                        fullWidth
                        disabled={loading}
                    />

                    {message && <p className={styles.message}>{message}</p>}
                </form>
            </div>
        </DashboardLayout>
    );
}
