import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { useTheme } from "../ThemeContext.jsx";
import {
	HomeIcon,
	FolderIcon,
	ClipboardDocumentCheckIcon,
	DocumentTextIcon,
	UserGroupIcon,
	Cog6ToothIcon,
	Bars3Icon,
	XMarkIcon,
	ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function DashboardLayout() {
	const { user, logout } = useAuth();
	const { isDark } = useTheme();
	const location = useLocation();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const navItems = [
		{
			path: "/dashboard",
			icon: <HomeIcon className="h-5 w-5" />,
			label: "Overview",
		},
		{
			path: "/dashboard/projects",
			icon: <FolderIcon className="h-5 w-5" />,
			label: "Projects",
		},
		{
			path: "/dashboard/tasks",
			icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
			label: "Tasks",
		},
		{
			path: "/dashboard/notes",
			icon: <DocumentTextIcon className="h-5 w-5" />,
			label: "Notes",
		},
		{
			path: "/dashboard/members",
			icon: <UserGroupIcon className="h-5 w-5" />,
			label: "Team",
		},
		{
			path: "/dashboard/settings",
			icon: <Cog6ToothIcon className="h-5 w-5" />,
			label: "Settings",
		},
	];

	const handleLogout = async () => {
		try {
			await logout(); // You'll need to create logout API call
			window.location.href = "/login";
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	return (
		<div
			className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
		>
			{/* Mobile Sidebar Toggle */}
			<div
				className={`sticky top-0 z-40 lg:hidden ${
					isDark
						? "bg-gray-900 border-b border-gray-800"
						: "bg-white border-b border-gray-200"
				}`}
			>
				<div className="flex items-center justify-between px-4 py-3">
					<button
						onClick={() => setSidebarOpen(!sidebarOpen)}
						className={`p-2 rounded-lg ${
							isDark
								? "text-gray-300 hover:bg-gray-800"
								: "text-gray-600 hover:bg-gray-100"
						}`}
					>
						{sidebarOpen ? (
							<XMarkIcon className="h-6 w-6" />
						) : (
							<Bars3Icon className="h-6 w-6" />
						)}
					</button>
					<div className="flex items-center">
						<span
							className={`text-lg font-bold ${
								isDark ? "text-white" : "text-gray-900"
							}`}
						>
							Dashboard
						</span>
					</div>
					<div className="w-10"></div> {/* Spacer for alignment */}
				</div>
			</div>

			{/* Sidebar for mobile */}
			{sidebarOpen && (
				<div className="lg:hidden">
					<div className="fixed inset-0 z-30">
						<div
							className="absolute inset-0 bg-black/50"
							onClick={() => setSidebarOpen(false)}
						/>
						<div
							className={`absolute inset-y-0 left-0 w-64 ${
								isDark ? "bg-gray-900" : "bg-white"
							} shadow-xl`}
						>
							<SidebarContent
								navItems={navItems}
								location={location}
								user={user}
								onLogout={handleLogout}
								isDark={isDark}
								closeSidebar={() => setSidebarOpen(false)}
							/>
						</div>
					</div>
				</div>
			)}

			{/* Desktop Layout */}
			<div className="hidden lg:flex">
				{/* Desktop Sidebar */}
				<div
					className={`w-64 ${
						isDark ? "bg-gray-900" : "bg-white"
					} border-r ${
						isDark ? "border-gray-800" : "border-gray-200"
					} min-h-screen fixed`}
				>
					<SidebarContent
						navItems={navItems}
						location={location}
						user={user}
						onLogout={handleLogout}
						isDark={isDark}
					/>
				</div>

				{/* Main Content */}
				<div className="flex-1 lg:ml-64">
					<Outlet />
				</div>
			</div>

			{/* Mobile Main Content */}
			<div className="lg:hidden">
				<Outlet />
			</div>
		</div>
	);
}

// Separate sidebar content component
function SidebarContent({
	navItems,
	location,
	user,
	onLogout,
	isDark,
	closeSidebar,
}) {
	return (
		<div className="h-full flex flex-col">
			{/* Logo */}
			<div
				className={`p-6 border-b ${
					isDark ? "border-gray-800" : "border-gray-200"
				}`}
			>
				<div className="flex items-center space-x-3">
					<img src="/favicon.ico" alt="Logo" className="h-8 w-8" />
					<span
						className={`text-xl font-bold ${
							isDark ? "text-white" : "text-gray-900"
						}`}
					>
						Project<span className="text-lime-500">Camp</span>
					</span>
				</div>
			</div>

			{/* User Profile */}
			<div
				className={`p-6 border-b ${
					isDark ? "border-gray-800" : "border-gray-200"
				}`}
			>
				<div className="flex items-center space-x-3">
					<div className="h-10 w-10 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
						{user?.username?.charAt(0).toUpperCase() || "U"}
					</div>
					<div>
						<h3
							className={`font-semibold ${
								isDark ? "text-white" : "text-gray-900"
							}`}
						>
							{user?.username}
						</h3>
						<p
							className={`text-sm ${
								isDark ? "text-gray-400" : "text-gray-600"
							}`}
						>
							{user?.email}
						</p>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 p-4">
				<ul className="space-y-1">
					{navItems.map((item) => {
						const isActive = location.pathname === item.path;
						return (
							<li key={item.path}>
								<Link
									to={item.path}
									onClick={closeSidebar}
									className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
										isActive
											? isDark
												? "bg-lime-900/30 text-lime-400 border-l-2 border-lime-500"
												: "bg-lime-50 text-lime-700 border-l-2 border-lime-500"
											: isDark
											? "text-gray-300 hover:bg-gray-800 hover:text-white"
											: "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
									}`}
								>
									{item.icon}
									<span className="font-medium">
										{item.label}
									</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			{/* Bottom Actions */}
			<div
				className={`p-4 border-t ${
					isDark ? "border-gray-800" : "border-gray-200"
				}`}
			>
				<button
					onClick={onLogout}
					className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition ${
						isDark
							? "text-red-400 hover:bg-red-900/30 hover:text-red-300"
							: "text-red-600 hover:bg-red-50 hover:text-red-700"
					}`}
				>
					<ArrowRightOnRectangleIcon className="h-5 w-5" />
					<span className="font-medium">Logout</span>
				</button>
			</div>
		</div>
	);
}
