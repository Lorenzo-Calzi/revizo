import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@layouts/MainLayout/MainLayout";
import { ProtectedRoute } from "@components/ProtectedRoute";

// Login pages
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import ResetPassword from "./pages/Auth/ResetPassword";
import UpdatePassword from "./pages/Auth/UpdatePassword";

// Dashboard pages
import Overview from "@pages/Dashboard/Overview/Overview";
import Profile from "@pages/Dashboard/Profile/Profile";
import Reviews from "@pages/Dashboard/Reviews/Reviews";
import Analytics from "@pages/Dashboard/Analytics/Analytics";
import Customization from "@pages/Dashboard/Settings/Customization/Customization";
import Account from "@pages/Dashboard/Settings/Account/Account";

// Public review flow
import PublicReviewPage from "@pages/PublicReview/PublicReview";
import Home from "./pages/Home/Home";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />

            {/* Public QR route */}
            <Route path="/r/:slug" element={<PublicReviewPage />} />

            {/* Private area */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Overview />} />
                <Route path="profile" element={<Profile />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings">
                    <Route index element={<Customization />} />
                    <Route path="theme" element={<Customization />} />
                    <Route path="account" element={<Account />} />
                </Route>
            </Route>

            <Route
                path="/dashboard/restaurants/:id"
                element={<Navigate to="/dashboard/reviews" replace />}
            />

            {/* Redirect/404 se vuoi */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
