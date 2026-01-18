import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { useTheme } from "../ThemeContext.jsx";
import { createProject } from "../../api/project.api.js";
import {
	ArrowLeftIcon,
	FolderIcon,
	DocumentTextIcon,
	UserGroupIcon,
	CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function CreateProjectPage() {
	const { user } = useAuth();
	const { isDark } = useTheme();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		visibility: "private",
	});
	const [errors, setErrors] = useState({});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Project name is required";
		} else if (formData.name.length < 3) {
			newErrors.name = "Project name must be at least 3 characters";
		} else if (formData.name.length > 100) {
			newErrors.name = "Project name must be less than 100 characters";
		}

		if (formData.description.length > 500) {
			newErrors.description =
				"Description must be less than 500 characters";
		}

		return newErrors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const validationErrors = validateForm();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		setLoading(true);
		try {
			const response = await createProject(formData);
			const project = response?.data?.data?.project;

			if (project?._id) {
				// Redirect to the new project
				navigate(`/dashboard/projects/${response.data.project._id}`);
			} else {
				throw new Error("Failed to create project");
			}
		} catch (error) {
			console.error("Error creating project:", error);
			setErrors({
				submit:
					error.response?.data?.message ||
					"Failed to create project. Please try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
		>
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<button
						onClick={() => navigate(-1)}
						className={`flex items-center gap-2 mb-6 ${
							isDark
								? "text-gray-300 hover:text-white"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						<ArrowLeftIcon className="h-5 w-5" />
						<span>Back</span>
					</button>

					<h1
						className={`text-3xl font-bold mb-2 ${
							isDark ? "text-white" : "text-gray-900"
						}`}
					>
						Create New Project
					</h1>
					<p className={isDark ? "text-gray-400" : "text-gray-600"}>
						Set up your project details and start collaborating with
						your team.
					</p>
				</div>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Main Form */}
					<div className="lg:col-span-2">
						<div
							className={`rounded-2xl border ${
								isDark
									? "bg-gray-900/50 border-gray-800"
									: "bg-white border-gray-200"
							} p-6`}
						>
							<form onSubmit={handleSubmit}>
								{/* Project Name */}
								<div className="mb-6">
									<label
										htmlFor="name"
										className={`block text-sm font-medium mb-2 ${
											isDark
												? "text-gray-300"
												: "text-gray-700"
										}`}
									>
										Project Name *
									</label>
									<div className="relative">
										<div className="absolute left-3 top-1/2 transform -translate-y-1/2">
											<FolderIcon
												className={`h-5 w-5 ${
													isDark
														? "text-gray-500"
														: "text-gray-400"
												}`}
											/>
										</div>
										<input
											type="text"
											id="name"
											name="name"
											value={formData.name}
											onChange={handleChange}
											placeholder="e.g., Website Redesign, Mobile App Development"
											className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
												errors.name
													? "border-red-500 focus:border-red-500 focus:ring-red-500"
													: isDark
														? "border-gray-700 bg-gray-800 focus:border-lime-500 focus:ring-lime-500/50"
														: "border-gray-300 focus:border-lime-500 focus:ring-lime-500/50"
											} focus:ring-2 focus:outline-none transition ${
												isDark
													? "text-white"
													: "text-gray-900"
											}`}
										/>
									</div>
									{errors.name && (
										<p className="mt-2 text-sm text-red-500">
											{errors.name}
										</p>
									)}
								</div>

								{/* Description */}
								<div className="mb-6">
									<label
										htmlFor="description"
										className={`block text-sm font-medium mb-2 ${
											isDark
												? "text-gray-300"
												: "text-gray-700"
										}`}
									>
										Description
									</label>
									<div className="relative">
										<div className="absolute left-3 top-3">
											<DocumentTextIcon
												className={`h-5 w-5 ${
													isDark
														? "text-gray-500"
														: "text-gray-400"
												}`}
											/>
										</div>
										<textarea
											id="description"
											name="description"
											value={formData.description}
											onChange={handleChange}
											placeholder="Describe your project goals, objectives, and scope..."
											rows="4"
											className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
												errors.description
													? "border-red-500 focus:border-red-500 focus:ring-red-500"
													: isDark
														? "border-gray-700 bg-gray-800 focus:border-lime-500 focus:ring-lime-500/50"
														: "border-gray-300 focus:border-lime-500 focus:ring-lime-500/50"
											} focus:ring-2 focus:outline-none transition resize-none ${
												isDark
													? "text-white"
													: "text-gray-900"
											}`}
										/>
									</div>
									<div className="flex justify-between mt-2">
										{errors.description ? (
											<p className="text-sm text-red-500">
												{errors.description}
											</p>
										) : (
											<p
												className={`text-xs ${
													isDark
														? "text-gray-500"
														: "text-gray-500"
												}`}
											>
												Optional but recommended
											</p>
										)}
										<p
											className={`text-xs ${
												isDark
													? "text-gray-500"
													: "text-gray-500"
											}`}
										>
											{formData.description.length}/500
										</p>
									</div>
								</div>

								{/* Visibility */}
								<div className="mb-8">
									<label
										className={`block text-sm font-medium mb-4 ${
											isDark
												? "text-gray-300"
												: "text-gray-700"
										}`}
									>
										Visibility
									</label>
									<div className="grid grid-cols-2 gap-4">
										<button
											type="button"
											onClick={() =>
												setFormData((prev) => ({
													...prev,
													visibility: "private",
												}))
											}
											className={`p-4 rounded-xl border text-left transition ${
												formData.visibility ===
												"private"
													? isDark
														? "border-lime-500 bg-lime-900/20 text-lime-400"
														: "border-lime-500 bg-lime-50 text-lime-700"
													: isDark
														? "border-gray-700 hover:border-gray-600 hover:bg-gray-800 text-gray-300"
														: "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
											}`}
										>
											<div className="flex items-center gap-3 mb-2">
												<div
													className={`p-2 rounded-lg ${
														isDark
															? "bg-gray-800"
															: "bg-gray-100"
													}`}
												>
													<svg
														className="h-5 w-5"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
														/>
													</svg>
												</div>
											</div>
											<h3 className="font-semibold">
												Private
											</h3>
											<p className="text-sm mt-1 opacity-80">
												Only invited members can access
											</p>
										</button>

										<button
											type="button"
											onClick={() =>
												setFormData((prev) => ({
													...prev,
													visibility: "public",
												}))
											}
											className={`p-4 rounded-xl border text-left transition ${
												formData.visibility === "public"
													? isDark
														? "border-lime-500 bg-lime-900/20 text-lime-400"
														: "border-lime-500 bg-lime-50 text-lime-700"
													: isDark
														? "border-gray-700 hover:border-gray-600 hover:bg-gray-800 text-gray-300"
														: "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
											}`}
										>
											<div className="flex items-center gap-3 mb-2">
												<div
													className={`p-2 rounded-lg ${
														isDark
															? "bg-gray-800"
															: "bg-gray-100"
													}`}
												>
													<svg
														className="h-5 w-5"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
														/>
													</svg>
												</div>
											</div>
											<h3 className="font-semibold">
												Public
											</h3>
											<p className="text-sm mt-1 opacity-80">
												Visible to anyone with the link
											</p>
										</button>
									</div>
								</div>

								{/* Submit Error */}
								{errors.submit && (
									<div
										className={`mb-6 p-4 rounded-lg ${
											isDark
												? "bg-red-900/30 border border-red-800"
												: "bg-red-50 border border-red-200"
										}`}
									>
										<p className="text-red-500 text-sm">
											{errors.submit}
										</p>
									</div>
								)}

								{/* Submit Button */}
								<div className="flex items-center justify-between">
									<button
										type="button"
										onClick={() => navigate(-1)}
										className={`px-6 py-3 rounded-lg font-medium transition ${
											isDark
												? "text-gray-300 hover:text-white"
												: "text-gray-600 hover:text-gray-900"
										}`}
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={loading}
										className={`px-8 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
									>
										{loading ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												Creating Project...
											</>
										) : (
											<>
												<CheckCircleIcon className="h-5 w-5" />
												Create Project
											</>
										)}
									</button>
								</div>
							</form>
						</div>
					</div>

					{/* Sidebar - Tips & Info */}
					<div>
						<div
							className={`rounded-2xl border ${
								isDark
									? "bg-gray-900/50 border-gray-800"
									: "bg-white border-gray-200"
							} p-6 mb-6`}
						>
							<h3
								className={`text-lg font-bold mb-4 ${
									isDark ? "text-white" : "text-gray-900"
								}`}
							>
								<UserGroupIcon className="h-5 w-5 inline mr-2" />
								Project Setup Tips
							</h3>
							<ul className="space-y-4">
								<li className="flex items-start gap-3">
									<div
										className={`h-6 w-6 rounded-full flex items-center justify-center ${
											isDark
												? "bg-lime-900/30 text-lime-400"
												: "bg-lime-100 text-lime-600"
										}`}
									>
										<span className="text-xs font-bold">
											1
										</span>
									</div>
									<div>
										<p
											className={`font-medium ${
												isDark
													? "text-gray-300"
													: "text-gray-700"
											}`}
										>
											Clear Name
										</p>
										<p
											className={`text-sm ${
												isDark
													? "text-gray-500"
													: "text-gray-600"
											}`}
										>
											Use a descriptive name that team
											members will recognize.
										</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<div
										className={`h-6 w-6 rounded-full flex items-center justify-center ${
											isDark
												? "bg-lime-900/30 text-lime-400"
												: "bg-lime-100 text-lime-600"
										}`}
									>
										<span className="text-xs font-bold">
											2
										</span>
									</div>
									<div>
										<p
											className={`font-medium ${
												isDark
													? "text-gray-300"
													: "text-gray-700"
											}`}
										>
											Add Details
										</p>
										<p
											className={`text-sm ${
												isDark
													? "text-gray-500"
													: "text-gray-600"
											}`}
										>
											Include goals, deadlines, and key
											requirements in the description.
										</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<div
										className={`h-6 w-6 rounded-full flex items-center justify-center ${
											isDark
												? "bg-lime-900/30 text-lime-400"
												: "bg-lime-100 text-lime-600"
										}`}
									>
										<span className="text-xs font-bold">
											3
										</span>
									</div>
									<div>
										<p
											className={`font-medium ${
												isDark
													? "text-gray-300"
													: "text-gray-700"
											}`}
										>
											Invite Team
										</p>
										<p
											className={`text-sm ${
												isDark
													? "text-gray-500"
													: "text-gray-600"
											}`}
										>
											After creating, invite team members
											from the project settings.
										</p>
									</div>
								</li>
							</ul>
						</div>

						{/* Owner Info */}
						<div
							className={`rounded-2xl border ${
								isDark
									? "bg-gray-900/50 border-gray-800"
									: "bg-white border-gray-200"
							} p-6`}
						>
							<h3
								className={`text-lg font-bold mb-4 ${
									isDark ? "text-white" : "text-gray-900"
								}`}
							>
								Project Owner
							</h3>
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
									{user?.username?.charAt(0).toUpperCase() ||
										"U"}
								</div>
								<div>
									<h4
										className={`font-semibold ${
											isDark
												? "text-white"
												: "text-gray-900"
										}`}
									>
										{user?.username}
									</h4>
									<p
										className={`text-sm ${
											isDark
												? "text-gray-400"
												: "text-gray-600"
										}`}
									>
										{user?.email}
									</p>
								</div>
							</div>
							<p
								className={`text-sm mt-4 ${
									isDark ? "text-gray-400" : "text-gray-600"
								}`}
							>
								As the project owner, you'll have full
								administrative control over all project
								settings, members, and content.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
