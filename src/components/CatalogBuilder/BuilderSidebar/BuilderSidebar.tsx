import type { CatalogTheme } from "@/types/theme";
import styles from "./BuilderSidebar.module.scss";

interface BuilderSidebarProps {
    theme: CatalogTheme;
    setTheme: React.Dispatch<React.SetStateAction<CatalogTheme>>;
    tab: "content" | "style" | "catalog";
    setTab: (t: "content" | "style" | "catalog") => void;
}

export default function BuilderSidebar({ theme, setTheme, tab, setTab }: BuilderSidebarProps) {
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
            <div className={styles.tabs}>
                <button
                    className={tab === "content" ? styles.active : ""}
                    onClick={() => setTab("content")}
                >
                    Contenuto
                </button>

                <button
                    className={tab === "style" ? styles.active : ""}
                    onClick={() => setTab("style")}
                >
                    Stile
                </button>
            </div>

            <div className={styles.panel}>
                {tab === "content" && <p>Impostazioni contenuto…</p>}
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

                            {/* 1. TEMPLATE */}
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

                            {/* 2. BACKGROUND COLOR */}
                            <div className={styles.field}>
                                <label className={styles.label}>Colore di sfondo</label>
                                <input
                                    type="color"
                                    value={theme.cardBgColor}
                                    onChange={e => handleCardChangeBgColor(e.target.value)}
                                    className={styles.colorInput}
                                />
                            </div>

                            {/* 3. TEXT COLOR */}
                            <div className={styles.field}>
                                <label className={styles.label}>Colore testi</label>
                                <input
                                    type="color"
                                    value={theme.cardTextColor}
                                    onChange={e => handleCardChangeTextColor(e.target.value)}
                                    className={styles.colorInput}
                                />
                            </div>

                            {/* 4. BORDER RADIUS */}
                            <div className={styles.field}>
                                <label className={styles.label}>Bordo (radius)</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={40}
                                    value={theme.cardRadius}
                                    onChange={e => handleCardChangeRadius(Number(e.target.value))}
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Bordo item (radius)</label>
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
