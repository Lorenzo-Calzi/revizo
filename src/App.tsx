import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@layouts/MainLayout/MainLayout";
import { ProtectedRoute } from "@components/ProtectedRoute";

// Auth pages
import Login from "./pages/Auth/Login";
import VerifyOtp from "./pages/Auth/VerifyOtp";
import SignUp from "./pages/Auth/SignUp";
import ResetPassword from "./pages/Auth/ResetPassword";
import UpdatePassword from "./pages/Auth/UpdatePassword";

// Dashboard pages
import Overview from "@pages/Dashboard/Overview/Overview";
import Businesses from "./pages/Dashboard/Businesses/Businesses";
import Reviews from "@pages/Dashboard/Reviews/Reviews";
import Analytics from "@pages/Dashboard/Analytics/Analytics";
import Settings from "@/pages/Dashboard/Settings/Settings";

// Catalog Editor
import CatalogEditorPage from "./pages/CatalogEditorPage/CatalogEditorPage";

// Public pages
import PublicCatalogPage from "./pages/PublicCatalog/PublicCatalogPage";
import Home from "./pages/Home/Home";

export default function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/business/:slug" element={<PublicCatalogPage />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />

            {/* Catalog editor (protected but outside dashboard nav) */}
            <Route path="/dashboard/business/:businessId/editor" element={<CatalogEditorPage />} />

            {/* Private dashboard area */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Overview />} />

                <Route path="businesses" element={<Businesses />} />

                <Route path="reviews" element={<Reviews />} />

                <Route path="analytics" element={<Analytics />} />

                <Route path="settings" element={<Settings />} />
            </Route>

            {/* Redirect for legacy route */}
            <Route
                path="/dashboard/businesses/:id"
                element={<Navigate to="/dashboard/reviews" replace />}
            />

            {/* Global 404 → dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
