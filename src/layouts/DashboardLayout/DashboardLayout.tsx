import React from "react";
import { Sidebar } from "@components/layout/Sidebar/Sidebar";
import { DashboardHeader } from "@components/layout/DashboardHeader/DashboardHeader";
import styles from "./DashboardLayout.module.scss";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const handleLogout = () => {
        alert("Logout eseguito (placeholder)");
    };

    return (
        <div className={styles.dashboard}>
            <Sidebar />
            <div className={styles.content}>
                <DashboardHeader userName="Mario Rossi" onLogout={handleLogout} />
                <div className={styles.main}>{children}</div>
            </div>
        </div>
    );
};
