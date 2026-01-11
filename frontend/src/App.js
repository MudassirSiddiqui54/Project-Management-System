import './App.css';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login.jsx";
import Register from './components/Register.jsx';
import { useTheme, ThemeProvider } from './components/ThemeContext.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import EmailVerification from './components/EmailVerification.jsx';
import HomePage from './components/HomePage.jsx';
import { AuthProvider } from './components/AuthContext.jsx';
import DashboardLayout from "./components/dashboard/Dashboardlayout.jsx";
import DashboardOverview from "./components/dashboard/DashboardOverview.jsx";
import ProjectsPage from "./components/dashboard/ProjectsPage.jsx";
import CreateProjectPage from "./components/dashboard/CreateProjectPage.jsx";
import ProjectDetailPage from "./components/dashboard/ProjectDetailPage.jsx";
import TasksPage from "./components/dashboard/TasksPage.jsx";
import NotesPage from "./components/dashboard/NotesPage.jsx";
import MembersPage from "./components/dashboard/MembersPage.jsx";
import SettingsPage from "./components/dashboard/SettingsPage.jsx";

function App() {
  return (
    <>
    <ThemeProvider>
      <AuthProvider>
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />}/>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />

        {/* Protected Dashboard Routes */}
    <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/new" element={<CreateProjectPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="settings" element={<SettingsPage />} />
    </Route>


        <Route path="/features" element={<h1 className="text-center p-20 text-3xl">Features Page</h1>} />
        <Route path="/pricing" element={<h1 className="text-center p-20 text-3xl">Pricing Page</h1>} />
        <Route path="/about" element={<h1 className="text-center p-20 text-3xl">About Page</h1>} />
        <Route path="/terms" element= {<h1 className="text-center p-20 m-10 text-5xl text-violet-900">LOL</h1>} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
    </>
  );
}

export default App;
