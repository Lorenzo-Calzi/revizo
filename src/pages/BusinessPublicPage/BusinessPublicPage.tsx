import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { getBusinessBySlug } from "@services/supabase/businesses";
import { getBusinessCategories, getBusinessItemsByCategory } from "@services/supabase/catalog";

import type { Business, BusinessCategory, BusinessItem } from "@/types/database";
import { ALLERGENS } from "@/constants/allergens";

import Text from "@components/ui/Text/Text";
import styles from "./BusinessPublicPage.module.scss";

type BusinessWithExtras = Business & {
    address?: string | null;
    cover_image?: string | null;
    image?: string | null;
};

type SectionsRef = Record<string, HTMLElement | null>;

export default function BusinessPublicPage() {
    const { slug } = useParams<{ slug: string }>();

    const [business, setBusiness] = useState<BusinessWithExtras | null>(null);
    const [categories, setCategories] = useState<BusinessCategory[]>([]);
    const [items, setItems] = useState<Record<string, BusinessItem[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<BusinessItem | null>(null);

    const sectionsRef = useRef<SectionsRef>({});

    // Chiudi la modale con ESC
    useEffect(() => {
        if (!selectedItem) return;

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedItem(null);
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [selectedItem]);

    // Carica business + catalogo
    useEffect(() => {
        async function load() {
            if (!slug) {
                setError("Locale non trovato.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const foundBusiness = await getBusinessBySlug(slug);
                if (!foundBusiness) {
                    setError("Locale non trovato.");
                    setLoading(false);
                    return;
                }

                const fullBusiness: BusinessWithExtras = foundBusiness as BusinessWithExtras;
                setBusiness(fullBusiness);

                const cats = await getBusinessCategories(foundBusiness.id);
                setCategories(cats);

                const itemsMap: Record<string, BusinessItem[]> = {};
                for (const c of cats) {
                    itemsMap[c.id] = await getBusinessItemsByCategory(c.id);
                }
                setItems(itemsMap);

                if (cats.length > 0) {
                    setActiveCategoryId(cats[0].id);
                }
            } catch (e) {
                console.error("Errore caricamento pagina pubblica:", e);
                setError("Si è verificato un errore durante il caricamento del menu.");
            } finally {
                setLoading(false);
            }
        }

        void load();
    }, [slug]);

    function handleClickCategory(categoryId: string) {
        setActiveCategoryId(categoryId);
        const section = sectionsRef.current[categoryId];
        if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>
                    <Text variant="body">Caricamento del menu…</Text>
                </div>
            </div>
        );
    }

    if (error || !business) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>
                    <Text variant="body">{error ?? "Locale non trovato."}</Text>
                </div>
            </div>
        );
    }

    const address = business.address ?? business.city ?? "";
    const coverImage = business.cover_image ?? business.image ?? null;

    return (
        <div className={styles.page}>
            {/* HERO */}
            <header className={styles.hero}>
                {coverImage && (
                    <div
                        className={styles.heroCover}
                        style={{ backgroundImage: `url(${coverImage})` }}
                        aria-hidden="true"
                    />
                )}

                <div className={styles.heroInfo}>
                    <Text as="h1" variant="title-lg" className={styles.heroName}>
                        {business.name}
                    </Text>
                    {address && (
                        <Text variant="body" colorVariant="muted" className={styles.heroAddress}>
                            {address}
                        </Text>
                    )}
                </div>
            </header>

            {/* NAV CATEGORIE */}
            {categories.length > 0 && (
                <nav className={styles.categoryNav} aria-label="Categorie del menu">
                    <ul className={styles.categoryNavList}>
                        <li>
                            <button
                                className={
                                    activeCategoryId === "all"
                                        ? `${styles.categoryNavItem} ${styles.categoryNavItemActive}`
                                        : styles.categoryNavItem
                                }
                                onClick={() => {
                                    setActiveCategoryId("all");
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                            >
                                Tutti
                            </button>
                        </li>
                        {categories.map(cat => (
                            <li key={cat.id} className={styles.categoryNavListItem}>
                                <button
                                    type="button"
                                    className={
                                        activeCategoryId === cat.id
                                            ? `${styles.categoryNavItem} ${styles.categoryNavItemActive}`
                                            : styles.categoryNavItem
                                    }
                                    onClick={() => handleClickCategory(cat.id)}
                                >
                                    {cat.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}

            {/* CONTENUTO */}
            <main className={styles.content}>
                {categories.length === 0 ? (
                    <Text variant="body" colorVariant="muted">
                        Nessuna categoria disponibile.
                    </Text>
                ) : activeCategoryId === "all" ? (
                    categories.map(cat => (
                        <section
                            key={cat.id}
                            ref={el => (sectionsRef.current[cat.id] = el)}
                            className={styles.categorySection}
                            aria-label={cat.name}
                        >
                            <Text as="h2" variant="title-md" className={styles.categoryTitle}>
                                {cat.name}
                            </Text>

                            {items[cat.id]?.length ? (
                                <div className={styles.itemsGrid}>
                                    {items[cat.id].map(item => (
                                        <article
                                            key={item.id}
                                            className={styles.itemCard}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setSelectedItem(item)}
                                            onKeyDown={event => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    setSelectedItem(item);
                                                }
                                            }}
                                        >
                                            <div className={styles.itemInfo}>
                                                <Text
                                                    as="h3"
                                                    variant="body"
                                                    className={styles.itemName}
                                                >
                                                    {item.name}
                                                </Text>

                                                {item.description && (
                                                    <Text
                                                        variant="body"
                                                        colorVariant="muted"
                                                        className={styles.itemDescription}
                                                    >
                                                        {item.description}
                                                    </Text>
                                                )}

                                                {item.price != null && (
                                                    <Text
                                                        variant="body"
                                                        className={styles.itemPrice}
                                                    >
                                                        € {item.price.toFixed(2)}
                                                    </Text>
                                                )}
                                            </div>

                                            {item.image && (
                                                <div className={styles.itemImageWrap}>
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className={styles.itemImage}
                                                    />
                                                </div>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <Text
                                    variant="body"
                                    colorVariant="muted"
                                    className={styles.emptyCategory}
                                >
                                    Nessun elemento in questa categoria.
                                </Text>
                            )}
                        </section>
                    ))
                ) : (
                    categories
                        .filter(c => c.id === activeCategoryId)
                        .map(cat => (
                            <section
                                key={cat.id}
                                ref={el => (sectionsRef.current[cat.id] = el)}
                                className={styles.categorySection}
                                aria-label={cat.name}
                            >
                                <Text as="h2" variant="title-md" className={styles.categoryTitle}>
                                    {cat.name}
                                </Text>

                                {items[cat.id]?.length ? (
                                    <div className={styles.itemsGrid}>
                                        {items[cat.id].map(item => (
                                            <article
                                                key={item.id}
                                                className={styles.itemCard}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setSelectedItem(item)}
                                                onKeyDown={event => {
                                                    if (
                                                        event.key === "Enter" ||
                                                        event.key === " "
                                                    ) {
                                                        event.preventDefault();
                                                        setSelectedItem(item);
                                                    }
                                                }}
                                            >
                                                <div className={styles.itemInfo}>
                                                    <Text
                                                        as="h3"
                                                        variant="body"
                                                        className={styles.itemName}
                                                    >
                                                        {item.name}
                                                    </Text>

                                                    {item.description && (
                                                        <Text
                                                            variant="body"
                                                            colorVariant="muted"
                                                            className={styles.itemDescription}
                                                        >
                                                            {item.description}
                                                        </Text>
                                                    )}

                                                    {item.price != null && (
                                                        <Text
                                                            variant="body"
                                                            className={styles.itemPrice}
                                                        >
                                                            € {item.price.toFixed(2)}
                                                        </Text>
                                                    )}
                                                </div>

                                                {item.image && (
                                                    <div className={styles.itemImageWrap}>
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className={styles.itemImage}
                                                        />
                                                    </div>
                                                )}
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <Text
                                        variant="body"
                                        colorVariant="muted"
                                        className={styles.emptyCategory}
                                    >
                                        Nessun elemento in questa categoria.
                                    </Text>
                                )}
                            </section>
                        ))
                )}
            </main>

            {selectedItem && (
                <ItemModal
                    business={business}
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    );
}

type ItemModalProps = {
    business: BusinessWithExtras;
    item: BusinessItem;
    onClose: () => void;
};

function ItemModal({ business, item, onClose }: ItemModalProps) {
    const allergenDetails = ALLERGENS.filter(a => item.allergens?.includes(a.id));

    const address = business.address ?? business.city ?? "";

    return (
        <div
            className={styles.modalOverlay}
            role="dialog"
            aria-modal="true"
            aria-label={item.name}
            onClick={onClose}
        >
            <div className={styles.modal} onClick={event => event.stopPropagation()}>
                {item.image && (
                    <div className={styles.modalImageWrap}>
                        <img src={item.image} alt={item.name} className={styles.modalImage} />
                    </div>
                )}

                <div className={styles.modalBody}>
                    <button
                        type="button"
                        className={styles.modalClose}
                        onClick={onClose}
                        aria-label="Chiudi dettaglio piatto"
                    >
                        ×
                    </button>

                    <Text as="h2" variant="title-md" className={styles.modalTitle}>
                        {item.name}
                    </Text>

                    {address && (
                        <Text
                            variant="caption"
                            colorVariant="muted"
                            className={styles.modalBusinessInfo}
                        >
                            {business.name} • {address}
                        </Text>
                    )}

                    {item.description && (
                        <Text variant="body" className={styles.modalDescription}>
                            {item.description}
                        </Text>
                    )}

                    {item.price != null && (
                        <Text variant="body" className={styles.modalPrice}>
                            € {item.price.toFixed(2)}
                        </Text>
                    )}

                    {allergenDetails.length > 0 && (
                        <div className={styles.modalAllergens}>
                            <Text variant="body" className={styles.modalAllergensTitle}>
                                Contiene:
                            </Text>
                            <div className={styles.modalAllergenChips}>
                                {allergenDetails.map(a => (
                                    <span key={a.id} className={styles.modalAllergenChip}>
                                        {a.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <Text variant="caption" colorVariant="muted" className={styles.modalDisclaimer}>
                        In caso di dubbi su allergeni o ingredienti, contatta direttamente il
                        locale.
                    </Text>
                </div>
            </div>
        </div>
    );
}
