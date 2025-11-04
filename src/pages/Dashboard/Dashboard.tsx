import { useEffect, useState } from "react";
import { DashboardLayout } from "@layouts/DashboardLayout/DashboardLayout";
import { Card } from "@components/ui";
import { useAuth } from "@context/useAuth";
import { getProfile } from "@services/supabase/profile";
import type { Profile } from "@/types/database";
import styles from "./Dashboard.module.scss";

export default function Dashboard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        if (user) getProfile(user.id).then(setProfile);
    }, [user]);

    return (
        <DashboardLayout>
            <header className={styles.header}>
                <p>Benvenuto nella tua dashboard personale.</p>
            </header>

            <section className={styles.cards}>
                <Card title="Il tuo ID utente">{user?.id}</Card>
                <Card title="Nome">{profile?.name || "—"}</Card>
                <Card title="Data creazione">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
                </Card>
            </section>
        </DashboardLayout>
    );
}
