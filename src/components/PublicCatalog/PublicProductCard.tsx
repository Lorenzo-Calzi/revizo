import type { BusinessItem } from "@/types/database";
import { useCatalogTheme } from "@context/CatalogThemeContext/useCatalogTheme";
import Text from "../ui/Text/Text";
import styles from "./PublicCatalog.module.scss";

type Props = {
    item: BusinessItem;
    businessType: string;
    onSelect: (item: BusinessItem) => void;
};

export default function PublicProductCard({ item, businessType, onSelect }: Props) {
    const theme = useCatalogTheme();

    return (
        <div
            className={styles.card}
            style={{
                borderRadius: theme.cardRadius,
                backgroundColor: theme.cardBgColor,
                color: theme.cardTextColor,
                flexDirection: theme.cardTemplate === "right" ? "row-reverse" : "row",
                justifyContent: theme.cardTemplate === "right" ? "space-between" : "flex-start"
            }}
            role="button"
            tabIndex={0}
            aria-label={`Apri dettagli: ${item.name}`}
            onClick={() => onSelect(item)}
            onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(item);
                }
            }}
        >
            {/* FOTO */}
            {theme.cardTemplate !== "no-image" &&
                (item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className={styles.cardImage}
                        style={{ borderRadius: theme.itemImageRadius }}
                    />
                ) : (
                    <div
                        className={styles.cardImagePlaceholder}
                        style={{ borderRadius: theme.itemImageRadius }}
                    >
                        <span>No foto</span>
                    </div>
                ))}

            {/* TESTO */}
            <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                    <Text as="h3" variant="title-sm" weight={600} color={theme.cardTextColor}>
                        {item.name}
                    </Text>

                    {item.price != null && (
                        <div className={styles.cardPrice}>
                            <Text color={theme.cardTextColor} weight={700}>
                                € {item.price.toFixed(2)}
                            </Text>
                        </div>
                    )}
                </div>

                {item.description && (
                    <Text
                        variant="caption"
                        color={theme.cardTextColor}
                        weight={400}
                        className={styles.cardDescription}
                    >
                        {item.description}
                    </Text>
                )}

                {/* Extra in base al tipo di business */}
                {/* {businessType === "restaurant" && item.allergens && (
                    <div className={styles.cardExtraRow}>
                        {item.allergens.map(a => (
                            <span key={a} className={styles.cardTag}>
                                {a}
                            </span>
                        ))}
                    </div>
                )} */}

                {businessType === "bar" && item.description && (
                    <p className={styles.cardExtra}>Ingredienti: {item.description}</p>
                )}

                {businessType === "hairdresser" && item.duration && (
                    <p className={styles.cardExtra}>Durata: {item.duration} min</p>
                )}
            </div>
        </div>
    );
}
