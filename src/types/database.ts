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
    restaurant_id: string | null;
    rating: number;
    comment: string;
    source: string;
    created_at: string;
    updated_at: string;
    response?: string | null;
    response_date?: string | null;
    tags?: string[];
}

export interface Restaurant {
    id: string;
    user_id: string;
    name: string;
    city?: string;
    slug: string;
    created_at: string;
}
