import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../api/auth.api";
import { useTheme } from "./ThemeContext.jsx";

export default function EmailVerification() {
	const { token } = useParams();
	const navigate = useNavigate();
	const { isDark } = useTheme();
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const verify = async () => {
			try {
				await verifyEmail(token);
				setMessage(
					"Email verified successfully! Redirecting to login..."
				);
				setTimeout(() => navigate("/login?verified=true"), 3000);
			} catch (error) {
				setMessage(
					error.response?.data?.message || "Verification failed"
				);
			} finally {
				setLoading(false);
			}
		};
		verify();
	}, [token, navigate]);

	return (
		<div
			className="min-h-screen flex items-center justify-center p-4"
			style={{ background: isDark ? "#0f172a" : "#f8fafc" }}
		>
			<div
				className={`p-8 rounded-2xl shadow-xl max-w-md w-full ${
					isDark ? "bg-gray-800" : "bg-white"
				}`}
			>
				<div className="text-center">
					<div className="mb-6">
						<img
							src="/favicon.ico"
							alt="Logo"
							className="w-20 h-20 mx-auto"
						/>
					</div>
					<h2
						className={`text-2xl font-bold mb-4 ${
							isDark ? "text-white" : "text-gray-900"
						}`}
					>
						Email Verification
					</h2>

					{loading ? (
						<div className="flex flex-col items-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mb-4"></div>
							<p
								className={
									isDark ? "text-gray-300" : "text-gray-600"
								}
							>
								Verifying your email...
							</p>
						</div>
					) : (
						<div>
							<p
								className={`mb-6 ${
									isDark ? "text-gray-300" : "text-gray-600"
								}`}
							>
								{message}
							</p>
							<button
								onClick={() => navigate("/login")}
								className="px-6 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:opacity-90 transition"
							>
								Go to Login
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
