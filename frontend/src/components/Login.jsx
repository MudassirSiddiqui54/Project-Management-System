import { useState } from "react";
import { login as loginApi, resendEmailVerification } from "../api/auth.api";
import { useTheme } from "./ThemeContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import {
	EyeIcon,
	EyeSlashIcon,
	EnvelopeIcon,
	LockClosedIcon,
	ArrowRightIcon,
	ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function Login() {
	const { isDark } = useTheme();
	const { login } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [needsVerification, setNeedsVerification] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await loginApi({ email, password });
			login(response.data.data);
			setNeedsVerification(false);
			setError("");
			window.location.href = "/dashboard";
		} catch (err) {
			console.log("LOGIN ERROR RAW:", err);
			console.log("LOGIN ERROR RESPONSE:", err.response);
			const status = err.response?.status;
			const message = err.response?.data?.message;

			if (status === 403 && message?.toLowerCase().includes("verify")) {
				setNeedsVerification(true);
				setError(message);
			} else {
				setNeedsVerification(false);
				setError(message || "Login failed. Check credentials.");
			}
		} finally {
			setLoading(false);
		}
	};
	const handleResendVerification = async () => {
		try {
			await resendEmailVerification({ email }); // pass email from state
			setError("Verification email sent. Check your inbox.");
			setNeedsVerification(false);
		} catch (err) {
			const status = err.response?.status;
			const message = err.response?.data?.message;

			if (status === 409) {
				setNeedsVerification(false);
				setError("Email already verified. Please log in.");
			} else {
				setError(message || "Failed to resend verification email");
			}
		}
	};

	const bgGradient = isDark
		? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
		: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)";

	return (
		<div
			className="min-h-screen flex items-center justify-center p-4"
			style={{ background: bgGradient }}
		>
			{/* Simple card - NO unnecessary elements */}
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
							backgroundImage:
								"linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
						}}
					>
						Project Camp
					</h1>
					<p
						className={`mt-2 ${
							isDark ? "text-gray-300" : "text-gray-600"
						}`}
					>
						Sign in to your account
					</p>
				</div>

				{/* Form - ONLY connects to YOUR backend */}
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Email */}
					<div>
						<label
							className={`block text-sm font-medium mb-2 ${
								isDark ? "text-gray-300" : "text-gray-700"
							}`}
						>
							Email
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
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your email"
								className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none ${
									isDark
										? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
										: "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"
								}`}
							/>
						</div>
					</div>

					{/* Password */}
					<div>
						<label
							className={`block text-sm font-medium mb-2 ${
								isDark ? "text-gray-300" : "text-gray-700"
							}`}
						>
							Password
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
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter your password"
								className={`w-full pl-10 pr-12 py-3 rounded-xl border outline-none ${
									isDark
										? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
										: "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"
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

					{/* Forgot password link - Points to YOUR backend endpoint */}
					<div className="text-right">
						<a
							href="/forgot-password"
							className={`text-sm ${
								isDark
									? "text-blue-400 hover:text-blue-300"
									: "text-blue-600 hover:text-blue-800"
							}`}
						>
							Forgot password?
						</a>
					</div>

					{/* Error from backend */}
					{error && (
						<div
							className={`p-3 rounded-lg ${
								isDark
									? "bg-red-900/30 text-red-200"
									: "bg-red-50 text-red-700"
							}`}
						>
							<p>{error}</p>

							{needsVerification && (
								<p className="mt-2 text-sm">
									<button
										type="button"
										onClick={handleResendVerification}
										className="underline font-medium text-lime-500 hover:text-lime-400"
									>
										Resend verification email
									</button>
								</p>
							)}
						</div>
					)}

					{/* Login button - Calls YOUR backend */}
					<button
						type="submit"
						disabled={loading}
						className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
					>
						{loading ? "Signing in..." : "Sign In"}
					</button>

					{/* Register link - Points to YOUR frontend register page */}
					<div className="text-center pt-4">
						<p
							className={`text-sm ${
								isDark ? "text-gray-400" : "text-gray-600"
							}`}
						>
							Don't have an account?{" "}
							<a
								href="/register"
								className={`font-medium ${
									isDark
										? "text-blue-400 hover:text-blue-300"
										: "text-blue-600 hover:text-blue-800"
								}`}
							>
								Create one
							</a>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
}
