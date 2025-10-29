import styles from "./Footer.module.scss";

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p>© {new Date().getFullYear()} Revizo — Tutti i diritti riservati</p>
        </footer>
    );
};
