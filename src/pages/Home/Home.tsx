import { MainLayout } from "@layouts/MainLayout/MainLayout";
import { Button, Card } from "@components/ui";
import styles from "./Home.module.scss";

export default function Home() {
    return (
        <MainLayout>
            <section className={styles.hero}>
                <div className={styles.content}>
                    <h1>Più recensioni, più clienti, meno stress.</h1>
                    <p>
                        Revizo aiuta attività e professionisti a raccogliere feedback reali e a
                        migliorare la propria reputazione online.
                    </p>
                    <Button label="Provalo ora" variant="primary" />
                </div>
            </section>

            <section className={styles.features}>
                <Card title="Automatizza le recensioni">
                    Raccogli e pubblica feedback positivi in modo automatico.
                </Card>
                <Card title="Gestisci i feedback">
                    Ricevi subito alert sui commenti negativi e migliora il servizio.
                </Card>
                <Card title="Analizza e cresci">
                    Scopri i trend e trasforma i dati in opportunità.
                </Card>
            </section>
        </MainLayout>
    );
}
