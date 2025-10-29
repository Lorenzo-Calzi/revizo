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
