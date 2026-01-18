import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { useTheme } from "../ThemeContext.jsx";
import {
	getProject,
	updateProject,
	deleteProject,
	addProjectMember,
	removeProjectMember,
	updateMemberRole,
	getProjectStats,
} from "../../api/project.api.js";
import { getProjectTasks } from "../../api/task.api.js";
import { getProjectNotes } from "../../api/note.api.js";
import {
	ArrowLeftIcon,
	FolderIcon,
	UserGroupIcon,
	ClipboardDocumentCheckIcon,
	DocumentTextIcon,
	ChartBarIcon,
	Cog6ToothIcon,
	PlusIcon,
	TrashIcon,
	PencilIcon,
	UserPlusIcon,
	EnvelopeIcon,
	CheckCircleIcon,
	ClockIcon,
	ExclamationTriangleIcon,
	ChevronDownIcon,
	EllipsisVerticalIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";

export default function ProjectDetailPage() {
	const { projectId } = useParams();
	const { user } = useAuth();
	const { isDark } = useTheme();
	const navigate = useNavigate();
	const [project, setProject] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [stats, setStats] = useState({
		taskCount: 0,
		completedTasks: 0,
		noteCount: 0,
		memberCount: 0,
	});
	const [tasks, setTasks] = useState([]);
	const [notes, setNotes] = useState([]);
	const [showAddMember, setShowAddMember] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [newMemberEmail, setNewMemberEmail] = useState("");
	const [newMemberRole, setNewMemberRole] = useState("member");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Fetch project data
	useEffect(() => {
		if (projectId) {
			fetchProjectData();
		}
	}, [projectId]);

	const fetchProjectData = async () => {
		setLoading(true);
		setError("");
		try {
			// Fetch project details
			const projectRes = await getProject(projectId);
			const projectData = projectRes.data?.project;
			setProject(projectData);

			// Fetch project stats
			try {
				const statsRes = await getProjectStats(projectId);
				setStats(
					statsRes.data?.stats || {
						taskCount: 0,
						completedTasks: 0,
						noteCount: 0,
						memberCount: projectData?.members?.length || 0,
					}
				);
			} catch (statsError) {
				// If stats endpoint doesn't exist, calculate locally
				setStats({
					taskCount: 0,
					completedTasks: 0,
					noteCount: 0,
					memberCount: projectData?.members?.length || 0,
				});
			}

			// Fetch tasks
			const tasksRes = await getProjectTasks(projectId);
			setTasks(tasksRes.data?.tasks || []);

			// Fetch notes
			const notesRes = await getProjectNotes(projectId);
			setNotes(notesRes.data?.notes || []);
		} catch (error) {
			console.error("Failed to fetch project data:", error);
			setError("Failed to load project data. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Check if user is project admin/owner
	const isAdmin = () => {
		if (!project || !user) return false;

		// Check if owner
		if (project.owner?._id === user._id || project.owner === user._id) {
			return true;
		}

		// Check if admin member
		const userMember = project.members?.find(
			(member) =>
				member.user?._id === user._id || member.user === user._id
		);
		return userMember?.role === "admin";
	};

	// Get user role in project
	const getUserRole = () => {
		if (!project || !user) return "guest";

		if (project.owner?._id === user._id || project.owner === user._id) {
			return "owner";
		}

		const userMember = project.members?.find(
			(member) =>
				member.user?._id === user._id || member.user === user._id
		);
		return userMember?.role || "guest";
	};

	// Handle project update
	const handleUpdateProject = async (updatedData) => {
		try {
			const response = await updateProject(projectId, updatedData);
			setProject(response.data?.project || project);
			setShowEditModal(false);
			setSuccess("Project updated successfully!");
			setTimeout(() => setSuccess(""), 3000);
		} catch (error) {
			console.error("Failed to update project:", error);
			setError("Failed to update project. Please try again.");
		}
	};

	// Handle project deletion
	const handleDeleteProject = async () => {
		if (
			!window.confirm(
				`Are you sure you want to delete "${project?.name}"? This action cannot be undone.`
			)
		) {
			return;
		}

		try {
			await deleteProject(projectId);
			navigate("/dashboard/projects");
		} catch (error) {
			console.error("Failed to delete project:", error);
			setError("Failed to delete project. Please try again.");
		}
	};

	// Handle adding new member
	const handleAddMember = async (e) => {
		e.preventDefault();
		if (!newMemberEmail.trim()) return;

		try {
			await addProjectMember(projectId, {
				email: newMemberEmail.trim(),
				role: newMemberRole,
			});

			setNewMemberEmail("");
			setNewMemberRole("member");
			setShowAddMember(false);
			setSuccess("Invitation sent successfully!");
			setTimeout(() => setSuccess(""), 3000);

			// Refresh project data
			fetchProjectData();
		} catch (error) {
			console.error("Failed to add member:", error);
			setError(
				error.response?.data?.message ||
					"Failed to send invitation. Please try again."
			);
		}
	};

	// Handle removing member
	const handleRemoveMember = async (memberId) => {
		if (!window.confirm("Are you sure you want to remove this member?")) {
			return;
		}

		try {
			await removeProjectMember(projectId, memberId);
			setSuccess("Member removed successfully!");
			setTimeout(() => setSuccess(""), 3000);

			// Refresh project data
			fetchProjectData();
		} catch (error) {
			console.error("Failed to remove member:", error);
			setError("Failed to remove member. Please try again.");
		}
	};

	// Handle updating member role
	const handleUpdateMemberRole = async (memberId, newRole) => {
		try {
			await updateMemberRole(projectId, memberId, newRole);
			setSuccess("Member role updated successfully!");
			setTimeout(() => setSuccess(""), 3000);

			// Refresh project data
			fetchProjectData();
		} catch (error) {
			console.error("Failed to update member role:", error);
			setError("Failed to update member role. Please try again.");
		}
	};

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	// Get status badge style
	const getStatusBadge = (status) => {
		const styles = {
			active: "bg-green-500/10 text-green-500 border border-green-500/20",
			completed: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
			archived: "bg-gray-500/10 text-gray-500 border border-gray-500/20",
			planning:
				"bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
		};
		return (
			styles[status] ||
			"bg-gray-500/10 text-gray-500 border border-gray-500/20"
		);
	};

	// Loading state
	if (loading) {
		return (
			<div
				className={`min-h-screen flex items-center justify-center ${
					isDark ? "bg-gray-950" : "bg-gray-50"
				}`}
			>
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto mb-4"></div>
					<p className={isDark ? "text-gray-400" : "text-gray-600"}>
						Loading project...
					</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error && !project) {
		return (
			<div
				className={`min-h-screen flex items-center justify-center ${
					isDark ? "bg-gray-950" : "bg-gray-50"
				}`}
			>
				<div className="text-center max-w-md">
					<ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<h2
						className={`text-xl font-bold mb-2 ${
							isDark ? "text-white" : "text-gray-900"
						}`}
					>
						Failed to load project
					</h2>
					<p
						className={`mb-6 ${
							isDark ? "text-gray-400" : "text-gray-600"
						}`}
					>
						{error}
					</p>
					<button
						onClick={() => navigate("/dashboard/projects")}
						className={`px-4 py-2 rounded-lg font-medium ${
							isDark
								? "bg-gray-800 text-gray-300 hover:bg-gray-700"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						Back to Projects
					</button>
				</div>
			</div>
		);
	}

	if (!project) {
		return (
			<div
				className={`min-h-screen flex items-center justify-center ${
					isDark ? "bg-gray-950" : "bg-gray-50"
				}`}
			>
				<div className="text-center">
					<FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
					<h2
						className={`text-xl font-bold mb-2 ${
							isDark ? "text-white" : "text-gray-900"
						}`}
					>
						Project not found
					</h2>
					<p
						className={`mb-6 ${
							isDark ? "text-gray-400" : "text-gray-600"
						}`}
					>
						The project you're looking for doesn't exist or you
						don't have access.
					</p>
					<button
						onClick={() => navigate("/dashboard/projects")}
						className="px-6 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700"
					>
						Browse Projects
					</button>
				</div>
			</div>
		);
	}

	// Check access
	const userRole = getUserRole();
	if (userRole === "guest") {
		return (
			<div
				className={`min-h-screen flex items-center justify-center ${
					isDark ? "bg-gray-950" : "bg-gray-50"
				}`}
			>
				<div className="text-center max-w-md">
					<ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
					<h2
						className={`text-xl font-bold mb-2 ${
							isDark ? "text-white" : "text-gray-900"
						}`}
					>
						Access Denied
					</h2>
					<p
						className={`mb-6 ${
							isDark ? "text-gray-400" : "text-gray-600"
						}`}
					>
						You don't have permission to view this project.
					</p>
					<button
						onClick={() => navigate("/dashboard/projects")}
						className={`px-6 py-3 rounded-lg font-medium ${
							isDark
								? "bg-gray-800 text-gray-300 hover:bg-gray-700"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						Back to Projects
					</button>
				</div>
			</div>
		);
	}

	const tabs = [
		{
			id: "overview",
			label: "Overview",
			icon: <ChartBarIcon className="h-4 w-4" />,
		},
		{
			id: "tasks",
			label: "Tasks",
			icon: <ClipboardDocumentCheckIcon className="h-4 w-4" />,
		},
		{
			id: "notes",
			label: "Notes",
			icon: <DocumentTextIcon className="h-4 w-4" />,
		},
		{
			id: "members",
			label: "Members",
			icon: <UserGroupIcon className="h-4 w-4" />,
		},
		{
			id: "settings",
			label: "Settings",
			icon: <Cog6ToothIcon className="h-4 w-4" />,
		},
	];

	return (
		<div
			className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
		>
			{/* Header */}
			<div
				className={`sticky top-0 z-40 ${
					isDark
						? "bg-gray-900/80 backdrop-blur-lg border-b border-gray-800"
						: "bg-white/80 backdrop-blur-lg border-b border-gray-200"
				}`}
			>
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<button
								onClick={() => navigate("/dashboard/projects")}
								className={`p-2 rounded-lg ${
									isDark
										? "hover:bg-gray-800 text-gray-300"
										: "hover:bg-gray-100 text-gray-600"
								}`}
							>
								<ArrowLeftIcon className="h-5 w-5" />
							</button>
							<div className="flex items-center gap-3">
								<div
									className={`h-10 w-10 rounded-lg ${
										isDark ? "bg-gray-800" : "bg-gray-100"
									} flex items-center justify-center`}
								>
									<FolderIcon className="h-5 w-5 text-lime-500" />
								</div>
								<div>
									<h1
										className={`font-bold ${
											isDark
												? "text-white"
												: "text-gray-900"
										}`}
									>
										{project.name}
									</h1>
									<div className="flex items-center gap-2">
										<span
											className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(
												project.status
											)}`}
										>
											{project.status
												?.charAt(0)
												.toUpperCase() +
												project.status?.slice(1)}
										</span>
										<span
											className={`text-xs ${
												isDark
													? "text-gray-500"
													: "text-gray-500"
											}`}
										>
											{userRole === "owner"
												? "Owner"
												: userRole
														.charAt(0)
														.toUpperCase() +
												  userRole.slice(1)}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex items-center gap-2">
							{isAdmin() && (
								<>
									<button
										onClick={() => setShowEditModal(true)}
										className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
											isDark
												? "bg-gray-800 text-gray-300 hover:bg-gray-700"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200"
										}`}
									>
										<PencilIcon className="h-4 w-4" />
										Edit
									</button>
									<button
										onClick={() =>
											setShowDeleteConfirm(true)
										}
										className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
											isDark
												? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
												: "bg-red-50 text-red-600 hover:bg-red-100"
										}`}
									>
										<TrashIcon className="h-4 w-4" />
										Delete
									</button>
								</>
							)}
						</div>
					</div>

					{/* Tabs */}
					<div className="mt-4">
						<div className="flex space-x-1">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
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
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-8">
				{/* Success/Error Messages */}
				{success && (
					<div
						className={`mb-6 p-4 rounded-lg ${
							isDark
								? "bg-green-900/30 border border-green-800"
								: "bg-green-50 border border-green-200"
						}`}
					>
						<div className="flex items-center justify-between">
							<p className="text-green-500">{success}</p>
							<button onClick={() => setSuccess("")}>
								<XMarkIcon className="h-4 w-4 text-green-500" />
							</button>
						</div>
					</div>
				)}

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
							<button onClick={() => setError("")}>
								<XMarkIcon className="h-4 w-4 text-red-500" />
							</button>
						</div>
					</div>
				)}

				{/* Tab Content */}
				{activeTab === "overview" && (
					<div className="space-y-6">
						{/* Project Info */}
						<div
							className={`rounded-2xl border ${
								isDark
									? "bg-gray-900/50 border-gray-800"
									: "bg-white border-gray-200"
							} p-6`}
						>
							<h2
								className={`text-xl font-bold mb-4 ${
									isDark ? "text-white" : "text-gray-900"
								}`}
							>
								Project Information
							</h2>
							<div className="grid md:grid-cols-2 gap-6">
								<div>
									<h3
										className={`text-sm font-medium mb-2 ${
											isDark
												? "text-gray-400"
												: "text-gray-600"
										}`}
									>
										Description
									</h3>
									<p
										className={
											isDark
												? "text-gray-300"
												: "text-gray-700"
										}
									>
										{project.description ||
											"No description provided."}
									</p>
								</div>
								<div>
									<h3
										className={`text-sm font-medium mb-2 ${
											isDark
												? "text-gray-400"
												: "text-gray-600"
										}`}
									>
										Details
									</h3>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span
												className={
													isDark
														? "text-gray-400"
														: "text-gray-600"
												}
											>
												Created
											</span>
											<span
												className={
													isDark
														? "text-gray-300"
														: "text-gray-700"
												}
											>
												{formatDate(project.createdAt)}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span
												className={
													isDark
														? "text-gray-400"
														: "text-gray-600"
												}
											>
												Last Updated
											</span>
											<span
												className={
													isDark
														? "text-gray-300"
														: "text-gray-700"
												}
											>
												{formatDate(project.updatedAt)}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span
												className={
													isDark
														? "text-gray-400"
														: "text-gray-600"
												}
											>
												Owner
											</span>
											<span
												className={
													isDark
														? "text-gray-300"
														: "text-gray-700"
												}
											>
												{project.owner?.username ||
													"Unknown"}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Stats Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<div
								className={`p-6 rounded-2xl border ${
									isDark
										? "bg-gray-900/50 border-gray-800"
										: "bg-white border-gray-200"
								}`}
							>
								<div className="flex items-center gap-3 mb-4">
									<div
										className={`p-3 rounded-lg ${
											isDark
												? "bg-blue-900/30"
												: "bg-blue-100"
										}`}
									>
										<ClipboardDocumentCheckIcon className="h-6 w-6 text-blue-500" />
									</div>
									<div>
										<p
											className={`text-2xl font-bold ${
												isDark
													? "text-white"
													: "text-gray-900"
											}`}
										>
											{stats.taskCount}
										</p>
										<p
											className={`text-sm ${
												isDark
													? "text-gray-400"
													: "text-gray-600"
											}`}
										>
											Total Tasks
										</p>
									</div>
								</div>
								<div
									className={`h-2 rounded-full ${
										isDark ? "bg-gray-800" : "bg-gray-200"
									}`}
								>
									<div
										className="h-full rounded-full bg-blue-500"
										style={{
											width: `${
												stats.taskCount > 0
													? (stats.completedTasks /
															stats.taskCount) *
													  100
													: 0
											}%`,
										}}
									></div>
								</div>
								<p
									className={`text-xs mt-2 ${
										isDark
											? "text-gray-500"
											: "text-gray-500"
									}`}
								>
									{stats.completedTasks} completed
								</p>
							</div>

							<div
								className={`p-6 rounded-2xl border ${
									isDark
										? "bg-gray-900/50 border-gray-800"
										: "bg-white border-gray-200"
								}`}
							>
								<div className="flex items-center gap-3 mb-4">
									<div
										className={`p-3 rounded-lg ${
											isDark
												? "bg-green-900/30"
												: "bg-green-100"
										}`}
									>
										<DocumentTextIcon className="h-6 w-6 text-green-500" />
									</div>
									<div>
										<p
											className={`text-2xl font-bold ${
												isDark
													? "text-white"
													: "text-gray-900"
											}`}
										>
											{stats.noteCount}
										</p>
										<p
											className={`text-sm ${
												isDark
													? "text-gray-400"
													: "text-gray-600"
											}`}
										>
											Notes
										</p>
									</div>
								</div>
								<div
									className={`h-2 rounded-full ${
										isDark ? "bg-gray-800" : "bg-gray-200"
									}`}
								>
									<div
										className="h-full rounded-full bg-green-500"
										style={{ width: "100%" }}
									></div>
								</div>
								<p
									className={`text-xs mt-2 ${
										isDark
											? "text-gray-500"
											: "text-gray-500"
									}`}
								>
									All notes accessible
								</p>
							</div>

							<div
								className={`p-6 rounded-2xl border ${
									isDark
										? "bg-gray-900/50 border-gray-800"
										: "bg-white border-gray-200"
								}`}
							>
								<div className="flex items-center gap-3 mb-4">
									<div
										className={`p-3 rounded-lg ${
											isDark
												? "bg-purple-900/30"
												: "bg-purple-100"
										}`}
									>
										<UserGroupIcon className="h-6 w-6 text-purple-500" />
									</div>
									<div>
										<p
											className={`text-2xl font-bold ${
												isDark
													? "text-white"
													: "text-gray-900"
											}`}
										>
											{stats.memberCount}
										</p>
										<p
											className={`text-sm ${
												isDark
													? "text-gray-400"
													: "text-gray-600"
											}`}
										>
											Members
										</p>
									</div>
								</div>
								<div
									className={`h-2 rounded-full ${
										isDark ? "bg-gray-800" : "bg-gray-200"
									}`}
								>
									<div
										className="h-full rounded-full bg-purple-500"
										style={{ width: "100%" }}
									></div>
								</div>
								<p
									className={`text-xs mt-2 ${
										isDark
											? "text-gray-500"
											: "text-gray-500"
									}`}
								>
									{project.members?.filter(
										(m) => m.role === "admin"
									).length || 0}{" "}
									admins
								</p>
							</div>

							<div
								className={`p-6 rounded-2xl border ${
									isDark
										? "bg-gray-900/50 border-gray-800"
										: "bg-white border-gray-200"
								}`}
							>
								<div className="flex items-center gap-3 mb-4">
									<div
										className={`p-3 rounded-lg ${
											isDark
												? "bg-yellow-900/30"
												: "bg-yellow-100"
										}`}
									>
										<ClockIcon className="h-6 w-6 text-yellow-500" />
									</div>
									<div>
										<p
											className={`text-2xl font-bold ${
												isDark
													? "text-white"
													: "text-gray-900"
											}`}
										>
											{project.status === "completed"
												? "100%"
												: "65%"}
										</p>
										<p
											className={`text-sm ${
												isDark
													? "text-gray-400"
													: "text-gray-600"
											}`}
										>
											Progress
										</p>
									</div>
								</div>
								<div
									className={`h-2 rounded-full ${
										isDark ? "bg-gray-800" : "bg-gray-200"
									}`}
								>
									<div
										className="h-full rounded-full bg-yellow-500"
										style={{
											width:
												project.status === "completed"
													? "100%"
													: "65%",
										}}
									></div>
								</div>
								<p
									className={`text-xs mt-2 ${
										isDark
											? "text-gray-500"
											: "text-gray-500"
									}`}
								>
									{project.status === "completed"
										? "Completed"
										: "In Progress"}
								</p>
							</div>
						</div>

						{/* Recent Tasks */}
						<div
							className={`rounded-2xl border ${
								isDark
									? "bg-gray-900/50 border-gray-800"
									: "bg-white border-gray-200"
							} p-6`}
						>
							<div className="flex items-center justify-between mb-6">
								<h2
									className={`text-xl font-bold ${
										isDark ? "text-white" : "text-gray-900"
									}`}
								>
									Recent Tasks
								</h2>
								<Link
									to={`/dashboard/projects/${projectId}/tasks`}
									className={`text-sm font-medium ${
										isDark
											? "text-lime-400 hover:text-lime-300"
											: "text-lime-600 hover:text-lime-800"
									}`}
								>
									View All
								</Link>
							</div>

							{tasks.length === 0 ? (
								<div className="text-center py-8">
									<ClipboardDocumentCheckIcon
										className={`h-12 w-12 mx-auto mb-4 ${
											isDark
												? "text-gray-700"
												: "text-gray-300"
										}`}
									/>
									<p
										className={
											isDark
												? "text-gray-400"
												: "text-gray-600"
										}
									>
										No tasks yet. Create your first task!
									</p>
									<Link
										to={`/dashboard/projects/${projectId}/tasks/new`}
										className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700"
									>
										<PlusIcon className="h-4 w-4" />
										Create Task
									</Link>
								</div>
							) : (
								<div className="space-y-3">
									{tasks.slice(0, 5).map((task) => (
										<Link
											key={task._id}
											to={`/dashboard/projects/${projectId}/tasks/${task._id}`}
											className={`flex items-center justify-between p-4 rounded-xl border transition ${
												isDark
													? "border-gray-800 hover:border-lime-500/30 hover:bg-gray-800/50"
													: "border-gray-200 hover:border-lime-500/50 hover:bg-gray-50"
											}`}
										>
											<div className="flex items-center gap-3">
												<div
													className={`h-10 w-10 rounded-lg ${
														isDark
															? "bg-gray-800"
															: "bg-gray-100"
													} flex items-center justify-center`}
												>
													<ClipboardDocumentCheckIcon className="h-5 w-5 text-lime-500" />
												</div>
												<div>
													<h3
														className={`font-medium ${
															isDark
																? "text-white"
																: "text-gray-900"
														}`}
													>
														{task.title}
													</h3>
													<p
														className={`text-sm ${
															isDark
																? "text-gray-400"
																: "text-gray-600"
														}`}
													>
														{task.status} •{" "}
														{task.priority} priority
													</p>
												</div>
											</div>
											{task.status === "done" && (
												<CheckCircleIcon className="h-5 w-5 text-green-500" />
											)}
										</Link>
									))}
								</div>
							)}
						</div>
					</div>
				)}

				{activeTab === "tasks" && (
					<Outlet /> // Tasks sub-routes will render here
				)}

				{activeTab === "notes" && (
					<Outlet /> // Notes sub-routes will render here
				)}

				{activeTab === "members" && (
					<div className="space-y-6">
						{/* Add Member Card */}
						{isAdmin() && (
							<div
								className={`rounded-2xl border ${
									isDark
										? "bg-gray-900/50 border-gray-800"
										: "bg-white border-gray-200"
								} p-6`}
							>
								<div className="flex items-center justify-between mb-6">
									<h2
										className={`text-xl font-bold ${
											isDark
												? "text-white"
												: "text-gray-900"
										}`}
									>
										Invite Team Members
									</h2>
									<button
										onClick={() =>
											setShowAddMember(!showAddMember)
										}
										className={`p-2 rounded-lg ${
											isDark
												? "hover:bg-gray-800 text-gray-300"
												: "hover:bg-gray-100 text-gray-600"
										}`}
									>
										<ChevronDownIcon
											className={`h-5 w-5 transition ${
												showAddMember
													? "rotate-180"
													: ""
											}`}
										/>
									</button>
								</div>

								{showAddMember ? (
									<form
										onSubmit={handleAddMember}
										className="space-y-4"
									>
										<div>
											<label
												className={`block text-sm font-medium mb-2 ${
													isDark
														? "text-gray-300"
														: "text-gray-700"
												}`}
											>
												Email Address
											</label>
											<input
												type="email"
												value={newMemberEmail}
												onChange={(e) =>
													setNewMemberEmail(
														e.target.value
													)
												}
												placeholder="team.member@example.com"
												className={`w-full px-4 py-3 rounded-lg border ${
													isDark
														? "border-gray-700 bg-gray-800 text-white focus:border-lime-500"
														: "border-gray-300 bg-white text-gray-900 focus:border-lime-500"
												} focus:ring-2 focus:ring-lime-500/20 focus:outline-none`}
												required
											/>
										</div>

										<div>
											<label
												className={`block text-sm font-medium mb-2 ${
													isDark
														? "text-gray-300"
														: "text-gray-700"
												}`}
											>
												Role
											</label>
											<select
												value={newMemberRole}
												onChange={(e) =>
													setNewMemberRole(
														e.target.value
													)
												}
												className={`w-full px-4 py-3 rounded-lg border ${
													isDark
														? "border-gray-700 bg-gray-800 text-white"
														: "border-gray-300 bg-white text-gray-900"
												}`}
											>
												<option value="member">
													Member
												</option>
												<option value="admin">
													Admin
												</option>
											</select>
										</div>

										<div className="flex items-center gap-3 pt-4">
											<button
												type="submit"
												className="px-6 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700 flex items-center gap-2"
											>
												<UserPlusIcon className="h-4 w-4" />
												Send Invitation
											</button>
											<button
												type="button"
												onClick={() =>
													setShowAddMember(false)
												}
												className={`px-6 py-3 rounded-lg font-medium ${
													isDark
														? "text-gray-300 hover:text-white"
														: "text-gray-600 hover:text-gray-900"
												}`}
											>
												Cancel
											</button>
										</div>
									</form>
								) : (
									<button
										onClick={() => setShowAddMember(true)}
										className={`w-full p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition ${
											isDark
												? "border-gray-700 hover:border-lime-500 text-gray-400 hover:text-lime-400"
												: "border-gray-300 hover:border-lime-500 text-gray-500 hover:text-lime-600"
										}`}
									>
										<UserPlusIcon className="h-8 w-8" />
										<span className="font-medium">
											Invite Team Members
										</span>
										<span className="text-sm">
											Add collaborators to this project
										</span>
									</button>
								)}
							</div>
						)}

						{/* Members List */}
						<div
							className={`rounded-2xl border ${
								isDark
									? "bg-gray-900/50 border-gray-800"
									: "bg-white border-gray-200"
							} p-6`}
						>
							<h2
								className={`text-xl font-bold mb-6 ${
									isDark ? "text-white" : "text-gray-900"
								}`}
							>
								Project Members ({stats.memberCount})
							</h2>

							<div className="space-y-4">
								{/* Owner */}
								<div
									className={`flex items-center justify-between p-4 rounded-xl ${
										isDark ? "bg-gray-800/50" : "bg-gray-50"
									}`}
								>
									<div className="flex items-center gap-3">
										<div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
											{project.owner?.username
												?.charAt(0)
												.toUpperCase() || "O"}
										</div>
										<div>
											<h3
												className={`font-medium ${
													isDark
														? "text-white"
														: "text-gray-900"
												}`}
											>
												{project.owner?.username}
												<span
													className={`ml-2 text-xs px-2 py-1 rounded-full ${
														isDark
															? "bg-purple-900/30 text-purple-400"
															: "bg-purple-100 text-purple-700"
													}`}
												>
													Owner
												</span>
											</h3>
											<p
												className={`text-sm ${
													isDark
														? "text-gray-400"
														: "text-gray-600"
												}`}
											>
												{project.owner?.email}
											</p>
										</div>
									</div>
									<div className="text-sm italic opacity-70">
										Project Creator
									</div>
								</div>

								{/* Members */}
								{project.members?.map((member, index) => (
									<div
										key={member.user?._id || index}
										className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-gray-200"
									>
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 flex items-center justify-center text-white font-bold">
												{member.user?.username
													?.charAt(0)
													.toUpperCase() || "M"}
											</div>
											<div>
												<h3
													className={`font-medium ${
														isDark
															? "text-white"
															: "text-gray-900"
													}`}
												>
													{member.user?.username}
													<span
														className={`ml-2 text-xs px-2 py-1 rounded-full ${
															member.role ===
															"admin"
																? isDark
																	? "bg-red-900/30 text-red-400"
																	: "bg-red-100 text-red-700"
																: isDark
																? "bg-gray-800 text-gray-400"
																: "bg-gray-100 text-gray-700"
														}`}
													>
														{member.role === "admin"
															? "Admin"
															: "Member"}
													</span>
												</h3>
												<p
													className={`text-sm ${
														isDark
															? "text-gray-400"
															: "text-gray-600"
													}`}
												>
													{member.user?.email}
												</p>
											</div>
										</div>

										{isAdmin() &&
											member.user?._id !== user._id && (
												<div className="flex items-center gap-2">
													<select
														value={member.role}
														onChange={(e) =>
															handleUpdateMemberRole(
																member.user
																	?._id,
																e.target.value
															)
														}
														className={`px-3 py-1 rounded border text-sm ${
															isDark
																? "border-gray-700 bg-gray-800 text-white"
																: "border-gray-300 bg-white text-gray-900"
														}`}
													>
														<option value="member">
															Member
														</option>
														<option value="admin">
															Admin
														</option>
													</select>
													<button
														onClick={() =>
															handleRemoveMember(
																member.user?._id
															)
														}
														className={`p-2 rounded-lg ${
															isDark
																? "hover:bg-red-900/30 text-red-400"
																: "hover:bg-red-50 text-red-600"
														}`}
													>
														<TrashIcon className="h-4 w-4" />
													</button>
												</div>
											)}
									</div>
								))}

								{(!project.members ||
									project.members.length === 0) && (
									<div className="text-center py-8">
										<UserGroupIcon
											className={`h-12 w-12 mx-auto mb-4 ${
												isDark
													? "text-gray-700"
													: "text-gray-300"
											}`}
										/>
										<p
											className={
												isDark
													? "text-gray-400"
													: "text-gray-600"
											}
										>
											No other members yet. Invite team
											members to collaborate!
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{activeTab === "settings" && (
					<div
						className={`rounded-2xl border ${
							isDark
								? "bg-gray-900/50 border-gray-800"
								: "bg-white border-gray-200"
						} p-6`}
					>
						<h2
							className={`text-xl font-bold mb-6 ${
								isDark ? "text-white" : "text-gray-900"
							}`}
						>
							Project Settings
						</h2>

						{isAdmin() ? (
							<div className="space-y-6">
								{/* Danger Zone */}
								<div
									className={`rounded-xl border ${
										isDark
											? "border-red-800 bg-red-900/10"
											: "border-red-200 bg-red-50"
									} p-6`}
								>
									<h3
										className={`text-lg font-bold mb-3 ${
											isDark
												? "text-red-400"
												: "text-red-600"
										}`}
									>
										<ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
										Danger Zone
									</h3>
									<p
										className={`mb-4 ${
											isDark
												? "text-gray-400"
												: "text-gray-600"
										}`}
									>
										These actions are irreversible. Please
										be certain.
									</p>
									<button
										onClick={() =>
											setShowDeleteConfirm(true)
										}
										className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
									>
										<TrashIcon className="h-4 w-4" />
										Delete Project
									</button>
								</div>
							</div>
						) : (
							<div className="text-center py-8">
								<Cog6ToothIcon
									className={`h-12 w-12 mx-auto mb-4 ${
										isDark
											? "text-gray-700"
											: "text-gray-300"
									}`}
								/>
								<p
									className={
										isDark
											? "text-gray-400"
											: "text-gray-600"
									}
								>
									Only project admins can access settings.
								</p>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Edit Project Modal */}
			{showEditModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div
						className={`w-full max-w-md rounded-2xl ${
							isDark ? "bg-gray-900" : "bg-white"
						} p-6`}
					>
						<h3
							className={`text-xl font-bold mb-4 ${
								isDark ? "text-white" : "text-gray-900"
							}`}
						>
							Edit Project
						</h3>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								const formData = new FormData(e.target);
								handleUpdateProject({
									name: formData.get("name"),
									description: formData.get("description"),
									status: formData.get("status"),
								});
							}}
						>
							<div className="space-y-4">
								<div>
									<label
										className={`block text-sm font-medium mb-2 ${
											isDark
												? "text-gray-300"
												: "text-gray-700"
										}`}
									>
										Project Name
									</label>
									<input
										type="text"
										name="name"
										defaultValue={project.name}
										className={`w-full px-4 py-2 rounded-lg border ${
											isDark
												? "border-gray-700 bg-gray-800 text-white"
												: "border-gray-300 bg-white text-gray-900"
										}`}
										required
									/>
								</div>

								<div>
									<label
										className={`block text-sm font-medium mb-2 ${
											isDark
												? "text-gray-300"
												: "text-gray-700"
										}`}
									>
										Description
									</label>
									<textarea
										name="description"
										defaultValue={project.description}
										rows="3"
										className={`w-full px-4 py-2 rounded-lg border ${
											isDark
												? "border-gray-700 bg-gray-800 text-white"
												: "border-gray-300 bg-white text-gray-900"
										}`}
									/>
								</div>

								<div>
									<label
										className={`block text-sm font-medium mb-2 ${
											isDark
												? "text-gray-300"
												: "text-gray-700"
										}`}
									>
										Status
									</label>
									<select
										name="status"
										defaultValue={project.status}
										className={`w-full px-4 py-2 rounded-lg border ${
											isDark
												? "border-gray-700 bg-gray-800 text-white"
												: "border-gray-300 bg-white text-gray-900"
										}`}
									>
										<option value="planning">
											Planning
										</option>
										<option value="active">Active</option>
										<option value="completed">
											Completed
										</option>
										<option value="archived">
											Archived
										</option>
									</select>
								</div>
							</div>

							<div className="flex items-center gap-3 mt-6">
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700"
								>
									Save Changes
								</button>
								<button
									type="button"
									onClick={() => setShowEditModal(false)}
									className={`flex-1 px-4 py-2 rounded-lg font-medium ${
										isDark
											? "bg-gray-800 text-gray-300 hover:bg-gray-700"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div
						className={`w-full max-w-md rounded-2xl ${
							isDark ? "bg-gray-900" : "bg-white"
						} p-6`}
					>
						<ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
						<h3
							className={`text-xl font-bold mb-2 text-center ${
								isDark ? "text-white" : "text-gray-900"
							}`}
						>
							Delete Project?
						</h3>
						<p
							className={`text-center mb-6 ${
								isDark ? "text-gray-400" : "text-gray-600"
							}`}
						>
							Are you sure you want to delete{" "}
							<strong>"{project.name}"</strong>? This action
							cannot be undone. All tasks, notes, and data will be
							permanently deleted.
						</p>
						<div className="flex items-center gap-3">
							<button
								onClick={handleDeleteProject}
								className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
							>
								Yes, Delete Project
							</button>
							<button
								onClick={() => setShowDeleteConfirm(false)}
								className={`flex-1 px-4 py-3 rounded-lg font-medium ${
									isDark
										? "bg-gray-800 text-gray-300 hover:bg-gray-700"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
