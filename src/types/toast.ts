export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
    id?: string;
    message: string;
    type?: ToastType;
    duration?: number;
}

export type Toast = Required<ToastOptions>;

export interface ToastContextValue {
    showToast: (options: ToastOptions) => void;
}
