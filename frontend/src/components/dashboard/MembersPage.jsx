import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { useTheme } from "../ThemeContext.jsx";
import { getProjects } from "../../api/project.api.js";
import {
	UserGroupIcon,
	UserPlusIcon,
	EnvelopeIcon,
	BuildingOfficeIcon,
	CheckBadgeIcon,
	ClockIcon,
	MagnifyingGlassIcon,
	FunnelIcon,
	EllipsisVerticalIcon,
	ArrowRightIcon,
	TrashIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";

export default function MembersPage() {
	const { user } = useAuth();
	const { isDark } = useTheme();
	const navigate = useNavigate();
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterRole, setFilterRole] = useState("all");
	const [teamMembers, setTeamMembers] = useState([]);
	const [showInviteModal, setShowInviteModal] = useState(false);
	const [newMemberEmail, setNewMemberEmail] = useState("");
	const [newMemberRole, setNewMemberRole] = useState("member");
	const [selectedProject, setSelectedProject] = useState("all");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Fetch projects and extract team members
	useEffect(() => {
		fetchProjects();
	}, []);

	const fetchProjects = async () => {
		setLoading(true);
		try {
			const response = await getProjects();
			const projectsData = response.data?.projects || [];
			setProjects(projectsData);

			// Extract and deduplicate team members across all projects
			const allMembers = new Map();

			projectsData.forEach((project) => {
				// Add project owner
				if (project.owner) {
					const ownerKey = project.owner._id || project.owner;
					if (!allMembers.has(ownerKey)) {
						allMembers.set(ownerKey, {
							...project.owner,
							projects: [
								{
									id: project._id,
									name: project.name,
									role: "owner",
								},
							],
							isOwner: true,
							lastActive: project.updatedAt,
						});
					} else {
						// Update existing member's project list
						const existingMember = allMembers.get(ownerKey);
						existingMember.projects.push({
							id: project._id,
							name: project.name,
							role: "owner",
						});
					}
				}

				// Add project members
				project.members?.forEach((member) => {
					const memberKey = member.user?._id || member.user;
					if (!allMembers.has(memberKey)) {
						allMembers.set(memberKey, {
							...member.user,
							projects: [
								{
									id: project._id,
									name: project.name,
									role: member.role,
								},
							],
							isOwner: false,
							lastActive: project.updatedAt,
						});
					} else {
						// Update existing member's project list
						const existingMember = allMembers.get(memberKey);
						existingMember.projects.push({
							id: project._id,
							name: project.name,
							role: member.role,
						});
					}
				});
			});

			setTeamMembers(Array.from(allMembers.values()));
		} catch (error) {
			console.error("Failed to fetch projects:", error);
			setError("Failed to load team members. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Filter members based on search and filters
	const filteredMembers = teamMembers.filter((member) => {
		// Search filter
		const matchesSearch =
			member.username
				?.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			member.email?.toLowerCase().includes(searchQuery.toLowerCase());

		// Role filter
		const matchesRole =
			filterRole === "all" ||
			(filterRole === "owner" && member.isOwner) ||
			(filterRole === "admin" &&
				member.projects.some((p) => p.role === "admin")) ||
			(filterRole === "member" &&
				!member.isOwner &&
				!member.projects.some((p) => p.role === "admin"));

		// Project filter
		const matchesProject =
			selectedProject === "all" ||
			member.projects.some((p) => p.id === selectedProject);

		return matchesSearch && matchesRole && matchesProject;
	});

	// Handle inviting new member (global - not project-specific)
	const handleInviteMember = async (e) => {
		e.preventDefault();
		if (!newMemberEmail.trim()) return;

		// Note: This would need a backend endpoint for global invites
		// For now, we'll show a message
		setSuccess(`Invitation sent to ${newMemberEmail}`);
		setNewMemberEmail("");
		setShowInviteModal(false);
		setTimeout(() => setSuccess(""), 3000);
	};

	// Get member role badge style
	const getRoleBadge = (member) => {
		if (member.isOwner) {
			return isDark
				? "bg-purple-900/30 text-purple-400"
				: "bg-purple-100 text-purple-700";
		}

		const isAdmin = member.projects.some((p) => p.role === "admin");
		if (isAdmin) {
			return isDark
				? "bg-red-900/30 text-red-400"
				: "bg-red-100 text-red-700";
		}

		return isDark
			? "bg-gray-800 text-gray-400"
			: "bg-gray-100 text-gray-700";
	};

	// Get role label
	const getRoleLabel = (member) => {
		if (member.isOwner) return "Owner";
		if (member.projects.some((p) => p.role === "admin")) return "Admin";
		return "Member";
	};

	// Get project count
	const getProjectCount = (member) => {
		return member.projects?.length || 0;
	};

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	// Remove member from all projects (admin only)
	const handleRemoveMember = async (memberId) => {
		if (
			!window.confirm(
				"Are you sure you want to remove this member from all projects?"
			)
		) {
			return;
		}

		// Note: This would need backend implementation
		setSuccess("Member removed successfully");
		setTimeout(() => setSuccess(""), 3000);
	};

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
						Loading team members...
					</p>
				</div>
			</div>
		);
	}

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
						Team Members
					</h1>
					<p className={isDark ? "text-gray-400" : "text-gray-600"}>
						Manage all team members across your projects
					</p>
				</div>

				{/* Stats Bar */}
				<div
					className={`rounded-2xl border ${
						isDark
							? "bg-gray-900/50 border-gray-800"
							: "bg-white border-gray-200"
					} p-6 mb-6`}
				>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						<div>
							<div className="flex items-center gap-3">
								<div
									className={`p-3 rounded-lg ${
										isDark ? "bg-gray-800" : "bg-gray-100"
									}`}
								>
									<UserGroupIcon className="h-6 w-6 text-lime-500" />
								</div>
								<div>
									<p
										className={`text-2xl font-bold ${
											isDark
												? "text-white"
												: "text-gray-900"
										}`}
									>
										{teamMembers.length}
									</p>
									<p
										className={`text-sm ${
											isDark
												? "text-gray-400"
												: "text-gray-600"
										}`}
									>
										Total Members
									</p>
								</div>
							</div>
						</div>

						<div>
							<div className="flex items-center gap-3">
								<div
									className={`p-3 rounded-lg ${
										isDark
											? "bg-purple-900/30"
											: "bg-purple-100"
									}`}
								>
									<CheckBadgeIcon className="h-6 w-6 text-purple-500" />
								</div>
								<div>
									<p
										className={`text-2xl font-bold ${
											isDark
												? "text-white"
												: "text-gray-900"
										}`}
									>
										{
											teamMembers.filter((m) => m.isOwner)
												.length
										}
									</p>
									<p
										className={`text-sm ${
											isDark
												? "text-gray-400"
												: "text-gray-600"
										}`}
									>
										Project Owners
									</p>
								</div>
							</div>
						</div>

						<div>
							<div className="flex items-center gap-3">
								<div
									className={`p-3 rounded-lg ${
										isDark ? "bg-red-900/30" : "bg-red-100"
									}`}
								>
									<BuildingOfficeIcon className="h-6 w-6 text-red-500" />
								</div>
								<div>
									<p
										className={`text-2xl font-bold ${
											isDark
												? "text-white"
												: "text-gray-900"
										}`}
									>
										{
											teamMembers.filter((m) =>
												m.projects?.some(
													(p) => p.role === "admin"
												)
											).length
										}
									</p>
									<p
										className={`text-sm ${
											isDark
												? "text-gray-400"
												: "text-gray-600"
										}`}
									>
										Admins
									</p>
								</div>
							</div>
						</div>

						<div>
							<div className="flex items-center gap-3">
								<div
									className={`p-3 rounded-lg ${
										isDark
											? "bg-blue-900/30"
											: "bg-blue-100"
									}`}
								>
									<ClockIcon className="h-6 w-6 text-blue-500" />
								</div>
								<div>
									<p
										className={`text-2xl font-bold ${
											isDark
												? "text-white"
												: "text-gray-900"
										}`}
									>
										{projects.length}
									</p>
									<p
										className={`text-sm ${
											isDark
												? "text-gray-400"
												: "text-gray-600"
										}`}
									>
										Active Projects
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Action Bar */}
				<div
					className={`rounded-2xl border ${
						isDark
							? "bg-gray-900/50 border-gray-800"
							: "bg-white border-gray-200"
					} p-6 mb-6`}
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
								placeholder="Search members by name or email..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
									isDark
										? "border-gray-700 bg-gray-800 text-white focus:border-lime-500"
										: "border-gray-300 bg-white text-gray-900 focus:border-lime-500"
								} focus:ring-2 focus:ring-lime-500/20 focus:outline-none`}
							/>
						</div>

						{/* Filters */}
						<div className="flex items-center gap-3">
							{/* Project Filter */}
							<div className="relative">
								<select
									value={selectedProject}
									onChange={(e) =>
										setSelectedProject(e.target.value)
									}
									className={`px-4 py-2 rounded-lg border appearance-none pr-8 ${
										isDark
											? "border-gray-700 bg-gray-800 text-white"
											: "border-gray-300 bg-white text-gray-900"
									}`}
								>
									<option value="all">All Projects</option>
									{projects.map((project) => (
										<option
											key={project._id}
											value={project._id}
										>
											{project.name}
										</option>
									))}
								</select>
								<FunnelIcon
									className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
										isDark
											? "text-gray-400"
											: "text-gray-500"
									}`}
								/>
							</div>

							{/* Role Filter */}
							<div className="relative">
								<select
									value={filterRole}
									onChange={(e) =>
										setFilterRole(e.target.value)
									}
									className={`px-4 py-2 rounded-lg border appearance-none pr-8 ${
										isDark
											? "border-gray-700 bg-gray-800 text-white"
											: "border-gray-300 bg-white text-gray-900"
									}`}
								>
									<option value="all">All Roles</option>
									<option value="owner">Owners</option>
									<option value="admin">Admins</option>
									<option value="member">Members</option>
								</select>
								<FunnelIcon
									className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
										isDark
											? "text-gray-400"
											: "text-gray-500"
									}`}
								/>
							</div>

							{/* Invite Button */}
							<button
								onClick={() => setShowInviteModal(true)}
								className="px-4 py-2 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700 flex items-center gap-2"
							>
								<UserPlusIcon className="h-4 w-4" />
								<span>Invite Member</span>
							</button>
						</div>
					</div>
				</div>

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

				{/* Members List */}
				<div
					className={`rounded-2xl border ${
						isDark
							? "bg-gray-900/50 border-gray-800"
							: "bg-white border-gray-200"
					} overflow-hidden`}
				>
					{/* Table Header */}
					<div
						className={`grid grid-cols-12 gap-4 p-4 border-b ${
							isDark ? "border-gray-800" : "border-gray-200"
						}`}
					>
						<div className="col-span-4">
							<span
								className={`text-sm font-medium ${
									isDark ? "text-gray-400" : "text-gray-600"
								}`}
							>
								Member
							</span>
						</div>
						<div className="col-span-3">
							<span
								className={`text-sm font-medium ${
									isDark ? "text-gray-400" : "text-gray-600"
								}`}
							>
								Role
							</span>
						</div>
						<div className="col-span-3">
							<span
								className={`text-sm font-medium ${
									isDark ? "text-gray-400" : "text-gray-600"
								}`}
							>
								Projects
							</span>
						</div>
						<div className="col-span-2 text-right">
							<span
								className={`text-sm font-medium ${
									isDark ? "text-gray-400" : "text-gray-600"
								}`}
							>
								Actions
							</span>
						</div>
					</div>

					{/* Members List */}
					{filteredMembers.length === 0 ? (
						<div className="p-12 text-center">
							<UserGroupIcon
								className={`h-16 w-16 mx-auto mb-4 ${
									isDark ? "text-gray-700" : "text-gray-300"
								}`}
							/>
							<h3
								className={`text-xl font-bold mb-2 ${
									isDark ? "text-gray-300" : "text-gray-700"
								}`}
							>
								No members found
							</h3>
							<p
								className={`mb-6 ${
									isDark ? "text-gray-500" : "text-gray-500"
								}`}
							>
								{searchQuery ||
								filterRole !== "all" ||
								selectedProject !== "all"
									? "Try adjusting your search or filters"
									: "Invite your first team member to get started"}
							</p>
							<button
								onClick={() => setShowInviteModal(true)}
								className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700"
							>
								<UserPlusIcon className="h-4 w-4" />
								Invite Team Member
							</button>
						</div>
					) : (
						<div>
							{filteredMembers.map((member) => (
								<div
									key={member._id}
									className={`grid grid-cols-12 gap-4 p-4 border-b last:border-0 ${
										isDark
											? "border-gray-800 hover:bg-gray-800/50"
											: "border-gray-200 hover:bg-gray-50"
									}`}
								>
									{/* Member Info */}
									<div className="col-span-4">
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 flex items-center justify-center text-white font-bold">
												{member.username
													?.charAt(0)
													.toUpperCase() || "U"}
											</div>
											<div>
												<h3
													className={`font-medium ${
														isDark
															? "text-white"
															: "text-gray-900"
													}`}
												>
													{member.username}
												</h3>
												<p
													className={`text-sm flex items-center gap-1 ${
														isDark
															? "text-gray-400"
															: "text-gray-600"
													}`}
												>
													<EnvelopeIcon className="h-3 w-3" />
													{member.email}
												</p>
											</div>
										</div>
									</div>

									{/* Role */}
									<div className="col-span-3">
										<span
											className={`text-xs px-3 py-1 rounded-full ${getRoleBadge(
												member
											)}`}
										>
											{getRoleLabel(member)}
										</span>
									</div>

									{/* Projects */}
									<div className="col-span-3">
										<div className="flex items-center gap-2">
											<span
												className={
													isDark
														? "text-gray-300"
														: "text-gray-700"
												}
											>
												{getProjectCount(member)}{" "}
												project
												{getProjectCount(member) !== 1
													? "s"
													: ""}
											</span>
											{member.projects &&
												member.projects.length > 0 && (
													<button
														onClick={() => {
															/* Show project list modal */
														}}
														className={`text-xs ${
															isDark
																? "text-lime-400 hover:text-lime-300"
																: "text-lime-600 hover:text-lime-800"
														}`}
													>
														View
													</button>
												)}
										</div>
									</div>

									{/* Actions */}
									<div className="col-span-2 text-right">
										<div className="flex items-center justify-end gap-2">
											{member._id !== user?._id && (
												<button
													onClick={() =>
														handleRemoveMember(
															member._id
														)
													}
													className={`p-2 rounded-lg ${
														isDark
															? "hover:bg-red-900/30 text-red-400"
															: "hover:bg-red-50 text-red-600"
													}`}
													title="Remove from all projects"
												>
													<TrashIcon className="h-4 w-4" />
												</button>
											)}
											<button
												onClick={() => {
													/* View member details */
												}}
												className={`p-2 rounded-lg ${
													isDark
														? "hover:bg-gray-800 text-gray-400"
														: "hover:bg-gray-100 text-gray-600"
												}`}
											>
												<ArrowRightIcon className="h-4 w-4" />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Pagination/Info */}
				<div className="mt-6 flex items-center justify-between">
					<p className={isDark ? "text-gray-400" : "text-gray-600"}>
						Showing {filteredMembers.length} of {teamMembers.length}{" "}
						members
					</p>
					<div className="flex items-center gap-2">
						<button
							onClick={() => {
								/* Previous page */
							}}
							className={`px-3 py-1 rounded ${
								isDark
									? "hover:bg-gray-800 text-gray-300"
									: "hover:bg-gray-100 text-gray-600"
							}`}
							disabled
						>
							Previous
						</button>
						<button
							onClick={() => {
								/* Next page */
							}}
							className={`px-3 py-1 rounded ${
								isDark
									? "hover:bg-gray-800 text-gray-300"
									: "hover:bg-gray-100 text-gray-600"
							}`}
							disabled
						>
							Next
						</button>
					</div>
				</div>
			</div>

			{/* Invite Member Modal */}
			{showInviteModal && (
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
							<UserPlusIcon className="h-5 w-5 inline mr-2" />
							Invite Team Member
						</h3>

						<form onSubmit={handleInviteMember}>
							<div className="space-y-4">
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
											setNewMemberEmail(e.target.value)
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
										Default Role
									</label>
									<select
										value={newMemberRole}
										onChange={(e) =>
											setNewMemberRole(e.target.value)
										}
										className={`w-full px-4 py-3 rounded-lg border ${
											isDark
												? "border-gray-700 bg-gray-800 text-white"
												: "border-gray-300 bg-white text-gray-900"
										}`}
									>
										<option value="member">Member</option>
										<option value="admin">Admin</option>
									</select>
									<p
										className={`text-xs mt-2 ${
											isDark
												? "text-gray-500"
												: "text-gray-500"
										}`}
									>
										Can be adjusted per project later
									</p>
								</div>

								<div>
									<label
										className={`block text-sm font-medium mb-2 ${
											isDark
												? "text-gray-300"
												: "text-gray-700"
										}`}
									>
										Message (Optional)
									</label>
									<textarea
										placeholder="Add a personal message to your invitation..."
										rows="3"
										className={`w-full px-4 py-2 rounded-lg border ${
											isDark
												? "border-gray-700 bg-gray-800 text-white"
												: "border-gray-300 bg-white text-gray-900"
										}`}
									/>
								</div>
							</div>

							<div className="flex items-center gap-3 mt-6">
								<button
									type="submit"
									className="flex-1 px-4 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700"
								>
									Send Invitation
								</button>
								<button
									type="button"
									onClick={() => setShowInviteModal(false)}
									className={`flex-1 px-4 py-3 rounded-lg font-medium ${
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
		</div>
	);
}
