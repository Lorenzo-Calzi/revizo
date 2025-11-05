import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.scss";

const links = [
    { to: "/dashboard", label: "Panoramica", icon: "🏠" },
    { to: "/dashboard/profile", label: "Profilo", icon: "👤" },
    { to: "/dashboard/reviews", label: "Recensioni", icon: "💬" },
    { to: "/dashboard/analytics", label: "Analytics", icon: "📈" },
    { to: "/dashboard/settings", label: "Impostazioni", icon: "⚙️" }
];

export default function Sidebar() {
    return (
        <nav className={styles.sidebar} aria-label="Menu dashboard">
            <ul>
                {links.map(l => (
                    <li key={l.to}>
                        <NavLink
                            to={l.to}
                            className={({ isActive }) => (isActive ? styles.active : undefined)}
                        >
                            <span aria-hidden>{l.icon}</span>
                            <span>{l.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
