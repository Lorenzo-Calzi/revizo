import { useEffect, useState } from "react";
import BuilderToolbar from "../BuilderToolbar/BuilderToolbar";
import BuilderSidebar from "../BuilderSidebar/BuilderSidebar";
import BuilderPreviewFrame from "../BuilderPreviewFrame/BuilderPreviewFrame";
import { useToast } from "@/context/Toast/ToastContext";
import type { Business, FullCollection } from "@/types/database";
import { updateBusinessSettings } from "@services/supabase/businesses";
import type { CatalogTheme } from "@/types/theme";
import { defaultTheme } from "@/constants/catalogTheme";
import CollectionEditor from "../CollectionEditor/CollectionEditor";
import Text from "@/components/ui/Text/Text";
import styles from "./BuilderLayout.module.scss";
import Catalog from "@/components/CatalogBuilder/Catalog/Catalog";
import { getFullCollection } from "@/services/supabase/collections";

interface BuilderLayoutProps {
    business: Business;
    initialTheme: CatalogTheme | null;
}

interface PreviewItem {
    id: string;
    name: string;
    description?: string;
    price?: number;
    image?: string;
}

interface PreviewCategory {
    id: string;
    name: string;
    items: PreviewItem[];
}

interface PreviewData {
    id: string;
    name: string;
    categories: PreviewCategory[];
}

type ContentMode = "collections" | "catalog";

export default function BuilderLayout({ business, initialTheme }: BuilderLayoutProps) {
    const [mode, setMode] = useState<"mobile" | "tablet" | "desktop">("mobile");
    const [tab, setTab] = useState<"content" | "style">("content");
    const [contentMode, setContentMode] = useState<ContentMode>("catalog");

    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const { showToast } = useToast();
    const [theme, setTheme] = useState<CatalogTheme>(initialTheme ?? defaultTheme);
    const [lastSavedTheme, setLastSavedTheme] = useState<CatalogTheme>(
        initialTheme ?? defaultTheme
    );
    const [selectedCollection, setSelectedCollection] = useState<FullCollection | null>(null);
    const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);

    // sincronizza tema iniziale
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

    // rileva modifiche non salvate
    useEffect(() => {
        const hasChanges = JSON.stringify(theme) !== JSON.stringify(lastSavedTheme);
        setIsDirty(hasChanges);
    }, [theme, lastSavedTheme]);

    // aggiorna la preview quando cambia il menu attivo
    useEffect(() => {
        if (!activeCollectionId || !selectedCollection) return;

        if (selectedCollection.collection.id === activeCollectionId) {
            // previewData è aggiornata direttamente da CollectionEditor
            setPreviewData(prev => prev);
        }
    }, [activeCollectionId, selectedCollection]);

    // warning se ci sono modifiche non salvate
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

    useEffect(() => {
        setIsDirty(true);
    }, [activeCollectionId]);

    // Imposta la collection attiva quando carico l'editor
    useEffect(() => {
        if (business?.active_collection_id) {
            setActiveCollectionId(business.active_collection_id);
        } else {
            setActiveCollectionId(null);
        }
    }, [business?.active_collection_id]);

    useEffect(() => {
        async function init() {
            // 1. Abbiamo già un menu attivo salvato nel business
            if (activeCollectionId) {
                const full = await getFullCollection(activeCollectionId);
                setSelectedCollection(full);
                return;
            }

            // 2. Non c’è un menu attivo → usiamo il primo della sidebar (selezionato automaticamente)
            if (selectedCollection === null && business.id) {
                // la sidebar seleziona già il primo menu via handleSelect → dobbiamo solo aspettare
                // qui NON facciamo altro, perché handleSelect verrà chiamato dalla sidebar
            }
        }

        init();
    }, [activeCollectionId, business.id]);

    async function handleSave() {
        if (saving) return;

        try {
            setSaving(true);

            await updateBusinessSettings(business.id, {
                theme,
                activeCollectionId
            });

            setLastSavedTheme(theme);
            setIsDirty(false);

            showToast({
                message: "Modifiche salvate con successo!",
                type: "success",
                duration: 2500
            });
        } catch (err) {
            console.error(err);
            showToast({
                message: "Errore durante il salvataggio.",
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
                tab={tab}
                setMode={setMode}
                onSave={handleSave}
                saving={saving}
                isDirty={isDirty}
            />

            <div className={styles.main}>
                <BuilderSidebar
                    businessId={business.id}
                    theme={theme}
                    setTheme={setTheme}
                    tab={tab}
                    setTab={setTab}
                    onCollectionSelect={setSelectedCollection}
                    contentMode={contentMode}
                    setContentMode={setContentMode}
                    activeCollectionId={activeCollectionId}
                    setActiveCollectionId={setActiveCollectionId}
                />

                {/* PREVIEW STILE */}
                {tab === "style" && (
                    <BuilderPreviewFrame
                        mode={mode}
                        business={business}
                        preview={previewData}
                        theme={theme}
                    />
                )}

                {/* CONTENUTO: 2 modalità */}
                {tab === "content" && contentMode === "catalog" && (
                    <div className={styles.catalogPanelWrapper}>
                        <Catalog business={business} />
                    </div>
                )}

                {tab === "content" && contentMode === "collections" && (
                    <>
                        {selectedCollection ? (
                            <CollectionEditor
                                data={selectedCollection}
                                onPreviewUpdate={data => {
                                    if (selectedCollection?.collection.id === activeCollectionId) {
                                        setPreviewData(data);
                                    }
                                }}
                            />
                        ) : (
                            <div style={{ padding: "1rem" }}>
                                <Text>Seleziona un gruppo di contenuti per iniziare.</Text>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
