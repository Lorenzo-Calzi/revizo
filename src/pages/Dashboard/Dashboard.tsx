import { DashboardLayout } from "@layouts/DashboardLayout/DashboardLayout";
import { Card } from "@components/ui";
import styles from "./Dashboard.module.scss";

export default function Dashboard() {
    return (
        <DashboardLayout>
            <header className={styles.header}>
                <h1>Panoramica</h1>
                <p>Benvenuto su Revizo 👋</p>
            </header>

            <section className={styles.cards}>
                <Card title="Recensioni Totali">128</Card>
                <Card title="Punteggio Medio">4.7 ★</Card>
                <Card title="Ultime Recensioni">
                    <ul className={styles.list}>
                        <li>⭐️⭐️⭐️⭐️⭐️ Ottimo servizio!</li>
                        <li>⭐️⭐️⭐️⭐️ Tutto perfetto.</li>
                        <li>⭐️⭐️⭐️ Esperienza da migliorare.</li>
                    </ul>
                </Card>
            </section>
        </DashboardLayout>
    );
}
