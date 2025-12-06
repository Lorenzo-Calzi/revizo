import { useEffect, useState } from "react";
import BuilderToolbar from "../BuilderToolbar/BuilderToolbar";
import BuilderSidebar from "../BuilderSidebar/BuilderSidebar";
import BuilderPreviewFrame from "../BuilderPreviewFrame/BuilderPreviewFrame";
import { useToast } from "@/context/Toast/ToastContext";
import type { Business, BusinessCategory, BusinessItem } from "@/types/database";
import { updateBusinessTheme } from "@services/supabase/businesses";
import type { CatalogTheme } from "@/types/theme";
import { defaultTheme } from "@/constants/catalogTheme";
import styles from "./BuilderLayout.module.scss";

type ItemsByCategory = Record<string, BusinessItem[]>;

interface BuilderLayoutProps {
    business: Business;
    categories: BusinessCategory[];
    items: ItemsByCategory;
    initialTheme: CatalogTheme | null;
}

export default function BuilderLayout({
    business,
    categories,
    items,
    initialTheme
}: BuilderLayoutProps) {
    const [mode, setMode] = useState<"mobile" | "tablet" | "desktop">("mobile");
    const [tab, setTab] = useState<"content" | "style" | "catalog">("content");
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const { showToast } = useToast();
    const [theme, setTheme] = useState<CatalogTheme>(initialTheme ?? defaultTheme);
    const [lastSavedTheme, setLastSavedTheme] = useState<CatalogTheme>(
        initialTheme ?? defaultTheme
    );

    useEffect(() => {
        if (initialTheme) {
            setTheme(initialTheme);
            setLastSavedTheme(initialTheme);
            setIsDirty(false);
        } else {
            setTheme(defaultTheme);
            setLastSavedTheme(defaultTheme);
            setIsDirty(false);
        }
    }, [initialTheme]);

    useEffect(() => {
        const hasChanges = JSON.stringify(theme) !== JSON.stringify(lastSavedTheme);
        setIsDirty(hasChanges);
    }, [theme, lastSavedTheme]);

    useEffect(() => {
        if (!isDirty) return;

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isDirty]);

    async function handleSave() {
        if (saving) return; // evita doppi click

        try {
            setSaving(true);
            await updateBusinessTheme(business.id, theme);

            // aggiorniamo lo snapshot dell'ultimo stato salvato
            setLastSavedTheme(theme);
            setIsDirty(false);

            showToast({
                message: "Stile salvato con successo!",
                type: "success",
                duration: 2500
            });
        } catch (err) {
            console.error(err);
            showToast({
                message: "Errore durante il salvataggio dello stile.",
                type: "error"
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={styles.builder}>
            <BuilderToolbar
                mode={mode}
                setMode={setMode}
                onSave={handleSave}
                saving={saving}
                isDirty={isDirty}
            />

            <div className={styles.main}>
                <BuilderSidebar theme={theme} setTheme={setTheme} tab={tab} setTab={setTab} />

                <BuilderPreviewFrame
                    mode={mode}
                    business={business}
                    categories={categories}
                    items={items}
                    theme={theme}
                />
            </div>
        </div>
    );
}
