import { Routes, Route, Navigate } from "react-router-dom";
import Home from "@pages/Home/Home";
import Login from "@pages/Auth/Login";
import SignUp from "@pages/Auth/SignUp";
import ResetPassword from "@pages/Auth/ResetPassword";
import UpdatePassword from "@pages/Auth/UpdatePassword";
import Dashboard from "@pages/Dashboard/Dashboard";
import Profile from "@pages/Profile/Profile";
import Feedback from "@pages/Feedback/Feedback";
import Reviews from "@pages/Reviews/Reviews";
import Restaurants from "@pages/Restaurants/Restaurants";
import PublicReviewPage from "@pages/PublicReview/PublicReview";
import { ProtectedRoute } from "@components/ProtectedRoute";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/feedback"
                element={
                    <ProtectedRoute>
                        <Feedback />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/reviews"
                element={
                    <ProtectedRoute>
                        <Reviews />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/dashboard/restaurants"
                element={
                    <ProtectedRoute>
                        <Restaurants />
                    </ProtectedRoute>
                }
            />

            <Route path="/r/:slug" element={<PublicReviewPage />} />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default App;
