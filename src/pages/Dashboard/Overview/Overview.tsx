import styles from "./Overview.module.scss";

export default function Overview() {
    return (
        <section className={styles.container} aria-labelledby="page-title">
            <header className={styles.header}>
                <h1 id="page-title">Panoramica</h1>
                <p className={styles.subtitle}>Snapshot di media, trend e volumi recenti</p>
            </header>

            <div className={styles.grid}>
                <article className={styles.card} aria-label="Media valutazioni">
                    <h2>Media valutazioni (30 giorni)</h2>
                    <div className={styles.kpi}>—</div>
                </article>

                <article className={styles.card} aria-label="Totale recensioni">
                    <h2>Totale recensioni</h2>
                    <div className={styles.kpi}>—</div>
                </article>

                <article className={styles.card} aria-label="Trend settimanale">
                    <h2>Trend settimanale</h2>
                    <div className={styles.placeholder}>Grafico in arrivo</div>
                </article>
            </div>
        </section>
    );
}
