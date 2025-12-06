import { useRef, useState, useEffect } from "react";
import { CatalogThemeProvider } from "@context/CatalogThemeContext/CatalogThemeProvider";
import PublicCatalogNavbar from "./PublicCatalogNavbar";
import PublicCatalogSection from "./PublicCatalogSection";
import PublicItemModal from "./PublicItemModal";
import Text from "../ui/Text/Text";
import type { Business, BusinessCategory, BusinessItem } from "@/types/database";
import type { CatalogTheme } from "@/types/theme";
import styles from "./PublicCatalog.module.scss";

type ItemsByCategory = Record<string, BusinessItem[]>;

type PublicCatalogProps = {
    business: Business;
    categories: BusinessCategory[];
    items: ItemsByCategory;
    theme: CatalogTheme;
};

export default function PublicCatalog({ business, categories, items, theme }: PublicCatalogProps) {
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [selectedItem, setSelectedItem] = useState<BusinessItem | null>(null);
    const headerRef = useRef<HTMLDivElement | null>(null);
    const navbarRef = useRef<HTMLDivElement | null>(null);

    // categoria attiva nella navbar
    const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id ?? "");

    const getOffset = () => {
        const headerH = headerRef.current?.offsetHeight ?? 0;
        const navbarH = navbarRef.current?.offsetHeight ?? 0;
        return headerH + navbarH + 16; // +16px per margine "aria"
    };

    // scroll smooth verso la sezione giusta
    const scrollToCategory = (catId: string) => {
        const target = sectionRefs.current[catId];
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const offset = window.scrollY + rect.top - getOffset();

        setActiveCategory(catId);
        window.scrollTo({ top: offset, behavior: "smooth" });
    };

    // aggiorna la categoria attiva mentre l'utente scrolla
    useEffect(() => {
        const handleScroll = () => {
            const offset = getOffset();
            const scrollY = window.scrollY;

            let currentId = categories[0]?.id ?? "";

            for (const cat of categories) {
                const el = sectionRefs.current[cat.id];
                if (!el) continue;

                const top = el.offsetTop - offset;
                if (scrollY >= top) {
                    currentId = cat.id;
                }
            }

            setActiveCategory(currentId);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // sync initial

        return () => window.removeEventListener("scroll", handleScroll);
    }, [categories]);

    return (
        <CatalogThemeProvider theme={theme}>
            <div className={styles.page}>
                {/* HEADER */}
                <header
                    ref={headerRef}
                    className={styles.header}
                    style={{ backgroundColor: theme.headerBackground }}
                >
                    <div className={styles.headerInner}>
                        <div
                            className={styles.headerImageWrap}
                            style={{ borderRadius: theme.heroRadius }}
                        >
                            {business.cover_image ? (
                                <img
                                    src={business.cover_image}
                                    alt={`Cover di ${business.name}`}
                                    className={styles.headerImage}
                                    loading="lazy"
                                />
                            ) : (
                                <div className={styles.headerImagePlaceholder}>
                                    <span>{business.name}</span>
                                </div>
                            )}
                        </div>

                        <Text variant="display" align="center" className={styles.headerTitle}>
                            {business.name}
                        </Text>
                    </div>
                </header>

                {/* NAVBAR */}
                <div ref={navbarRef} className={styles.navbar}>
                    <PublicCatalogNavbar
                        categories={categories}
                        activeCategory={activeCategory}
                        onSelectCategory={scrollToCategory}
                    />
                </div>

                {/* CONTENT */}
                <main className={styles.content}>
                    {categories.map(cat => (
                        <div
                            key={cat.id}
                            ref={el => {
                                sectionRefs.current[cat.id] = el;
                            }}
                            className={styles.section}
                        >
                            <PublicCatalogSection
                                category={cat}
                                items={items[cat.id] ?? []}
                                businessType={business.type}
                                onSelectItem={setSelectedItem}
                            />
                        </div>
                    ))}
                </main>

                <PublicItemModal
                    item={selectedItem}
                    businessType={business.type}
                    onClose={() => setSelectedItem(null)}
                />
            </div>
        </CatalogThemeProvider>
    );
}
