// src/pages/VerifyEmail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";

export default function VerifyEmail() {
	const { isDark } = useTheme();
	const { token } = useParams();
	const navigate = useNavigate();
	const [message, setMessage] = useState("Verifying your email...");

	useEffect(() => {
		const verify = async () => {
			try {
				const res = await fetch(
					`http://localhost:8000/api/v1/auth/verify-email/${token}`,
					{
						method: "GET",
					}
				);
				const data = await res.json();

				if (res.ok) {
					setMessage(
						"Email verified successfully! Redirecting to login..."
					);
					setTimeout(() => navigate("/login"), 2000); // redirect after 2s
				} else {
					setMessage(data.message || "Verification failed.");
				}
			} catch (err) {
				setMessage("Something went wrong. Try again later.");
			}
		};
		verify();
	}, [token, navigate]);

	return (
		<div
			className={`min-h-screen flex items-center justify-center p-4 ${
				isDark ? "bg-gray-950" : "bg-gray-50"
			}`}
		>
			<div
				className={`${
					isDark
						? "bg-gray-900 border-gray-800"
						: "bg-white border-gray-200"
				} p-8 rounded-xl shadow-lg text-center border`}
			>
				<h2
					className={`text-2xl font-bold mb-4 ${
						isDark ? "text-white" : "text-gray-900"
					}`}
				>
					Email Verification
				</h2>
				<p
					className={`text-lg ${
						isDark ? "text-gray-300" : "text-gray-600"
					}`}
				>
					{message}
				</p>
			</div>
		</div>
	);
}
