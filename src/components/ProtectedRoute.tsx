import { Navigate } from "react-router-dom";
import { useAuth } from "@context/useAuth";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading } = useAuth();

    if (loading) return <p>Caricamento...</p>;
    if (!user) return <Navigate to="/login" replace />;

    return children;
};
