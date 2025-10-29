import React from "react";
import { Navbar } from "@components/layout/Navbar/Navbar";
import { Footer } from "@components/layout/Footer/Footer";
import styles from "./MainLayout.module.scss";

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className={styles.layout}>
            <Navbar />
            <main className={styles.main}>{children}</main>
            <Footer />
        </div>
    );
};
