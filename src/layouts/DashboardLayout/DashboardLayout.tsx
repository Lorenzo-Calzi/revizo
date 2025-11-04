import React, { useEffect, useState } from "react";
import { useAuth } from "@context/useAuth";
import { Sidebar } from "@components/layout/Sidebar/Sidebar";
import { DashboardHeader } from "@components/layout/DashboardHeader/DashboardHeader";
import { getProfile } from "@services/supabase/profile";
import type { Profile } from "@/types/database";
import styles from "./DashboardLayout.module.scss";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        if (user) getProfile(user.id).then(setProfile);
    }, [user]);

    const handleLogout = () => {
        alert("Logout eseguito (placeholder)");
    };

    return (
        <div className={styles.dashboard}>
            <Sidebar />
            <div className={styles.content}>
                <DashboardHeader
                    userName={profile?.name ? profile.name : ""}
                    onLogout={handleLogout}
                />
                <div className={styles.main}>{children}</div>
            </div>
        </div>
    );
};
