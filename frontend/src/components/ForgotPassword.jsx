import { useState } from "react";
import { useTheme } from "./ThemeContext.jsx";
import { forgotPasswordRequest } from "../api/auth.api";
import {
	EnvelopeIcon,
	ArrowLeftIcon,
	CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function ForgotPassword() {
	const { isDark } = useTheme();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await forgotPasswordRequest(email);
			setSuccess(true);
		} catch (err) {
			setError(
				err.response?.data?.message || "Failed to send reset email"
			);
		} finally {
			setLoading(false);
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
			<div
				className={`relative w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-xl border ${
					isDark
						? "bg-gray-900/80 border-gray-700"
						: "bg-white/90 border-gray-200"
				}`}
			>
				{/* Back to login */}
				<a
					href="/login"
					className={`inline-flex items-center text-sm mb-6 ${
						isDark
							? "text-blue-400 hover:text-blue-300"
							: "text-blue-600 hover:text-blue-800"
					}`}
				>
					<ArrowLeftIcon className="h-4 w-4 mr-1" />
					Back to login
				</a>

				{/* Header */}
				<div className="text-center mb-8">
					<div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden">
						<img
							src="/favicon.ico"
							alt="App Icon"
							className="absolute inset-0 w-full h-full object-cover opacity-100"
						/>
					</div>

					<h1 className="text-2xl font-bold text-black">
						Reset Password
					</h1>
					<p
						className={`mt-2 ${
							isDark ? "text-gray-300" : "text-gray-600"
						}`}
					>
						{success
							? "Check your email for reset instructions"
							: "Enter your email to receive a reset link"}
					</p>
				</div>

				{success ? (
					<div
						className={`p-4 rounded-xl text-center ${
							isDark
								? "bg-green-900/30 border border-green-800"
								: "bg-green-50 border border-green-200"
						}`}
					>
						<CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							Email Sent!
						</h3>
						<p
							className={`mb-4 ${
								isDark ? "text-gray-300" : "text-gray-600"
							}`}
						>
							We've sent password reset instructions to{" "}
							<strong>{email}</strong>. The link will expire in 20
							minutes.
						</p>
						<a
							href="/login"
							className={`inline-block py-2 px-4 rounded-lg font-medium ${
								isDark
									? "bg-green-600 text-white hover:bg-green-700"
									: "bg-green-500 text-white hover:bg-green-600"
							}`}
						>
							Return to Login
						</a>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label
								className={`block text-sm font-medium mb-2 ${
									isDark ? "text-gray-300" : "text-gray-700"
								}`}
							>
								Email Address
							</label>
							<div className="relative">
								<EnvelopeIcon
									className={`absolute left-3 top-3 h-5 w-5 ${
										isDark
											? "text-gray-400"
											: "text-gray-500"
									}`}
								/>
								<input
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Enter your registered email"
									className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none ${
										isDark
											? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"
									}`}
								/>
							</div>
						</div>

						{error && (
							<div
								className={`p-3 rounded-lg ${
									isDark
										? "bg-red-900/30 text-red-200"
										: "bg-red-50 text-red-700"
								}`}
							>
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
						>
							{loading ? "Sending..." : "Send Reset Link"}
						</button>

						<p
							className={`text-center text-sm ${
								isDark ? "text-gray-400" : "text-gray-600"
							}`}
						>
							Remember your password?{" "}
							<a
								href="/login"
								className={`font-medium ${
									isDark
										? "text-blue-400 hover:text-blue-300"
										: "text-blue-600 hover:text-blue-800"
								}`}
							>
								Sign in
							</a>
						</p>
					</form>
				)}
			</div>
		</div>
	);
}
