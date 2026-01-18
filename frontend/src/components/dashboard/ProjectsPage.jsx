import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { useTheme } from "../ThemeContext.jsx";
import { getProjects, deleteProject } from "../../api/project.api.js";
import {
	FolderIcon,
	PlusIcon,
	UserGroupIcon,
	ClockIcon,
	CheckCircleIcon,
	TrashIcon,
	PencilIcon,
	EllipsisVerticalIcon,
	MagnifyingGlassIcon,
	FunnelIcon,
	ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function ProjectsPage() {
	const { user } = useAuth();
	const { isDark } = useTheme();
	const navigate = useNavigate();
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [sortBy, setSortBy] = useState("newest");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
	const [error, setError] = useState("");

	// Fetch projects on mount
	useEffect(() => {
		fetchProjects();
	}, []);

	const fetchProjects = async () => {
		setLoading(true);
		setError("");
		try {
			const response = await getProjects();
			setProjects(response.data?.projects || []);
		} catch (error) {
			console.error("Failed to fetch projects:", error);
			setError("Failed to load projects. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Handle project deletion
	const handleDeleteProject = async (projectId, projectName) => {
		if (
			!window.confirm(
				`Are you sure you want to delete "${projectName}"? This action cannot be undone.`
			)
		) {
			return;
		}

		try {
			await deleteProject(projectId);
			// Remove from local state
			setProjects((prev) => prev.filter((p) => p._id !== projectId));
			setShowDeleteConfirm(null);
		} catch (error) {
			console.error("Failed to delete project:", error);
			alert("Failed to delete project. Please try again.");
		}
	};

	// Filter and sort projects
	const filteredProjects = projects
		.filter((project) => {
			// Search filter
			const matchesSearch =
				project.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				project.description
					?.toLowerCase()
					.includes(searchQuery.toLowerCase());

			// Status filter
			const matchesStatus =
				statusFilter === "all" || project.status === statusFilter;

			return matchesSearch && matchesStatus;
		})
		.sort((a, b) => {
			// Sort logic
			switch (sortBy) {
				case "newest":
					return new Date(b.createdAt) - new Date(a.createdAt);
				case "oldest":
					return new Date(a.createdAt) - new Date(b.createdAt);
				case "name_asc":
					return a.name.localeCompare(b.name);
				case "name_desc":
					return b.name.localeCompare(a.name);
				default:
					return 0;
			}
		});

	// Get status badge style
	const getStatusBadge = (status) => {
		const styles = {
			active: isDark
				? "bg-green-900/30 text-green-400"
				: "bg-green-100 text-green-700",
			completed: isDark
				? "bg-blue-900/30 text-blue-400"
				: "bg-blue-100 text-blue-700",
			archived: isDark
				? "bg-gray-800 text-gray-400"
				: "bg-gray-100 text-gray-700",
			planning: isDark
				? "bg-yellow-900/30 text-yellow-400"
				: "bg-yellow-100 text-yellow-700",
		};
		return (
			styles[status] ||
			(isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-700")
		);
	};

	// Get role badge style
	const getRoleBadge = (project) => {
		const userRole = project.members?.find(
			(member) =>
				member.user?._id === user?._id || member.user === user?._id
		)?.role;

		if (project.owner?._id === user?._id || project.owner === user?._id) {
			return isDark
				? "bg-purple-900/30 text-purple-400"
				: "bg-purple-100 text-purple-700";
		}

		if (userRole === "admin") {
			return isDark
				? "bg-red-900/30 text-red-400"
				: "bg-red-100 text-red-700";
		}

		return isDark
			? "bg-gray-800 text-gray-400"
			: "bg-gray-100 text-gray-700";
	};

	// Get member count
	const getMemberCount = (project) => {
		return project.members?.length || 1; // At least owner
	};

	// Format date
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<div
			className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
		>
			<div className="p-4 md:p-8">
				{/* Header */}
				<div className="mb-8">
					<h1
						className={`text-3xl font-bold mb-2 ${
							isDark ? "text-white" : "text-gray-900"
						}`}
					>
						Projects
					</h1>
					<p className={isDark ? "text-gray-400" : "text-gray-600"}>
						Manage all your projects in one place
					</p>
				</div>

				{/* Action Bar */}
				<div
					className={`rounded-2xl border ${
						isDark
							? "bg-gray-900/50 border-gray-800"
							: "bg-white border-gray-200"
					} p-4 md:p-6 mb-6`}
				>
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						{/* Search Bar */}
						<div className="relative flex-1">
							<div className="absolute left-3 top-1/2 transform -translate-y-1/2">
								<MagnifyingGlassIcon
									className={`h-5 w-5 ${
										isDark
											? "text-gray-500"
											: "text-gray-400"
									}`}
								/>
							</div>
							<input
								type="text"
								placeholder="Search projects..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
									isDark
										? "border-gray-700 bg-gray-800 text-white focus:border-lime-500"
										: "border-gray-300 bg-white text-gray-900 focus:border-lime-500"
								} focus:ring-2 focus:ring-lime-500/20 focus:outline-none`}
							/>
						</div>

						{/* Filters and Actions */}
						<div className="flex items-center gap-3">
							{/* Status Filter */}
							<div className="relative">
								<select
									value={statusFilter}
									onChange={(e) =>
										setStatusFilter(e.target.value)
									}
									className={`px-4 py-2 rounded-lg border appearance-none pr-8 ${
										isDark
											? "border-gray-700 bg-gray-800 text-white"
											: "border-gray-300 bg-white text-gray-900"
									}`}
								>
									<option value="all">All Status</option>
									<option value="active">Active</option>
									<option value="completed">Completed</option>
									<option value="planning">Planning</option>
									<option value="archived">Archived</option>
								</select>
								<FunnelIcon
									className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
										isDark
											? "text-gray-400"
											: "text-gray-500"
									}`}
								/>
							</div>

							{/* Sort By */}
							<div className="relative">
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
									className={`px-4 py-2 rounded-lg border appearance-none pr-8 ${
										isDark
											? "border-gray-700 bg-gray-800 text-white"
											: "border-gray-300 bg-white text-gray-900"
									}`}
								>
									<option value="newest">Newest First</option>
									<option value="oldest">Oldest First</option>
									<option value="name_asc">Name A-Z</option>
									<option value="name_desc">Name Z-A</option>
								</select>
								<ArrowPathIcon
									className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
										isDark
											? "text-gray-400"
											: "text-gray-500"
									}`}
								/>
							</div>

							{/* Create Button */}
							<Link
								to="/dashboard/projects/new"
								className="px-4 py-2 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700 flex items-center gap-2"
							>
								<PlusIcon className="h-4 w-4" />
								<span className="hidden sm:inline">
									New Project
								</span>
							</Link>
						</div>
					</div>
				</div>

				{/* Error Message */}
				{error && (
					<div
						className={`mb-6 p-4 rounded-lg ${
							isDark
								? "bg-red-900/30 border border-red-800"
								: "bg-red-50 border border-red-200"
						}`}
					>
						<div className="flex items-center justify-between">
							<p className="text-red-500">{error}</p>
							<button
								onClick={fetchProjects}
								className="text-red-500 hover:text-red-600 font-medium"
							>
								Retry
							</button>
						</div>
					</div>
				)}

				{/* Loading State */}
				{loading ? (
					<div className="flex items-center justify-center py-20">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
					</div>
				) : (
					<>
						{/* Project Count */}
						<div className="mb-4">
							<p
								className={
									isDark ? "text-gray-400" : "text-gray-600"
								}
							>
								Showing {filteredProjects.length} of{" "}
								{projects.length} projects
							</p>
						</div>

						{/* Projects Grid */}
						{filteredProjects.length === 0 ? (
							<div
								className={`rounded-2xl border ${
									isDark
										? "bg-gray-900/50 border-gray-800"
										: "bg-white border-gray-200"
								} p-12 text-center`}
							>
								<FolderIcon
									className={`h-16 w-16 mx-auto mb-4 ${
										isDark
											? "text-gray-700"
											: "text-gray-300"
									}`}
								/>
								<h3
									className={`text-xl font-bold mb-2 ${
										isDark
											? "text-gray-300"
											: "text-gray-700"
									}`}
								>
									{searchQuery || statusFilter !== "all"
										? "No matching projects"
										: "No projects yet"}
								</h3>
								<p
									className={`mb-6 ${
										isDark
											? "text-gray-500"
											: "text-gray-500"
									}`}
								>
									{searchQuery || statusFilter !== "all"
										? "Try adjusting your search or filters"
										: "Create your first project to get started"}
								</p>
								<Link
									to="/dashboard/projects/new"
									className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700"
								>
									<PlusIcon className="h-4 w-4" />
									Create Project
								</Link>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredProjects.map((project) => (
									<div
										key={project._id}
										className={`rounded-2xl border ${
											isDark
												? "bg-gray-900/50 border-gray-800"
												: "bg-white border-gray-200"
										} overflow-hidden transition hover:shadow-lg`}
									>
										{/* Project Header */}
										<div
											className={`p-6 border-b ${
												isDark
													? "border-gray-800"
													: "border-gray-100"
											}`}
										>
											<div className="flex items-start justify-between mb-4">
												<div className="flex items-center gap-3">
													<div
														className={`h-12 w-12 rounded-lg ${
															isDark
																? "bg-gray-800"
																: "bg-gray-100"
														} flex items-center justify-center`}
													>
														<FolderIcon className="h-6 w-6 text-lime-500" />
													</div>
													<div>
														<h3
															className={`font-bold text-lg mb-1 ${
																isDark
																	? "text-white"
																	: "text-gray-900"
															}`}
														>
															{project.name}
														</h3>
														<div className="flex items-center gap-2">
															<span
																className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(
																	project.status
																)}`}
															>
																{project.status
																	?.charAt(0)
																	.toUpperCase() +
																	project.status?.slice(
																		1
																	) ||
																	"Active"}
															</span>
															<span
																className={`text-xs px-2 py-1 rounded-full ${getRoleBadge(
																	project
																)}`}
															>
																{project.owner
																	?._id ===
																	user?._id ||
																project.owner ===
																	user?._id
																	? "Owner"
																	: "Member"}
															</span>
														</div>
													</div>
												</div>

												{/* Actions Dropdown */}
												<div className="relative">
													<button
														onClick={() =>
															setShowDeleteConfirm(
																showDeleteConfirm ===
																	project._id
																	? null
																	: project._id
															)
														}
														className={`p-2 rounded-lg ${
															isDark
																? "hover:bg-gray-800 text-gray-400"
																: "hover:bg-gray-100 text-gray-500"
														}`}
													>
														<EllipsisVerticalIcon className="h-5 w-5" />
													</button>

													{showDeleteConfirm ===
														project._id && (
														<div
															className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-10 ${
																isDark
																	? "bg-gray-800 border border-gray-700"
																	: "bg-white border border-gray-200"
															}`}
														>
															<button
																onClick={() =>
																	navigate(
																		`/dashboard/projects/${project._id}/edit`
																	)
																}
																className={`flex items-center gap-2 w-full px-4 py-3 text-left ${
																	isDark
																		? "hover:bg-gray-700 text-gray-300"
																		: "hover:bg-gray-50 text-gray-700"
																}`}
															>
																<PencilIcon className="h-4 w-4" />
																Edit Project
															</button>
															<button
																onClick={() =>
																	handleDeleteProject(
																		project._id,
																		project.name
																	)
																}
																className={`flex items-center gap-2 w-full px-4 py-3 text-left ${
																	isDark
																		? "hover:bg-red-900/30 text-red-400"
																		: "hover:bg-red-50 text-red-600"
																}`}
															>
																<TrashIcon className="h-4 w-4" />
																Delete Project
															</button>
														</div>
													)}
												</div>
											</div>

											<p
												className={`line-clamp-2 ${
													isDark
														? "text-gray-400"
														: "text-gray-600"
												}`}
											>
												{project.description ||
													"No description provided"}
											</p>
										</div>

										{/* Project Footer */}
										<div className="p-6">
											<div className="flex items-center justify-between mb-4">
												<div className="flex items-center gap-4">
													<div className="flex items-center gap-2">
														<UserGroupIcon
															className={`h-4 w-4 ${
																isDark
																	? "text-gray-500"
																	: "text-gray-400"
															}`}
														/>
														<span
															className={`text-sm ${
																isDark
																	? "text-gray-400"
																	: "text-gray-600"
															}`}
														>
															{getMemberCount(
																project
															)}{" "}
															members
														</span>
													</div>
													<div className="flex items-center gap-2">
														<ClockIcon
															className={`h-4 w-4 ${
																isDark
																	? "text-gray-500"
																	: "text-gray-400"
															}`}
														/>
														<span
															className={`text-sm ${
																isDark
																	? "text-gray-400"
																	: "text-gray-600"
															}`}
														>
															{formatDate(
																project.createdAt
															)}
														</span>
													</div>
												</div>

												{/* Progress Indicator (if available) */}
												{project.status ===
													"completed" && (
													<CheckCircleIcon className="h-5 w-5 text-green-500" />
												)}
											</div>

											<div className="flex gap-3">
												<Link
													to={`/dashboard/projects/${project._id}`}
													className={`flex-1 text-center py-2 rounded-lg font-medium transition ${
														isDark
															? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
															: "bg-gray-100 text-gray-700 hover:bg-gray-200"
													}`}
												>
													View Project
												</Link>
												<Link
													to={`/dashboard/projects/${project._id}/tasks`}
													className={`flex-1 text-center py-2 rounded-lg font-medium transition ${
														isDark
															? "bg-lime-900/30 text-lime-400 hover:bg-lime-900/50"
															: "bg-lime-50 text-lime-700 hover:bg-lime-100"
													}`}
												>
													Tasks
												</Link>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</>
				)}

				{/* Load More (if implemented) */}
				{filteredProjects.length > 0 &&
					filteredProjects.length < projects.length && (
						<div className="mt-8 text-center">
							<button
								onClick={() => {
									/* Implement load more */
								}}
								className={`px-6 py-3 rounded-lg font-medium border ${
									isDark
										? "border-gray-700 text-gray-300 hover:bg-gray-800"
										: "border-gray-300 text-gray-700 hover:bg-gray-100"
								}`}
							>
								Load More Projects
							</button>
						</div>
					)}
			</div>
		</div>
	);
}
