import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { useTheme } from "../ThemeContext.jsx";
import { getProject } from "../../api/project.api";
import {
	FolderIcon,
	CheckCircleIcon,
	ClockIcon,
	UserGroupIcon,
	PlusIcon,
	ArrowRightIcon,
	ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

export default function DashboardOverview() {
	const { user } = useAuth();
	const { isDark } = useTheme();
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		totalProjects: 0,
		activeProjects: 0,
		completedProjects: 0,
		totalMembers: 0,
	});

	useEffect(() => {
		fetchProjects();
	}, []);

	const fetchProjects = async () => {
		try {
			const response = await getProject();
			const projectsData = response.data.projects || [];
			setProjects(projectsData.slice(0, 5)); // Show only 5 recent

			// Calculate stats
			setStats({
				totalProjects: projectsData.length,
				activeProjects: projectsData.filter(
					(p) => p.status === "active"
				).length,
				completedProjects: projectsData.filter(
					(p) => p.status === "completed"
				).length,
				totalMembers: projectsData.reduce(
					(sum, p) => sum + (p.members?.length || 0),
					0
				),
			});
		} catch (error) {
			console.error("Failed to fetch projects:", error);
		} finally {
			setLoading(false);
		}
	};

	const StatCard = ({ icon, label, value, color }) => (
		<div
			className={`p-6 rounded-2xl border ${
				isDark
					? "bg-gray-900/50 border-gray-800"
					: "bg-white border-gray-200"
			}`}
		>
			<div className="flex items-center justify-between mb-4">
				<div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
					{icon}
				</div>
				<span
					className={`text-2xl font-bold ${
						isDark ? "text-white" : "text-gray-900"
					}`}
				>
					{value}
				</span>
			</div>
			<h3
				className={`text-sm font-medium ${
					isDark ? "text-gray-400" : "text-gray-600"
				}`}
			>
				{label}
			</h3>
		</div>
	);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
			</div>
		);
	}

	return (
		<div className="p-4 md:p-8">
			{/* Header */}
			<div className="mb-8">
				<h1
					className={`text-3xl font-bold mb-2 ${
						isDark ? "text-white" : "text-gray-900"
					}`}
				>
					Welcome back, {user?.username}!
				</h1>
				<p className={isDark ? "text-gray-400" : "text-gray-600"}>
					Here's what's happening with your projects today.
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<StatCard
					icon={<FolderIcon className="h-6 w-6 text-blue-500" />}
					label="Total Projects"
					value={stats.totalProjects}
					color="bg-blue-500"
				/>
				<StatCard
					icon={<ClockIcon className="h-6 w-6 text-yellow-500" />}
					label="Active Projects"
					value={stats.activeProjects}
					color="bg-yellow-500"
				/>
				<StatCard
					icon={
						<CheckCircleIcon className="h-6 w-6 text-green-500" />
					}
					label="Completed"
					value={stats.completedProjects}
					color="bg-green-500"
				/>
				<StatCard
					icon={<UserGroupIcon className="h-6 w-6 text-purple-500" />}
					label="Team Members"
					value={stats.totalMembers}
					color="bg-purple-500"
				/>
			</div>

			{/* Recent Projects & Quick Actions */}
			<div className="grid lg:grid-cols-3 gap-8">
				{/* Recent Projects */}
				<div
					className={`lg:col-span-2 rounded-2xl border ${
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
							Recent Projects
						</h2>
						<Link
							to="/dashboard/projects"
							className={`text-sm font-medium ${
								isDark
									? "text-lime-400 hover:text-lime-300"
									: "text-lime-600 hover:text-lime-800"
							}`}
						>
							View All
						</Link>
					</div>

					{projects.length === 0 ? (
						<div className="text-center py-12">
							<FolderIcon
								className={`h-12 w-12 mx-auto mb-4 ${
									isDark ? "text-gray-700" : "text-gray-300"
								}`}
							/>
							<h3
								className={`text-lg font-medium mb-2 ${
									isDark ? "text-gray-300" : "text-gray-700"
								}`}
							>
								No projects yet
							</h3>
							<p
								className={`mb-6 ${
									isDark ? "text-gray-500" : "text-gray-500"
								}`}
							>
								Create your first project to get started
							</p>
							<Link
								to="/dashboard/projects/new"
								className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700"
							>
								<PlusIcon className="h-4 w-4" />
								Create Project
							</Link>
						</div>
					) : (
						<div className="space-y-4">
							{projects.map((project) => (
								<Link
									key={project._id}
									to={`/dashboard/projects/${project._id}`}
									className={`flex items-center justify-between p-4 rounded-xl border transition ${
										isDark
											? "border-gray-800 hover:border-lime-500/30 hover:bg-gray-800/50"
											: "border-gray-200 hover:border-lime-500/50 hover:bg-gray-50"
									}`}
								>
									<div className="flex items-center space-x-4">
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
												className={`font-medium ${
													isDark
														? "text-white"
														: "text-gray-900"
												}`}
											>
												{project.name}
											</h3>
											<p
												className={`text-sm ${
													isDark
														? "text-gray-400"
														: "text-gray-600"
												}`}
											>
												{project.memberCount || 0}{" "}
												members • {project.status}
											</p>
										</div>
									</div>
									<ArrowRightIcon
										className={`h-5 w-5 ${
											isDark
												? "text-gray-500"
												: "text-gray-400"
										}`}
									/>
								</Link>
							))}
						</div>
					)}
				</div>

				{/* Quick Actions */}
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
						Quick Actions
					</h2>
					<div className="space-y-4">
						<Link
							to="/dashboard/projects/new"
							className={`flex items-center justify-between p-4 rounded-xl border transition ${
								isDark
									? "border-gray-800 hover:border-lime-500 hover:bg-gray-800/50"
									: "border-gray-200 hover:border-lime-500 hover:bg-gray-50"
							}`}
						>
							<div className="flex items-center space-x-3">
								<div
									className={`p-2 rounded-lg ${
										isDark
											? "bg-blue-900/30"
											: "bg-blue-100"
									}`}
								>
									<PlusIcon className="h-5 w-5 text-blue-500" />
								</div>
								<span className="font-medium">
									Create Project
								</span>
							</div>
						</Link>
						<Link
							to="/dashboard/tasks/new"
							className={`flex items-center justify-between p-4 rounded-xl border transition ${
								isDark
									? "border-gray-800 hover:border-lime-500 hover:bg-gray-800/50"
									: "border-gray-200 hover:border-lime-500 hover:bg-gray-50"
							}`}
						>
							<div className="flex items-center space-x-3">
								<div
									className={`p-2 rounded-lg ${
										isDark
											? "bg-green-900/30"
											: "bg-green-100"
									}`}
								>
									<ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
								</div>
								<span className="font-medium">Create Task</span>
							</div>
						</Link>
						<Link
							to="/dashboard/members/invite"
							className={`flex items-center justify-between p-4 rounded-xl border transition ${
								isDark
									? "border-gray-800 hover:border-lime-500 hover:bg-gray-800/50"
									: "border-gray-200 hover:border-lime-500 hover:bg-gray-50"
							}`}
						>
							<div className="flex items-center space-x-3">
								<div
									className={`p-2 rounded-lg ${
										isDark
											? "bg-purple-900/30"
											: "bg-purple-100"
									}`}
								>
									<UserGroupIcon className="h-5 w-5 text-purple-500" />
								</div>
								<span className="font-medium">
									Invite Member
								</span>
							</div>
						</Link>
					</div>

					{/* Recent Activity */}
					<div className="mt-8">
						<h3
							className={`font-medium mb-4 ${
								isDark ? "text-gray-300" : "text-gray-700"
							}`}
						>
							Recent Activity
						</h3>
						<div className="space-y-3">
							<div
								className={`text-sm ${
									isDark ? "text-gray-400" : "text-gray-600"
								}`}
							>
								No recent activity
							</div>
							{/* Add activity feed here */}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
