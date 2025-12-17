import type { CatalogTheme } from "@/types/theme";

/* ============================
   GENERIC TYPES
============================ */

export interface User {
    id: string;
    email: string;
    name: string;
    created_at: string;
}

export interface Profile {
    id: string;
    name: string | null;
    avatar_url: string | null;
    created_at: string;
}

export interface Review {
    id: string;
    user_id: string;
    business_id: string | null;
    rating: number;
    comment: string;
    source: string;
    created_at: string;
    updated_at: string;
    response?: string | null;
    response_date?: string | null;
    tags?: string[];
}

/* ============================
   BUSINESS
============================ */

export type BusinessType =
    | "restaurant"
    | "bar"
    | "hotel"
    | "hairdresser"
    | "beauty"
    | "shop"
    | "other";

export interface Business {
    id: string;
    user_id: string;
    name: string;
    city: string | null;
    address: string | null;
    slug: string;
    type: BusinessType;
    cover_image: string | null;
    theme: CatalogTheme | null;
    active_collection_id: string | null;
    active_special_collection_id: string | null;
    created_at: string;
    updated_at: string;
}

/* ============================
   ⚠️ LEGACY TYPES (DO NOT USE)
   To be removed after migration
============================ */

export interface BusinessCategory {
    id: string;
    business_id: string;
    name: string;
    order_index: number;
    visible: boolean;
    created_at: string;
}

export interface BusinessItem {
    id: string;
    category_id: string;
    name: string;
    description: string | null;
    price: number | null;
    duration: number | null;
    allergens: string[] | null;
    image: string | null;
    order_index: number;
    visible: boolean;
    created_at: string;
}

export type RawCategoryRow = {
    id: string;
    order_index: number;
    category: BusinessCategory | BusinessCategory[] | null;
};

export type RawItemRow = {
    id: string;
    order_index: number;
    category_id: string;
    item: BusinessItem | BusinessItem[] | null;
    visible: boolean | null;
};

/* ============================
   ✅ NEW DOMAIN TYPES
============================ */

export interface Item {
    id: string;
    name: string;
    description: string | null;
    base_price: number | null;
    duration: number | null;
    metadata: {
        image?: string | null;
        allergens?: string[];
    } | null;
    created_at: string;
    updated_at: string;
}

export interface Collection {
    id: string;
    name: string;
    description: string | null;
    collection_type: string;
    style: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface CollectionSection {
    id: string;
    collection_id: string;
    name: string;
    order_index: number;
}

export interface CollectionItem {
    id: string;
    collection_id: string;
    section_id: string | null;
    item_id: string;
    order_index: number;
    visible: boolean;
}

export interface BusinessCollection {
    id: string;
    business_id: string;
    collection_id: string;
    is_active: boolean;
    order_index: number;
    created_at: string;
}

export interface BusinessCollectionItemOverride {
    id: string;
    business_id: string;
    collection_id: string;
    item_id: string;
    price_override: number | null;
    visible_override: boolean | null;
    updated_at: string;
}

export interface BusinessItemOverride {
    id: string;
    business_id: string;
    item_id: string;
    price_override: number | null;
    visible_override: boolean | null;
    created_at: string;
    updated_at: string;
}

export interface CollectionItemWithItem {
    id: string;
    collection_id: string;
    section_id: string | null;
    order_index: number;
    visible: boolean;
    item: Item;
}

export interface OverrideRowForUI {
    item_id: string;
    price_override: number | null;
    visible_override: boolean | null;
}
