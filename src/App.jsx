import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";
import "./index.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmailVerification from "./pages/EmailVerification";
import WaitingForVerification from "./pages/WaitingForVerification";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import Exercises from "./pages/Exercises";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Exercise from "./pages/Exercise";
import Workouts from "./pages/workouts";
import WorkoutForm from "./components/workouts/WorkoutForm";
import NavigationBar from "./components/common/NavigationBar";
// Import other pages as needed

function App() {
  return (
    <BrowserRouter>
      <div className="pb-20 bg-dark-slate-gray">
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route
              path="/waiting-verification"
              element={<WaitingForVerification />}
            />
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/exercises" element={<Exercises />} />
              {/* Add other protected routes here */}
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/exercises/:id" element={<Exercise />} />
            </Route>
            // Update your routes to include workout details
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/workouts/:id" element={<Workouts />} />
            <Route path="/workouts/create" element={<WorkoutForm />} />
            <Route path="/workouts/edit/:id" element={<WorkoutForm />} />
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </AuthProvider>
      </div>

      {/* Navigation Bar fixed at bottom */}
      <NavigationBar />
    </BrowserRouter>
  );
}

export default App;
