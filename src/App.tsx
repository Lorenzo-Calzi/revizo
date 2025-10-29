import { Routes, Route, Navigate } from "react-router-dom";
import Home from "@pages/Home/Home";
import Dashboard from "@pages/Dashboard/Dashboard";
import Feedback from "@pages/Feedback/Feedback";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/dashboard/feedback" element={<Feedback />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default App;
