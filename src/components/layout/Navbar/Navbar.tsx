import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.scss";

export const Navbar = () => {
    return (
        <header className={styles.navbar}>
            <div className={styles.inner}>
                <div className={styles.logo}>Revizo</div>

                <nav className={styles.nav}>
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `${styles.link} ${isActive ? styles.active : ""}`
                        }
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `${styles.link} ${isActive ? styles.active : ""}`
                        }
                    >
                        Dashboard
                    </NavLink>
                </nav>
            </div>
        </header>
    );
};
