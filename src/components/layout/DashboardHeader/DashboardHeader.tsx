import { useState, useEffect } from "react";
import styles from "./DashboardHeader.module.scss";

interface DashboardHeaderProps {
    userName?: string;
    onLogout?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName, onLogout }) => {
    const [darkMode, setDarkMode] = useState(false);

    // Persistenza tema
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <h2>{userName}</h2>
            </div>

            <div className={styles.right}>
                <button
                    className={styles.themeToggle}
                    aria-label={darkMode ? "Attiva tema chiaro" : "Attiva tema scuro"}
                    onClick={() => setDarkMode(!darkMode)}
                >
                    {darkMode ? "🌙" : "☀️"}
                </button>

                <button className={styles.logout} onClick={onLogout} aria-label="Esci dall'account">
                    Logout
                </button>
            </div>
        </header>
    );
};
