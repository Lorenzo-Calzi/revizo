import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Text from "@/components/ui/Text/Text";
import PublicCollectionView from "@/components/PublicCollectionView/PublicCollectionView";

import { getBusinessBySlug } from "@/services/supabase/businesses";
import { getPublicCollectionById } from "@/services/supabase/collections";

import type { PublicCollection } from "@/types/collectionPublic";
import { Business } from "@/types/database";

type PageState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | {
          status: "ready";
          business: Business;
          collection: PublicCollection;
      };

export default function PublicCollectionPage() {
    const { slug } = useParams<{ slug: string }>();
    const [state, setState] = useState<PageState>({ status: "loading" });

    useEffect(() => {
        if (!slug) {
            setState({
                status: "error",
                message: "Link non valido."
            });
            return;
        }
        const businessSlug = slug;

        let cancelled = false;

        async function load() {
            try {
                setState({ status: "loading" });

                // 1) recupero business
                const business = await getBusinessBySlug(businessSlug);

                if (!business) {
                    throw new Error("Attività non trovata.");
                }

                if (!business.active_collection_id) {
                    throw new Error("Nessuna collection attiva.");
                }

                // 2) recupero collection pubblica
                const publicCollection = await getPublicCollectionById(
                    business.active_collection_id,
                    business.id
                );

                if (cancelled) return;

                setState({
                    status: "ready",
                    business,
                    collection: publicCollection
                });
            } catch (err) {
                if (cancelled) return;

                setState({
                    status: "error",
                    message: err instanceof Error ? err.message : "Errore di caricamento."
                });
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [slug]);

    /* ============================
       RENDER
    ============================ */

    if (state.status === "loading") {
        return (
            <main>
                <Text variant="body">Caricamento…</Text>
            </main>
        );
    }

    if (state.status === "error") {
        return (
            <main>
                <Text variant="body" colorVariant="warning">
                    {state.message}
                </Text>
            </main>
        );
    }

    return <PublicCollectionView business={state.business} collection={state.collection} />;
}
