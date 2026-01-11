import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext.jsx";
import { resetForgotPassword } from "../api/auth.api";
import {
	LockClosedIcon,
	CheckCircleIcon,
	XCircleIcon,
} from "@heroicons/react/24/outline";

export default function ResetPassword() {
	const { isDark } = useTheme();
	const { resetToken } = useParams();
	const navigate = useNavigate();

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [tokenValid, setTokenValid] = useState(true);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (newPassword.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setLoading(true);

		try {
			await resetForgotPassword(resetToken, newPassword);
			setSuccess(true);

			// Auto-redirect to login after 3 seconds
			setTimeout(() => {
				navigate("/login");
			}, 3000);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to reset password");
			setTokenValid(false);
		} finally {
			setLoading(false);
		}
	};

	const bgGradient = isDark
		? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
		: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)";

	if (!tokenValid) {
		return (
			<div
				className="min-h-screen flex items-center justify-center p-4"
				style={{ background: bgGradient }}
			>
				<div
					className={`relative w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-xl border text-center ${
						isDark
							? "bg-gray-900/80 border-gray-700"
							: "bg-white/90 border-gray-200"
					}`}
				>
					<XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
					<h1 className="text-2xl font-bold mb-4">
						Invalid or Expired Link
					</h1>
					<p
						className={`mb-6 ${
							isDark ? "text-gray-300" : "text-gray-600"
						}`}
					>
						This password reset link is invalid or has expired.
						Please request a new reset link.
					</p>
					<a
						href="/forgot-password"
						className={`inline-block py-3 px-6 rounded-xl font-medium ${
							isDark
								? "bg-blue-600 text-white hover:bg-blue-700"
								: "bg-blue-500 text-white hover:bg-blue-600"
						}`}
					>
						Request New Link
					</a>
				</div>
			</div>
		);
	}

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
						{success ? "Password Updated!" : "Create New Password"}
					</h1>
					<p
						className={`mt-2 ${
							isDark ? "text-gray-300" : "text-gray-600"
						}`}
					>
						{success
							? "Your password has been successfully reset"
							: "Enter your new password below"}
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
						<h3 className="text-lg font-semibold mb-2">Success!</h3>
						<p
							className={`mb-4 ${
								isDark ? "text-gray-300" : "text-gray-600"
							}`}
						>
							Your password has been updated successfully.
							Redirecting to login...
						</p>
						<a
							href="/login"
							className={`inline-block py-2 px-4 rounded-lg font-medium ${
								isDark
									? "bg-green-600 text-white hover:bg-green-700"
									: "bg-green-500 text-white hover:bg-green-600"
							}`}
						>
							Go to Login
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
								New Password
							</label>
							<div className="relative">
								<LockClosedIcon
									className={`absolute left-3 top-3 h-5 w-5 ${
										isDark
											? "text-gray-400"
											: "text-gray-500"
									}`}
								/>
								<input
									type="password"
									required
									value={newPassword}
									onChange={(e) =>
										setNewPassword(e.target.value)
									}
									placeholder="Enter new password"
									className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none ${
										isDark
											? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"
									}`}
								/>
							</div>
						</div>

						<div>
							<label
								className={`block text-sm font-medium mb-2 ${
									isDark ? "text-gray-300" : "text-gray-700"
								}`}
							>
								Confirm New Password
							</label>
							<div className="relative">
								<LockClosedIcon
									className={`absolute left-3 top-3 h-5 w-5 ${
										isDark
											? "text-gray-400"
											: "text-gray-500"
									}`}
								/>
								<input
									type="password"
									required
									value={confirmPassword}
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
									placeholder="Confirm new password"
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
							{loading ? "Updating..." : "Update Password"}
						</button>

						<p
							className={`text-center text-sm ${
								isDark ? "text-gray-400" : "text-gray-600"
							}`}
						>
							<a
								href="/login"
								className={`font-medium ${
									isDark
										? "text-blue-400 hover:text-blue-300"
										: "text-blue-600 hover:text-blue-800"
								}`}
							>
								Back to Login
							</a>
						</p>
					</form>
				)}
			</div>
		</div>
	);
}
