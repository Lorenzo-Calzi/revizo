import Text from "@/components/ui/Text/Text";
import styles from "./Account.module.scss";

export default function Customization() {
    return (
        <section className={styles.container} aria-labelledby="page-title">
            <Text variant="body">Tema, font, logo e colori del mini-sito</Text>
        </section>
    );
}
