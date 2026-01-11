import { useState } from "react";
import { register } from "../api/auth.api";
import { useTheme } from "./ThemeContext.jsx";
import {
	EyeIcon,
	EyeSlashIcon,
	EnvelopeIcon,
	LockClosedIcon,
	UserIcon,
	UserCircleIcon,
	ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function Register() {
	const { isDark } = useTheme();

	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		fullName: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		// Frontend validation
		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (formData.password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		if (!formData.username.match(/^[a-z0-9_]+$/)) {
			setError(
				"Username must be lowercase letters, numbers, or underscores only"
			);
			return;
		}

		setLoading(true);

		try {
			// ✅ CONNECTS TO YOUR BACKEND - Send only what backend expects
			const response = await register({
				username: formData.username.toLowerCase(),
				email: formData.email,
				password: formData.password,
				fullName: formData.fullName || undefined,
			});

			console.log("Registration success", response.data);

			// Just show success and redirect to login
			window.location.href = "/login?registered=true";
		} catch (err) {
			// ✅ YOUR BACKEND ERROR HANDLING
			setError(err.response?.data?.message || "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field) => (e) => {
		setFormData((prev) => ({
			...prev,
			[field]:
				field === "username"
					? e.target.value.toLowerCase()
					: e.target.value,
		}));
	};

	const bgGradient = isDark
		? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
		: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)";

	// Lime accent colors to match your favicon
	const limePrimary = "#a3e635"; // Your lime color
	const limeDark = "#84cc16";
	const limeLight = "#d9f99d";

	return (
		<div
			className="min-h-screen flex items-center justify-center p-4"
			style={{ background: bgGradient }}
		>
			{/* Main Card */}
			<div
				className={`relative w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-xl border ${
					isDark
						? "bg-gray-900/80 border-gray-700"
						: "bg-white/90 border-gray-200"
				}`}
			>
				{/* Header */}
				<div className="text-center mb-8">
					<div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 overflow-hidden">
						<img
							src="/favicon.ico"
							alt="App Icon"
							className="absolute inset-0 w-full h-full object-cover opacity-100"
						/>
					</div>

					<h1
						className="text-3xl font-bold bg-clip-text text-transparent"
						style={{
							backgroundImage: `linear-gradient(135deg, ${limePrimary} 0%, #8b5cf6 100%)`,
						}}
					>
						Join Project Camp
					</h1>
					<p
						className={`mt-2 ${
							isDark ? "text-gray-300" : "text-gray-600"
						}`}
					>
						Create your account and start collaborating
					</p>
				</div>

				{/* Registration Form */}
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Full Name - Optional */}
					<div>
						<label
							className={`block text-sm font-medium mb-2 ${
								isDark ? "text-gray-300" : "text-gray-700"
							}`}
						>
							Full Name (Optional)
						</label>
						<div className="relative">
							<UserCircleIcon
								className={`absolute left-3 top-3 h-5 w-5 ${
									isDark ? "text-gray-400" : "text-gray-500"
								}`}
							/>
							<input
								type="text"
								value={formData.fullName}
								onChange={handleChange("fullName")}
								placeholder="John Doe"
								className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none ${
									isDark
										? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-lime-500"
										: "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-lime-500"
								}`}
							/>
						</div>
					</div>

					{/* Username - Required */}
					<div>
						<label
							className={`block text-sm font-medium mb-2 ${
								isDark ? "text-gray-300" : "text-gray-700"
							}`}
						>
							Username *
						</label>
						<div className="relative">
							<UserIcon
								className={`absolute left-3 top-3 h-5 w-5 ${
									isDark ? "text-gray-400" : "text-gray-500"
								}`}
							/>
							<input
								type="text"
								required
								value={formData.username}
								onChange={handleChange("username")}
								placeholder="john_doe (lowercase only)"
								className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none ${
									isDark
										? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-lime-500"
										: "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-lime-500"
								}`}
							/>
						</div>
						<p
							className={`mt-1 text-xs ${
								isDark ? "text-gray-400" : "text-gray-500"
							}`}
						>
							Lowercase letters, numbers, and underscores only
						</p>
					</div>

					{/* Email - Required */}
					<div>
						<label
							className={`block text-sm font-medium mb-2 ${
								isDark ? "text-gray-300" : "text-gray-700"
							}`}
						>
							Email *
						</label>
						<div className="relative">
							<EnvelopeIcon
								className={`absolute left-3 top-3 h-5 w-5 ${
									isDark ? "text-gray-400" : "text-gray-500"
								}`}
							/>
							<input
								type="email"
								required
								value={formData.email}
								onChange={handleChange("email")}
								placeholder="you@example.com"
								className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none ${
									isDark
										? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-lime-500"
										: "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-lime-500"
								}`}
							/>
						</div>
					</div>

					{/* Password - Required */}
					<div>
						<label
							className={`block text-sm font-medium mb-2 ${
								isDark ? "text-gray-300" : "text-gray-700"
							}`}
						>
							Password *
						</label>
						<div className="relative">
							<LockClosedIcon
								className={`absolute left-3 top-3 h-5 w-5 ${
									isDark ? "text-gray-400" : "text-gray-500"
								}`}
							/>
							<input
								type={showPassword ? "text" : "password"}
								required
								value={formData.password}
								onChange={handleChange("password")}
								placeholder="At least 6 characters"
								className={`w-full pl-10 pr-12 py-3 rounded-xl border outline-none ${
									isDark
										? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-lime-500"
										: "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-lime-500"
								}`}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className={`absolute right-3 top-3 ${
									isDark ? "text-gray-400" : "text-gray-500"
								}`}
							>
								{showPassword ? (
									<EyeSlashIcon className="h-5 w-5" />
								) : (
									<EyeIcon className="h-5 w-5" />
								)}
							</button>
						</div>
					</div>

					{/* Confirm Password - Required */}
					<div>
						<label
							className={`block text-sm font-medium mb-2 ${
								isDark ? "text-gray-300" : "text-gray-700"
							}`}
						>
							Confirm Password *
						</label>
						<div className="relative">
							<LockClosedIcon
								className={`absolute left-3 top-3 h-5 w-5 ${
									isDark ? "text-gray-400" : "text-gray-500"
								}`}
							/>
							<input
								type={showConfirmPassword ? "text" : "password"}
								required
								value={formData.confirmPassword}
								onChange={handleChange("confirmPassword")}
								placeholder="Re-enter your password"
								className={`w-full pl-10 pr-12 py-3 rounded-xl border outline-none ${
									isDark
										? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-lime-500"
										: "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-lime-500"
								}`}
							/>
							<button
								type="button"
								onClick={() =>
									setShowConfirmPassword(!showConfirmPassword)
								}
								className={`absolute right-3 top-3 ${
									isDark ? "text-gray-400" : "text-gray-500"
								}`}
							>
								{showConfirmPassword ? (
									<EyeSlashIcon className="h-5 w-5" />
								) : (
									<EyeIcon className="h-5 w-5" />
								)}
							</button>
						</div>
					</div>

					{/* Password strength indicator */}
					{formData.password && (
						<div
							className={`p-3 rounded-lg ${
								isDark ? "bg-gray-800" : "bg-gray-100"
							}`}
						>
							<div className="flex items-center justify-between mb-1">
								<span
									className={`text-sm ${
										isDark
											? "text-gray-300"
											: "text-gray-700"
									}`}
								>
									Password strength:
								</span>
								<span
									className={`text-sm font-medium ${
										formData.password.length >= 8
											? "text-green-500"
											: formData.password.length >= 6
											? "text-yellow-500"
											: "text-red-500"
									}`}
								>
									{formData.password.length >= 8
										? "Strong"
										: formData.password.length >= 6
										? "Medium"
										: "Weak"}
								</span>
							</div>
							<div className="h-1 bg-gray-700 rounded-full overflow-hidden">
								<div
									className={`h-full transition-all duration-300 ${
										formData.password.length >= 8
											? "bg-green-500 w-full"
											: formData.password.length >= 6
											? "bg-yellow-500 w-2/3"
											: "bg-red-500 w-1/3"
									}`}
								></div>
							</div>
						</div>
					)}

					{/* Error from YOUR backend */}
					{error && (
						<div
							className={`p-3 rounded-lg ${
								isDark
									? "bg-red-900/30 text-red-200"
									: "bg-red-50 text-red-700"
							}`}
						>
							<div className="flex items-center">
								<svg
									className="w-5 h-5 mr-2"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clipRule="evenodd"
									/>
								</svg>
								{error}
							</div>
						</div>
					)}

					{/* Terms agreement */}
					<div
						className={`p-4 rounded-lg ${
							isDark ? "bg-gray-800/50" : "bg-gray-100"
						}`}
					>
						<div className="flex items-start">
							<input
								type="checkbox"
								id="terms"
								required
								className={`mt-1 mr-3 w-4 h-4 rounded ${
									isDark
										? "bg-gray-700 border-gray-600 text-lime-500"
										: "bg-white border-gray-300 text-lime-600"
								}`}
							/>
							<label
								htmlFor="terms"
								className={`text-sm ${
									isDark ? "text-gray-300" : "text-gray-700"
								}`}
							>
								I agree to the{" "}
								<a
									href="/terms"
									className="text-lime-500 hover:text-lime-600 hover:underline"
								>
									Terms of Service
								</a>{" "}
								and{" "}
								<a
									href="/privacy"
									className="text-lime-500 hover:text-lime-600 hover:underline"
								>
									Privacy Policy
								</a>
							</label>
						</div>
					</div>

					{/* Register button - Calls YOUR backend */}
					<button
						type="submit"
						disabled={loading}
						className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 group"
						style={{
							boxShadow: "0 4px 14px 0 rgba(163, 230, 53, 0.3)",
						}}
					>
						{loading ? (
							<>
								<svg
									className="animate-spin h-5 w-5 mr-2"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Creating account...
							</>
						) : (
							<>
								Create Account
								<ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
							</>
						)}
					</button>

					{/* Login link */}
					<div className="text-center pt-4">
						<p
							className={`text-sm ${
								isDark ? "text-gray-400" : "text-gray-600"
							}`}
						>
							Already have an account?{" "}
							<a
								href="/login"
								className={`font-medium ${
									isDark
										? "text-lime-400 hover:text-lime-300"
										: "text-lime-600 hover:text-lime-800"
								}`}
							>
								Sign in here
							</a>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
}
