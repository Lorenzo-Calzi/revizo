import type { CatalogTheme } from "@/types/theme";
import EditorCollectionsPanel from "../EditorCollectionsPanel/EditorCollectionsPanel";
import type { FullCollection } from "@/types/database";
import styles from "./BuilderSidebar.module.scss";

type ContentMode = "collections" | "catalog";

interface BuilderSidebarProps {
    theme: CatalogTheme;
    setTheme: React.Dispatch<React.SetStateAction<CatalogTheme>>;
    tab: "content" | "style";
    setTab: (t: "content" | "style") => void;
    businessId: string;
    onCollectionSelect: (collectionData: FullCollection) => void;
    contentMode: ContentMode;
    setContentMode: (mode: ContentMode) => void;
    activeCollectionId: string | null;
    setActiveCollectionId: (id: string | null) => void;
}

export default function BuilderSidebar({
    theme,
    setTheme,
    tab,
    setTab,
    businessId,
    onCollectionSelect,
    contentMode,
    setContentMode,
    activeCollectionId,
    setActiveCollectionId
}: BuilderSidebarProps) {
    // HEADER
    function handleHeaderChangeBgColor(color: string) {
        setTheme(prev => ({
            ...prev,
            headerBackground: color
        }));
    }

    function handleHeroChangeRadius(radius: number) {
        setTheme(prev => ({
            ...prev,
            heroRadius: radius
        }));
    }

    // CATEGORIE
    function handleCategoryPillChangeBgColor(color: string) {
        setTheme(prev => ({
            ...prev,
            categoryPillColor: color
        }));
    }

    // CARD
    function handleCardChangeTemplate(template: "left" | "right" | "no-image") {
        setTheme(prev => ({
            ...prev,
            cardTemplate: template
        }));
    }

    function handleCardChangeBgColor(color: string) {
        setTheme(prev => ({
            ...prev,
            cardBgColor: color
        }));
    }

    function handleCardChangeTextColor(color: string) {
        setTheme(prev => ({
            ...prev,
            cardTextColor: color
        }));
    }

    function handleCardChangeRadius(radius: number) {
        setTheme(prev => ({
            ...prev,
            cardRadius: radius
        }));
    }

    function handleCardItemImageChangeRadius(radius: number) {
        setTheme(prev => ({
            ...prev,
            itemImageRadius: radius
        }));
    }

    return (
        <div className={styles.sidebar}>
            {/* TAB PRINCIPALI */}
            <div className={styles.tabs}>
                <button
                    type="button"
                    className={tab === "content" ? styles.active : ""}
                    onClick={() => setTab("content")}
                >
                    Contenuto
                </button>

                <button
                    type="button"
                    className={tab === "style" ? styles.active : ""}
                    onClick={() => setTab("style")}
                >
                    Stile
                </button>
            </div>

            <div className={styles.panel}>
                {/* CONTENUTO: sottotab Catalogo / Gruppi di contenuti */}
                {tab === "content" && (
                    <>
                        <div className={styles.subTabs} aria-label="Modalità contenuto">
                            <button
                                type="button"
                                className={`${styles.subTab} ${
                                    contentMode === "catalog" ? styles.subTabActive : ""
                                }`}
                                onClick={() => setContentMode("catalog")}
                            >
                                Catalogo
                            </button>
                            <button
                                type="button"
                                className={`${styles.subTab} ${
                                    contentMode === "collections" ? styles.subTabActive : ""
                                }`}
                                onClick={() => setContentMode("collections")}
                            >
                                Menu
                            </button>
                        </div>

                        {contentMode === "collections" && (
                            <EditorCollectionsPanel
                                businessId={businessId}
                                onSelectCollection={onCollectionSelect}
                                activeCollectionId={activeCollectionId}
                                setActiveCollectionId={setActiveCollectionId}
                            />
                        )}

                        {contentMode === "catalog" && (
                            <div className={styles.infoBox}>
                                <p>
                                    Nella vista centrale puoi creare categorie e elementi del
                                    catalogo per questa attività.
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* STILE */}
                {tab === "style" && (
                    <div className={styles.sections}>
                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Header</h3>

                            <div className={styles.field}>
                                <label className={styles.label}>Colore di sfondo</label>
                                <input
                                    type="color"
                                    value={theme.headerBackground}
                                    onChange={e => handleHeaderChangeBgColor(e.target.value)}
                                    className={styles.colorInput}
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Bordo (radius)</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={40}
                                    value={theme.heroRadius}
                                    onChange={e => handleHeroChangeRadius(Number(e.target.value))}
                                />
                            </div>
                        </section>

                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Categorie</h3>

                            <div className={styles.field}>
                                <label className={styles.label}>Colore di sfondo</label>
                                <input
                                    type="color"
                                    value={theme.categoryPillColor}
                                    onChange={e => handleCategoryPillChangeBgColor(e.target.value)}
                                    className={styles.colorInput}
                                />
                            </div>
                        </section>

                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Card prodotto</h3>

                            {/* Template */}
                            <div className={styles.field}>
                                <label className={styles.label}>Template</label>
                                <div className={styles.pillGroup}>
                                    <button
                                        type="button"
                                        className={`${styles.pill} ${
                                            theme.cardTemplate === "left" ? styles.pillActive : ""
                                        }`}
                                        onClick={() => handleCardChangeTemplate("left")}
                                    >
                                        Foto a sinistra
                                    </button>

                                    <button
                                        type="button"
                                        className={`${styles.pill} ${
                                            theme.cardTemplate === "right" ? styles.pillActive : ""
                                        }`}
                                        onClick={() => handleCardChangeTemplate("right")}
                                    >
                                        Foto a destra
                                    </button>

                                    <button
                                        type="button"
                                        className={`${styles.pill} ${
                                            theme.cardTemplate === "no-image"
                                                ? styles.pillActive
                                                : ""
                                        }`}
                                        onClick={() => handleCardChangeTemplate("no-image")}
                                    >
                                        Senza foto
                                    </button>
                                </div>
                            </div>

                            {/* Background */}
                            <div className={styles.field}>
                                <label className={styles.label}>Colore di sfondo</label>
                                <input
                                    type="color"
                                    value={theme.cardBgColor}
                                    onChange={e => handleCardChangeBgColor(e.target.value)}
                                    className={styles.colorInput}
                                />
                            </div>

                            {/* Testo */}
                            <div className={styles.field}>
                                <label className={styles.label}>Colore testi</label>
                                <input
                                    type="color"
                                    value={theme.cardTextColor}
                                    onChange={e => handleCardChangeTextColor(e.target.value)}
                                    className={styles.colorInput}
                                />
                            </div>

                            {/* Radius card */}
                            <div className={styles.field}>
                                <label className={styles.label}>Bordo card (radius)</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={40}
                                    value={theme.cardRadius}
                                    onChange={e => handleCardChangeRadius(Number(e.target.value))}
                                />
                            </div>

                            {/* Radius immagine */}
                            <div className={styles.field}>
                                <label className={styles.label}>Bordo immagine (radius)</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={40}
                                    value={theme.itemImageRadius}
                                    onChange={e =>
                                        handleCardItemImageChangeRadius(Number(e.target.value))
                                    }
                                />
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
