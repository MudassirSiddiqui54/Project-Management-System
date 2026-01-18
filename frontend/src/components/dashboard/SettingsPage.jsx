import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.jsx";
import { useTheme } from "../ThemeContext.jsx";
import { changeCurrentPassword } from "../../api/auth.api.js";
import {
	Cog6ToothIcon,
	UserCircleIcon,
	BellIcon,
	ShieldCheckIcon,
	DevicePhoneMobileIcon,
	DownloadIcon,
	TrashIcon,
	CameraIcon,
	XMarkIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	EyeIcon,
	EyeSlashIcon,
	PaintBrushIcon,
	GlobeAltIcon,
	ClockIcon,
	SunIcon,
	MoonIcon,
	ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
	const { user, logout } = useAuth();
	const { isDark, toggleTheme } = useTheme();
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("appearance");
	// Password change state
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState({
		current: false,
		new: false,
		confirm: false,
	});

	// Appearance preferences (stored in localStorage)
	const [appearance, setAppearance] = useState(() => {
		const saved = localStorage.getItem("userAppearancePreferences");
		return saved
			? JSON.parse(saved)
			: {
					theme: "system", // system, light, dark
					accentColor: "lime",
					sidebarWidth: "normal", // compact, normal, wide
					density: "comfortable", // compact, comfortable, spacious
					animations: true,
					font: "system",
				};
	});

	// Notification preferences (stored in localStorage)
	const [notifications, setNotifications] = useState(() => {
		const saved = localStorage.getItem("userNotificationPreferences");
		return saved
			? JSON.parse(saved)
			: {
					email: {
						projectInvites: true,
						taskAssignments: true,
						dueDateReminders: true,
						mentions: true,
						weeklyDigest: false,
					},
					inApp: {
						taskAssignments: true,
						dueDateReminders: true,
						mentions: true,
						projectUpdates: true,
					},
					sound: true,
					desktopNotifications: false,
				};
	});

	// General preferences (stored in localStorage)
	const [general, setGeneral] = useState(() => {
		const saved = localStorage.getItem("userGeneralPreferences");
		return saved
			? JSON.parse(saved)
			: {
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					dateFormat: "MM/DD/YYYY",
					timeFormat: "12h", // 12h or 24h
					weekStart: "sunday", // sunday or monday
					language: "en",
					autoSave: true,
					defaultView: "list", // list, grid, kanban
				};
	});

	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [exportingData, setExportingData] = useState(false);

	// Save preferences to localStorage when they change
	useEffect(() => {
		localStorage.setItem(
			"userAppearancePreferences",
			JSON.stringify(appearance),
		);
		// Apply theme immediately
		if (appearance.theme === "dark" && !isDark) {
			// Trigger theme change via your ThemeContext
			// This is a placeholder - you'll need to implement based on your ThemeContext
		} else if (appearance.theme === "light" && isDark) {
			// Trigger theme change
		}
	}, [appearance]);

	useEffect(() => {
		localStorage.setItem(
			"userNotificationPreferences",
			JSON.stringify(notifications),
		);
	}, [notifications]);

	useEffect(() => {
		localStorage.setItem("userGeneralPreferences", JSON.stringify(general));
	}, [general]);

	// Handle password change (using existing auth API)
	const handlePasswordChange = async (e) => {
		e.preventDefault();

		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			setError("New passwords do not match");
			return;
		}

		if (passwordForm.newPassword.length < 6) {
			setError("New password must be at least 6 characters");
			return;
		}

		setLoading(true);
		setError("");

		try {
			await changeCurrentPassword({
				oldPassword: passwordForm.currentPassword,
				newPassword: passwordForm.newPassword,
			});

			setPasswordForm({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});

			setSuccess("Password changed successfully!");
			setTimeout(() => setSuccess(""), 3000);
		} catch (error) {
			console.error("Failed to change password:", error);
			setError(
				error.response?.data?.message ||
					"Failed to change password. Please check your current password.",
			);
		} finally {
			setLoading(false);
		}
	};

	// Toggle password visibility
	const togglePasswordVisibility = (field) => {
		setShowPassword((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	// Reset all preferences
	const handleResetPreferences = () => {
		if (
			window.confirm(
				"Are you sure you want to reset all preferences to default?",
			)
		) {
			setAppearance({
				theme: "system",
				accentColor: "lime",
				sidebarWidth: "normal",
				density: "comfortable",
				animations: true,
				font: "system",
			});

			setNotifications({
				email: {
					projectInvites: true,
					taskAssignments: true,
					dueDateReminders: true,
					mentions: true,
					weeklyDigest: false,
				},
				inApp: {
					taskAssignments: true,
					dueDateReminders: true,
					mentions: true,
					projectUpdates: true,
				},
				sound: true,
				desktopNotifications: false,
			});

			setGeneral({
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				dateFormat: "MM/DD/YYYY",
				timeFormat: "12h",
				weekStart: "sunday",
				language: "en",
				autoSave: true,
				defaultView: "list",
			});

			setSuccess("All preferences have been reset to default!");
			setTimeout(() => setSuccess(""), 3000);
		}
	};

	// Export user data (simulated)
	const handleExportData = async () => {
		setExportingData(true);

		// Simulate API call
		setTimeout(() => {
			const data = {
				user: {
					username: user?.username,
					email: user?.email,
					createdAt: new Date().toISOString(),
				},
				preferences: {
					appearance,
					notifications,
					general,
				},
				exportDate: new Date().toISOString(),
			};

			const dataStr = JSON.stringify(data, null, 2);
			const dataBlob = new Blob([dataStr], { type: "application/json" });
			const url = URL.createObjectURL(dataBlob);

			const link = document.createElement("a");
			link.href = url;
			link.download = `projectcamp-data-${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			setExportingData(false);
			setSuccess("Data exported successfully!");
			setTimeout(() => setSuccess(""), 3000);
		}, 1500);
	};

	// Simulate account deletion
	const handleDeleteAccount = () => {
		// In a real app, this would call backend API
		alert(
			"Account deletion would be handled by backend. For now, this is a simulation.",
		);
		setShowDeleteConfirm(false);
	};

	// Theme options
	const themeOptions = [
		{
			value: "system",
			label: "System Default",
			icon: <ComputerDesktopIcon className="h-5 w-5" />,
		},
		{
			value: "light",
			label: "Light",
			icon: <SunIcon className="h-5 w-5" />,
		},
		{
			value: "dark",
			label: "Dark",
			icon: <MoonIcon className="h-5 w-5" />,
		},
	];

	// Accent color options
	const accentColorOptions = [
		{ value: "lime", label: "Lime", color: "bg-lime-500" },
		{ value: "blue", label: "Blue", color: "bg-blue-500" },
		{ value: "purple", label: "Purple", color: "bg-purple-500" },
		{ value: "rose", label: "Rose", color: "bg-rose-500" },
		{ value: "amber", label: "Amber", color: "bg-amber-500" },
	];

	// Timezone options (common ones)
	const timezoneOptions = [
		"America/New_York",
		"America/Chicago",
		"America/Denver",
		"America/Los_Angeles",
		"Europe/London",
		"Europe/Paris",
		"Asia/Tokyo",
		"Australia/Sydney",
		"UTC",
	];

	const tabs = [
		{
			id: "appearance",
			label: "Appearance",
			icon: <PaintBrushIcon className="h-4 w-4" />,
		},
		{
			id: "notifications",
			label: "Notifications",
			icon: <BellIcon className="h-4 w-4" />,
		},
		{
			id: "general",
			label: "General",
			icon: <Cog6ToothIcon className="h-4 w-4" />,
		},
		{
			id: "security",
			label: "Security",
			icon: <ShieldCheckIcon className="h-4 w-4" />,
		},
		{
			id: "account",
			label: "Account",
			icon: <UserCircleIcon className="h-4 w-4" />,
		},
	];

	return (
		<div
			className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
		>
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1
						className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
					>
						Settings
					</h1>
					<p className={isDark ? "text-gray-400" : "text-gray-600"}>
						Manage your account preferences and settings
					</p>
				</div>

				{/* Success/Error Messages */}
				{success && (
					<div
						className={`mb-6 p-4 rounded-lg ${isDark ? "bg-green-900/30 border border-green-800" : "bg-green-50 border border-green-200"}`}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<CheckCircleIcon className="h-5 w-5 text-green-500" />
								<p className="text-green-500">{success}</p>
							</div>
							<button onClick={() => setSuccess("")}>
								<XMarkIcon className="h-4 w-4 text-green-500" />
							</button>
						</div>
					</div>
				)}

				{error && (
					<div
						className={`mb-6 p-4 rounded-lg ${isDark ? "bg-red-900/30 border border-red-800" : "bg-red-50 border border-red-200"}`}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
								<p className="text-red-500">{error}</p>
							</div>
							<button onClick={() => setError("")}>
								<XMarkIcon className="h-4 w-4 text-red-500" />
							</button>
						</div>
					</div>
				)}

				<div className="grid lg:grid-cols-4 gap-8">
					{/* Sidebar - Settings Tabs */}
					<div className="lg:col-span-1">
						<div
							className={`rounded-2xl border ${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"} p-4`}
						>
							<nav className="space-y-1">
								{tabs.map((tab) => (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id)}
										className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${
											activeTab === tab.id
												? isDark
													? "bg-lime-900/30 text-lime-400"
													: "bg-lime-50 text-lime-700"
												: isDark
													? "text-gray-400 hover:text-white hover:bg-gray-800"
													: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
										}`}
									>
										{tab.icon}
										{tab.label}
									</button>
								))}
							</nav>

							{/* User Info */}
							<div
								className={`mt-6 pt-6 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}
							>
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 flex items-center justify-center text-white font-bold">
										{user?.username
											?.charAt(0)
											.toUpperCase() || "U"}
									</div>
									<div>
										<h3
											className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
										>
											{user?.username}
										</h3>
										<p
											className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"}`}
										>
											{user?.email}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Main Content */}
					<div className="lg:col-span-3">
						<div
							className={`rounded-2xl border ${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"} p-6`}
						>
							{/* Appearance Settings */}
							{activeTab === "appearance" && (
								<div className="space-y-8">
									<div>
										<h2
											className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
										>
											Appearance
										</h2>

										{/* Theme Selection */}
										<div className="mb-8">
											<h3
												className={`text-lg font-medium mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
											>
												Theme
											</h3>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												{themeOptions.map((option) => (
													<button
														key={option.value}
														onClick={() =>
															setAppearance(
																(prev) => ({
																	...prev,
																	theme: option.value,
																}),
															)
														}
														className={`p-4 rounded-xl border text-left transition ${
															appearance.theme ===
															option.value
																? isDark
																	? "border-lime-500 bg-lime-900/20 text-lime-400"
																	: "border-lime-500 bg-lime-50 text-lime-700"
																: isDark
																	? "border-gray-700 hover:border-gray-600 hover:bg-gray-800"
																	: "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
														}`}
													>
														<div className="flex items-center gap-3 mb-3">
															<div
																className={`p-2 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
															>
																{option.icon}
															</div>
														</div>
														<h4 className="font-semibold">
															{option.label}
														</h4>
													</button>
												))}
											</div>
										</div>

										{/* Accent Color */}
										<div className="mb-8">
											<h3
												className={`text-lg font-medium mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
											>
												Accent Color
											</h3>
											<div className="flex flex-wrap gap-3">
												{accentColorOptions.map(
													(color) => (
														<button
															key={color.value}
															onClick={() =>
																setAppearance(
																	(prev) => ({
																		...prev,
																		accentColor:
																			color.value,
																	}),
																)
															}
															className={`flex flex-col items-center gap-2 ${appearance.accentColor === color.value ? "ring-2 ring-offset-2 ring-lime-500 rounded-lg p-1" : ""}`}
														>
															<div
																className={`h-10 w-10 rounded-full ${color.color}`}
															></div>
															<span
																className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
															>
																{color.label}
															</span>
														</button>
													),
												)}
											</div>
										</div>

										{/* Other Appearance Settings */}
										<div className="grid md:grid-cols-2 gap-6">
											{/* Sidebar Width */}
											<div>
												<label
													className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
												>
													Sidebar Width
												</label>
												<select
													value={
														appearance.sidebarWidth
													}
													onChange={(e) =>
														setAppearance(
															(prev) => ({
																...prev,
																sidebarWidth:
																	e.target
																		.value,
															}),
														)
													}
													className={`w-full px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
												>
													<option value="compact">
														Compact
													</option>
													<option value="normal">
														Normal
													</option>
													<option value="wide">
														Wide
													</option>
												</select>
											</div>

											{/* Density */}
											<div>
												<label
													className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
												>
													Density
												</label>
												<select
													value={appearance.density}
													onChange={(e) =>
														setAppearance(
															(prev) => ({
																...prev,
																density:
																	e.target
																		.value,
															}),
														)
													}
													className={`w-full px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
												>
													<option value="compact">
														Compact
													</option>
													<option value="comfortable">
														Comfortable
													</option>
													<option value="spacious">
														Spacious
													</option>
												</select>
											</div>

											{/* Animations Toggle */}
											<div className="flex items-center justify-between">
												<div>
													<h4
														className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
													>
														Animations
													</h4>
													<p
														className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"}`}
													>
														Enable interface
														animations
													</p>
												</div>
												<button
													onClick={() =>
														setAppearance(
															(prev) => ({
																...prev,
																animations:
																	!prev.animations,
															}),
														)
													}
													className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${appearance.animations ? "bg-lime-500" : isDark ? "bg-gray-700" : "bg-gray-300"}`}
												>
													<span
														className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${appearance.animations ? "translate-x-6" : "translate-x-1"}`}
													/>
												</button>
											</div>
										</div>
									</div>

									{/* Reset Button */}
									<div className="flex justify-end">
										<button
											onClick={handleResetPreferences}
											className={`px-4 py-2 rounded-lg font-medium ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
										>
											Reset to Default
										</button>
									</div>
								</div>
							)}

							{/* Notifications Settings */}
							{activeTab === "notifications" && (
								<div className="space-y-8">
									<div>
										<h2
											className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
										>
											Notifications
										</h2>

										{/* Email Notifications */}
										<div className="mb-8">
											<h3
												className={`text-lg font-medium mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
											>
												Email Notifications
											</h3>
											<div className="space-y-4">
												{Object.entries(
													notifications.email,
												).map(([key, value]) => (
													<div
														key={key}
														className="flex items-center justify-between"
													>
														<div>
															<h4
																className={`font-medium capitalize ${isDark ? "text-gray-300" : "text-gray-700"}`}
															>
																{key
																	.replace(
																		/([A-Z])/g,
																		" $1",
																	)
																	.trim()}
															</h4>
														</div>
														<button
															onClick={() =>
																setNotifications(
																	(prev) => ({
																		...prev,
																		email: {
																			...prev.email,
																			[key]: !value,
																		},
																	}),
																)
															}
															className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? "bg-lime-500" : isDark ? "bg-gray-700" : "bg-gray-300"}`}
														>
															<span
																className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? "translate-x-6" : "translate-x-1"}`}
															/>
														</button>
													</div>
												))}
											</div>
										</div>

										{/* In-App Notifications */}
										<div className="mb-8">
											<h3
												className={`text-lg font-medium mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
											>
												In-App Notifications
											</h3>
											<div className="space-y-4">
												{Object.entries(
													notifications.inApp,
												).map(([key, value]) => (
													<div
														key={key}
														className="flex items-center justify-between"
													>
														<div>
															<h4
																className={`font-medium capitalize ${isDark ? "text-gray-300" : "text-gray-700"}`}
															>
																{key
																	.replace(
																		/([A-Z])/g,
																		" $1",
																	)
																	.trim()}
															</h4>
														</div>
														<button
															onClick={() =>
																setNotifications(
																	(prev) => ({
																		...prev,
																		inApp: {
																			...prev.inApp,
																			[key]: !value,
																		},
																	}),
																)
															}
															className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? "bg-lime-500" : isDark ? "bg-gray-700" : "bg-gray-300"}`}
														>
															<span
																className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? "translate-x-6" : "translate-x-1"}`}
															/>
														</button>
													</div>
												))}
											</div>
										</div>

										{/* Sound & Desktop Notifications */}
										<div className="grid md:grid-cols-2 gap-6">
											<div className="flex items-center justify-between">
												<div>
													<h4
														className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
													>
														Sound Effects
													</h4>
													<p
														className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"}`}
													>
														Play sounds for
														notifications
													</p>
												</div>
												<button
													onClick={() =>
														setNotifications(
															(prev) => ({
																...prev,
																sound: !prev.sound,
															}),
														)
													}
													className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.sound ? "bg-lime-500" : isDark ? "bg-gray-700" : "bg-gray-300"}`}
												>
													<span
														className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.sound ? "translate-x-6" : "translate-x-1"}`}
													/>
												</button>
											</div>

											<div className="flex items-center justify-between">
												<div>
													<h4
														className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
													>
														Desktop Notifications
													</h4>
													<p
														className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"}`}
													>
														Show browser
														notifications
													</p>
												</div>
												<button
													onClick={() =>
														setNotifications(
															(prev) => ({
																...prev,
																desktopNotifications:
																	!prev.desktopNotifications,
															}),
														)
													}
													className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.desktopNotifications ? "bg-lime-500" : isDark ? "bg-gray-700" : "bg-gray-300"}`}
												>
													<span
														className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.desktopNotifications ? "translate-x-6" : "translate-x-1"}`}
													/>
												</button>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* General Settings */}
							{activeTab === "general" && (
								<div className="space-y-8">
									<div>
										<h2
											className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
										>
											General Settings
										</h2>

										<div className="grid md:grid-cols-2 gap-6">
											{/* Timezone */}
											<div>
												<label
													className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
												>
													<ClockIcon className="h-4 w-4 inline mr-1" />
													Timezone
												</label>
												<select
													value={general.timezone}
													onChange={(e) =>
														setGeneral((prev) => ({
															...prev,
															timezone:
																e.target.value,
														}))
													}
													className={`w-full px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
												>
													{timezoneOptions.map(
														(tz) => (
															<option
																key={tz}
																value={tz}
															>
																{tz}
															</option>
														),
													)}
												</select>
											</div>

											{/* Date Format */}
											<div>
												<label
													className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
												>
													Date Format
												</label>
												<select
													value={general.dateFormat}
													onChange={(e) =>
														setGeneral((prev) => ({
															...prev,
															dateFormat:
																e.target.value,
														}))
													}
													className={`w-full px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
												>
													<option value="MM/DD/YYYY">
														MM/DD/YYYY
													</option>
													<option value="DD/MM/YYYY">
														DD/MM/YYYY
													</option>
													<option value="YYYY-MM-DD">
														YYYY-MM-DD
													</option>
												</select>
											</div>

											{/* Time Format */}
											<div>
												<label
													className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
												>
													Time Format
												</label>
												<select
													value={general.timeFormat}
													onChange={(e) =>
														setGeneral((prev) => ({
															...prev,
															timeFormat:
																e.target.value,
														}))
													}
													className={`w-full px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
												>
													<option value="12h">
														12-hour
													</option>
													<option value="24h">
														24-hour
													</option>
												</select>
											</div>

											{/* Week Start */}
											<div>
												<label
													className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
												>
													Week Starts On
												</label>
												<select
													value={general.weekStart}
													onChange={(e) =>
														setGeneral((prev) => ({
															...prev,
															weekStart:
																e.target.value,
														}))
													}
													className={`w-full px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
												>
													<option value="sunday">
														Sunday
													</option>
													<option value="monday">
														Monday
													</option>
												</select>
											</div>

											{/* Language */}
											<div>
												<label
													className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
												>
													<GlobeAltIcon className="h-4 w-4 inline mr-1" />
													Language
												</label>
												<select
													value={general.language}
													onChange={(e) =>
														setGeneral((prev) => ({
															...prev,
															language:
																e.target.value,
														}))
													}
													className={`w-full px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
												>
													<option value="en">
														English
													</option>
													<option value="es">
														Spanish
													</option>
													<option value="fr">
														French
													</option>
													<option value="de">
														German
													</option>
													<option value="ja">
														Japanese
													</option>
												</select>
											</div>

											{/* Default View */}
											<div>
												<label
													className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
												>
													Default View
												</label>
												<select
													value={general.defaultView}
													onChange={(e) =>
														setGeneral((prev) => ({
															...prev,
															defaultView:
																e.target.value,
														}))
													}
													className={`w-full px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
												>
													<option value="list">
														List
													</option>
													<option value="grid">
														Grid
													</option>
													<option value="kanban">
														Kanban
													</option>
												</select>
											</div>
										</div>

										{/* Auto Save */}
										<div className="mt-6 flex items-center justify-between">
											<div>
												<h4
													className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
												>
													Auto Save
												</h4>
												<p
													className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"}`}
												>
													Automatically save changes
													as you work
												</p>
											</div>
											<button
												onClick={() =>
													setGeneral((prev) => ({
														...prev,
														autoSave:
															!prev.autoSave,
													}))
												}
												className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${general.autoSave ? "bg-lime-500" : isDark ? "bg-gray-700" : "bg-gray-300"}`}
											>
												<span
													className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${general.autoSave ? "translate-x-6" : "translate-x-1"}`}
												/>
											</button>
										</div>
									</div>

									{/* Reset Button */}
									<div className="flex justify-end">
										<button
											onClick={handleResetPreferences}
											className={`px-4 py-2 rounded-lg font-medium ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
										>
											Reset to Default
										</button>
									</div>
								</div>
							)}

							{/* Security Settings */}
							{activeTab === "security" && (
								<div className="space-y-8">
									<div>
										<h2
											className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
										>
											Security
										</h2>

										{/* Change Password */}
										<div className="mb-8">
											<h3
												className={`text-lg font-medium mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
											>
												Change Password
											</h3>
											<form
												onSubmit={handlePasswordChange}
												className="space-y-4"
											>
												{/* Current Password */}
												<div>
													<label
														className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
													>
														Current Password
													</label>
													<div className="relative">
														<input
															type={
																showPassword.current
																	? "text"
																	: "password"
															}
															value={
																passwordForm.currentPassword
															}
															onChange={(e) =>
																setPasswordForm(
																	(prev) => ({
																		...prev,
																		currentPassword:
																			e
																				.target
																				.value,
																	}),
																)
															}
															className={`w-full px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
															required
														/>
														<button
															type="button"
															onClick={() =>
																togglePasswordVisibility(
																	"current",
																)
															}
															className="absolute right-3 top-1/2 transform -translate-y-1/2"
														>
															{showPassword.current ? (
																<EyeSlashIcon
																	className={`h-5 w-5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
																/>
															) : (
																<EyeIcon
																	className={`h-5 w-5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
																/>
															)}
														</button>
													</div>
												</div>

												{/* New Password */}
												<div>
													<label
														className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
													>
														New Password
													</label>
													<div className="relative">
														<input
															type={
																showPassword.new
																	? "text"
																	: "password"
															}
															value={
																passwordForm.newPassword
															}
															onChange={(e) =>
																setPasswordForm(
																	(prev) => ({
																		...prev,
																		newPassword:
																			e
																				.target
																				.value,
																	}),
																)
															}
															className={`w-full px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
															required
														/>
														<button
															type="button"
															onClick={() =>
																togglePasswordVisibility(
																	"new",
																)
															}
															className="absolute right-3 top-1/2 transform -translate-y-1/2"
														>
															{showPassword.new ? (
																<EyeSlashIcon
																	className={`h-5 w-5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
																/>
															) : (
																<EyeIcon
																	className={`h-5 w-5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
																/>
															)}
														</button>
													</div>
												</div>

												{/* Confirm Password */}
												<div>
													<label
														className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
													>
														Confirm New Password
													</label>
													<div className="relative">
														<input
															type={
																showPassword.confirm
																	? "text"
																	: "password"
															}
															value={
																passwordForm.confirmPassword
															}
															onChange={(e) =>
																setPasswordForm(
																	(prev) => ({
																		...prev,
																		confirmPassword:
																			e
																				.target
																				.value,
																	}),
																)
															}
															className={`w-full px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
															required
														/>
														<button
															type="button"
															onClick={() =>
																togglePasswordVisibility(
																	"confirm",
																)
															}
															className="absolute right-3 top-1/2 transform -translate-y-1/2"
														>
															{showPassword.confirm ? (
																<EyeSlashIcon
																	className={`h-5 w-5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
																/>
															) : (
																<EyeIcon
																	className={`h-5 w-5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
																/>
															)}
														</button>
													</div>
												</div>

												<div className="flex items-center gap-3 pt-4">
													<button
														type="submit"
														disabled={loading}
														className="px-6 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700 disabled:opacity-50 disabled:cursor-not-allowed"
													>
														{loading
															? "Changing Password..."
															: "Change Password"}
													</button>
													<button
														type="button"
														onClick={() =>
															setPasswordForm({
																currentPassword:
																	"",
																newPassword: "",
																confirmPassword:
																	"",
															})
														}
														className={`px-6 py-3 rounded-lg font-medium ${isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
													>
														Clear
													</button>
												</div>
											</form>
										</div>

										{/* Security Tips */}
										<div
											className={`rounded-xl border ${isDark ? "border-blue-800 bg-blue-900/10" : "border-blue-200 bg-blue-50"} p-6`}
										>
											<h3
												className={`text-lg font-medium mb-3 ${isDark ? "text-blue-400" : "text-blue-600"}`}
											>
												<ShieldCheckIcon className="h-5 w-5 inline mr-2" />
												Security Tips
											</h3>
											<ul
												className={`space-y-2 text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}
											>
												<li>
													• Use a strong, unique
													password
												</li>
												<li>
													• Enable two-factor
													authentication when
													available
												</li>
												<li>
													• Log out from devices you
													don't recognize
												</li>
												<li>
													• Never share your password
													with anyone
												</li>
												<li>
													• Change your password
													regularly
												</li>
											</ul>
										</div>
									</div>
								</div>
							)}

							{/* Account Settings */}
							{activeTab === "account" && (
								<div className="space-y-8">
									<div>
										<h2
											className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
										>
											Account
										</h2>

										{/* Data Export */}
										<div className="mb-8">
											<h3
												className={`text-lg font-medium mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
											>
												<DownloadIcon className="h-5 w-5 inline mr-2" />
												Export Data
											</h3>
											<p
												className={`mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
											>
												Download all your data in JSON
												format. This includes your
												preferences, but not project
												data.
											</p>
											<button
												onClick={handleExportData}
												disabled={exportingData}
												className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} disabled:opacity-50 disabled:cursor-not-allowed`}
											>
												{exportingData ? (
													<>
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
														Preparing Export...
													</>
												) : (
													<>
														<DownloadIcon className="h-4 w-4" />
														Export My Data
													</>
												)}
											</button>
										</div>

										{/* Account Deletion */}
										<div
											className={`rounded-xl border ${isDark ? "border-red-800 bg-red-900/10" : "border-red-200 bg-red-50"} p-6`}
										>
											<h3
												className={`text-lg font-medium mb-3 ${isDark ? "text-red-400" : "text-red-600"}`}
											>
												<TrashIcon className="h-5 w-5 inline mr-2" />
												Danger Zone
											</h3>
											<p
												className={`mb-4 ${isDark ? "text-red-300" : "text-red-700"}`}
											>
												Once you delete your account,
												there is no going back. This
												action is irreversible.
											</p>
											<button
												onClick={() =>
													setShowDeleteConfirm(true)
												}
												className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
											>
												Delete Account
											</button>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Delete Account Confirmation Modal */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div
						className={`w-full max-w-md rounded-2xl ${isDark ? "bg-gray-900" : "bg-white"} p-6`}
					>
						<ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
						<h3
							className={`text-xl font-bold mb-2 text-center ${isDark ? "text-white" : "text-gray-900"}`}
						>
							Delete Account?
						</h3>
						<p
							className={`text-center mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
						>
							Are you sure you want to delete your account? This
							action cannot be undone. All your data will be
							permanently deleted.
						</p>
						<div className="space-y-3">
							<div
								className={`p-4 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
							>
								<p
									className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
								>
									Type <strong>DELETE</strong> to confirm:
								</p>
								<input
									type="text"
									placeholder="Type DELETE here"
									className={`w-full mt-2 px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-900 text-white" : "border-gray-300 bg-white text-gray-900"}`}
								/>
							</div>
							<div className="flex items-center gap-3">
								<button
									onClick={handleDeleteAccount}
									className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
								>
									Yes, Delete My Account
								</button>
								<button
									onClick={() => setShowDeleteConfirm(false)}
									className={`flex-1 px-4 py-3 rounded-lg font-medium ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
