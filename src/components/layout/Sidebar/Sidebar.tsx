import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.scss";

export const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Chiudi la sidebar premendo ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Chiudi la sidebar cliccando fuori
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <>
            {/* Bottone mobile per aprire/chiudere */}
            <button
                className={styles.hamburger}
                aria-label={isOpen ? "Chiudi menu" : "Apri menu"}
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span />
                <span />
                <span />
            </button>

            {/* Overlay accessibile */}
            {isOpen && <div className={styles.overlay} aria-hidden="true" />}

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
                aria-label="Menu principale"
            >
                <div className={styles.logo}>Revizo</div>

                <nav className={styles.nav}>
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `${styles.link} ${isActive ? styles.active : ""}`
                        }
                        onClick={() => setIsOpen(false)}
                    >
                        Panoramica
                    </NavLink>

                    <NavLink
                        to="/dashboard/feedback"
                        className={({ isActive }) =>
                            `${styles.link} ${isActive ? styles.active : ""}`
                        }
                        onClick={() => setIsOpen(false)}
                    >
                        Feedback
                    </NavLink>

                    <NavLink
                        to="/dashboard/settings"
                        className={({ isActive }) =>
                            `${styles.link} ${isActive ? styles.active : ""}`
                        }
                        onClick={() => setIsOpen(false)}
                    >
                        Impostazioni
                    </NavLink>
                </nav>
            </aside>
        </>
    );
};
