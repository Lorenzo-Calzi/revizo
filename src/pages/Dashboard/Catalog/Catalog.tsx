import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getBusinessById } from "@services/supabase/businesses";
import Text from "@components/ui/Text/Text";

import RestaurantCatalog from "./RestaurantCatalog";

import type { Business } from "@/types/database";

export default function Catalog() {
    const [searchParams] = useSearchParams();
    const businessId = searchParams.get("businessId");

    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!businessId) return;

            setLoading(true);
            const b = await getBusinessById(businessId);
            setBusiness(b);
            setLoading(false);
        }
        void load();
    }, [businessId]);

    if (loading) {
        return <Text variant="body">Caricamento…</Text>;
    }

    if (!business) {
        return (
            <Text variant="body" colorVariant="warning">
                Business non trovato.
            </Text>
        );
    }

    switch (business.type) {
        case "restaurant":
            return <RestaurantCatalog />;

        default:
            return (
                <Text variant="body">
                    Tipo di business non ancora supportato in questa sezione.
                </Text>
            );
    }
}
