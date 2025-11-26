import { useRef, useState, useEffect } from "react";
import styles from "./PublicCatalog.module.scss";

import PublicCatalogNavbar from "./PublicCatalogNavbar";
import PublicCatalogSection from "./PublicCatalogSection";
import PublicItemModal from "./PublicItemModal";

import type { Business, BusinessCategory, BusinessItem } from "@/types/database";

type ItemsByCategory = Record<string, BusinessItem[]>;

type PublicCatalogProps = {
    business: Business;
    categories: BusinessCategory[];
    items: ItemsByCategory;
};

export default function PublicCatalog({ business, categories, items }: PublicCatalogProps) {
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
        <div className={styles.page}>
            {/* HEADER */}
            <header ref={headerRef} className={styles.header}>
                <div className={styles.headerInner}>
                    {/* Nessuna immagine qui perché Business non ha 'image' */}
                    <h1 className={styles.headerTitle}>{business.name}</h1>
                    <p className={styles.headerSubtitle}>{business.type}</p>
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
    );
}
