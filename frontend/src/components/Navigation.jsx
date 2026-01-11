import { Link, useLocation } from "react-router-dom";
import { useTheme } from "./ThemeContext.jsx";
import {
	HomeIcon,
	UserIcon,
	ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useAuth, AuthProvider } from "./AuthContext.jsx";

export default function Navigation() {
	const { isDark, toggleTheme } = useTheme();
	const { user, isAuthenticated } = useAuth();
	const location = useLocation();

	// Don't show nav on auth pages
	const hideNavPaths = ["/login", "/register", "/forgot-password"];
	if (hideNavPaths.includes(location.pathname)) return null;

	return (
		<nav
			className={`sticky top-0 z-50 ${
				isDark
					? "bg-gray-900/80 backdrop-blur-lg"
					: "bg-white/80 backdrop-blur-lg"
			} border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}
		>
			<div className="container mx-auto px-4 py-3">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<Link to="/" className="flex items-center space-x-2">
						<img
							src="/favicon.ico"
							alt="Logo"
							className="h-8 w-8"
						/>
						<span
							className={`text-xl font-bold ${
								isDark ? "text-white" : "text-gray-900"
							}`}
						>
							Project<span className="text-lime-500">Camp</span>
						</span>
					</Link>
					{/* Center Links */}
					<div className="hidden md:flex items-center space-x-8">
						<Link
							to="/"
							className={`font-medium transition ${
								isDark
									? "text-gray-300 hover:text-white"
									: "text-gray-600 hover:text-gray-900"
							} ${
								location.pathname === "/" ? "text-lime-500" : ""
							}`}
						>
							<HomeIcon className="h-5 w-5 inline mr-1" />
							Home
						</Link>
						<Link
							to="/features"
							className={`font-medium transition ${
								isDark
									? "text-gray-300 hover:text-white"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							Features
						</Link>
						<Link
							to="/pricing"
							className={`font-medium transition ${
								isDark
									? "text-gray-300 hover:text-white"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							Pricing
						</Link>
						<Link
							to="/about"
							className={`font-medium transition ${
								isDark
									? "text-gray-300 hover:text-white"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							About
						</Link>
					</div>
					{/* Right Side */}
					<div className="flex items-center space-x-4">
						{/* Theme Toggle */}
						<button
							onClick={toggleTheme}
							className={`p-2 rounded-lg ${
								isDark
									? "bg-gray-800 text-gray-300 hover:bg-gray-700"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							}`}
						>
							{isDark ? "🌙" : "☀️"}
						</button>

						{/* Auth State */}
						{isAuthenticated ? (
							<div className="flex items-center space-x-4">
								<Link
									to="/dashboard"
									className={`px-4 py-2 rounded-lg font-medium ${
										isDark
											? "bg-gray-800 hover:bg-gray-700"
											: "bg-gray-100 hover:bg-gray-200"
									}`}
								>
									Dashboard
								</Link>
								<div className="relative group">
									<button
										className={`flex items-center space-x-2 p-2 rounded-lg ${
											isDark
												? "hover:bg-gray-800"
												: "hover:bg-gray-100"
										}`}
									>
										<div className="h-8 w-8 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 flex items-center justify-center text-white font-bold">
											{user?.username
												?.charAt(0)
												.toUpperCase() || "U"}
										</div>
										<span className="font-medium">
											{user?.username}
										</span>
									</button>
									{/* Dropdown - add later */}
								</div>
							</div>
						) : (
							<div className="flex items-center space-x-3">
								<Link
									to="/login"
									className={`px-4 py-2 rounded-lg font-medium ${
										isDark
											? "text-gray-300 hover:text-white"
											: "text-gray-700 hover:text-gray-900"
									}`}
								>
									Sign In
								</Link>
								<Link
									to="/register"
									className="px-4 py-2 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700 flex items-center"
								>
									Get Started
									<ArrowRightIcon className="h-4 w-4 ml-1" />
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
