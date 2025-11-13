import { Footer } from "../Footer/Footer";
import Text from "@/components/ui/Text/Text";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, User, MessageSquare, BarChart, Settings, X } from "lucide-react";
import styles from "./Sidebar.module.scss";

const links = [
    { to: "/dashboard", label: "Panoramica", icon: <LayoutDashboard /> },
    { to: "/dashboard/profile", label: "Profilo", icon: <User /> },
    { to: "/dashboard/reviews", label: "Recensioni", icon: <MessageSquare /> },
    { to: "/dashboard/analytics", label: "Analytics", icon: <BarChart /> },
    { to: "/dashboard/settings", label: "Impostazioni", icon: <Settings /> }
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
        <aside
            className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
            aria-label="Menu dashboard"
        >
            <div className={styles.logo}>
                <a href="/">
                    <Text variant="title-md" as={"h1"} colorVariant="primary" align="center">
                        Revizo
                    </Text>
                </a>

                <button className={styles.closeBtn} aria-label="Chiudi menu" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <nav>
                <ul>
                    {links.map(link => (
                        <li key={link.to}>
                            <NavLink
                                to={link.to}
                                end={link.to === "/dashboard"}
                                className={({ isActive }) => (isActive ? styles.active : undefined)}
                                onClick={onClose}
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <Footer shortDescription={true} />
        </aside>
    );
}
