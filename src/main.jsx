import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import "./index.css";
import ProtectedRoute from "./components/ProtectedRoute";


ReactDOM.createRoot(document.getElementById("root")).render(
    <Router>
        <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/dashboard" element={<App />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
    </Router>
);
