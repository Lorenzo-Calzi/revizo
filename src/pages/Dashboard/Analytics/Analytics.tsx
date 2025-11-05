import styles from "./Analytics.module.scss";

export default function Analytics() {
    return (
        <section className={styles.container} aria-labelledby="page-title">
            <h1 id="page-title">Analytics</h1>
            <p className={styles.subtitle}>Analisi avanzate, distribuzioni e confronti</p>
            <div className={styles.placeholder}>Grafici e tabelle in arrivo</div>
        </section>
    );
}
