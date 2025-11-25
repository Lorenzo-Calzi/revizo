export interface Feedback {
    id: string;
    user_id: string;
    customer_name: string;
    comment: string;
    rating: number;
    created_at: string;
}

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
    created_at: string;
    updated_at: string;
}

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
