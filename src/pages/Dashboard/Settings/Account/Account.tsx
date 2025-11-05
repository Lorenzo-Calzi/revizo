import styles from "./Customization.module.scss";

export default function Customization() {
    return (
        <section className={styles.container} aria-labelledby="page-title">
            <h1 id="page-title">Customizzazione</h1>
            <p className={styles.subtitle}>Tema, font, logo e colori del mini-sito</p>
        </section>
    );
}
