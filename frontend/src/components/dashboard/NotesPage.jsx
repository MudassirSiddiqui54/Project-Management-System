import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { useTheme } from "../ThemeContext.jsx";
import { getProjects } from "../../api/project.api.js";
import {
	getProjectNotes,
	createNote,
	updateNote,
	deleteNote,
} from "../../api/note.api.js";
import {
	DocumentTextIcon,
	PlusIcon,
	MagnifyingGlassIcon,
	FunnelIcon,
	TagIcon,
	PencilIcon,
	TrashIcon,
	EllipsisVerticalIcon,
	UserIcon,
	CalendarDaysIcon,
	ArrowRightIcon,
	XMarkIcon,
	ChevronDownIcon,
	ClockIcon,
} from "@heroicons/react/24/outline";

export default function NotesPage() {
	const { user } = useAuth();
	const { isDark } = useTheme();
	const navigate = useNavigate();
	const [projects, setProjects] = useState([]);
	const [selectedProject, setSelectedProject] = useState("all");
	const [notes, setNotes] = useState([]);
	const [filteredNotes, setFilteredNotes] = useState([]);
	const [loading, setLoading] = useState(true);

	// Filters
	const [searchQuery, setSearchQuery] = useState("");
	const [tagFilter, setTagFilter] = useState("all");
	const [showPinnedOnly, setShowPinnedOnly] = useState(false);
	const [sortBy, setSortBy] = useState("newest");

	// Note creation/editing
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showNoteDetails, setShowNoteDetails] = useState(null);
	const [newNote, setNewNote] = useState({
		title: "",
		content: "",
		tags: [],
		isPinned: false,
	});
	const [tagInput, setTagInput] = useState("");

	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Fetch projects on mount
	useEffect(() => {
		fetchProjects();
	}, []);

	// Fetch notes when project changes
	useEffect(() => {
		if (selectedProject !== "all") {
			fetchProjectNotes(selectedProject);
		} else {
			fetchAllNotes();
		}
	}, [selectedProject]);

	// Apply filters when notes or filters change
	useEffect(() => {
		applyFilters();
	}, [notes, searchQuery, tagFilter, showPinnedOnly, sortBy]);

	const fetchProjects = async () => {
		try {
			const response = await getProjects();
			setProjects(response.data?.projects || []);
		} catch (error) {
			console.error("Failed to fetch projects:", error);
			setError("Failed to load projects. Please try again.");
		}
	};

	const fetchProjectNotes = async (projectId) => {
		setLoading(true);
		try {
			const response = await getProjectNotes(projectId);
			setNotes(response.data?.notes || []);
		} catch (error) {
			console.error("Failed to fetch notes:", error);
			setError("Failed to load notes. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const fetchAllNotes = async () => {
		setLoading(true);
		try {
			// Fetch notes from all projects
			const allNotes = [];

			for (const project of projects) {
				try {
					const response = await getProjectNotes(project._id);
					const projectNotes = response.data?.notes || [];

					// Add project information to each note
					const notesWithProject = projectNotes.map((note) => ({
						...note,
						projectName: project.name,
						projectId: project._id,
					}));

					allNotes.push(...notesWithProject);
				} catch (error) {
					console.error(
						`Failed to fetch notes for project ${project._id}:`,
						error,
					);
				}
			}

			setNotes(allNotes);
		} catch (error) {
			console.error("Failed to fetch all notes:", error);
			setError("Failed to load notes. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const applyFilters = () => {
		let filtered = [...notes];

		// Show pinned only
		if (showPinnedOnly) {
			filtered = filtered.filter((note) => note.isPinned);
		}

		// Search filter
		if (searchQuery) {
			filtered = filtered.filter(
				(note) =>
					note.title
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					note.content
						?.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					note.tags?.some((tag) =>
						tag.toLowerCase().includes(searchQuery.toLowerCase()),
					),
			);
		}

		// Tag filter
		if (tagFilter !== "all") {
			filtered = filtered.filter((note) =>
				note.tags?.includes(tagFilter),
			);
		}

		// Sort notes
		filtered.sort((a, b) => {
			switch (sortBy) {
				case "newest":
					return (
						new Date(b.updatedAt || b.createdAt) -
						new Date(a.updatedAt || a.createdAt)
					);
				case "oldest":
					return (
						new Date(a.updatedAt || a.createdAt) -
						new Date(b.updatedAt || b.createdAt)
					);
				case "title_asc":
					return a.title.localeCompare(b.title);
				case "title_desc":
					return b.title.localeCompare(a.title);
				case "pinned":
					// Pinned notes first, then by date
					if (a.isPinned && !b.isPinned) return -1;
					if (!a.isPinned && b.isPinned) return 1;
					return (
						new Date(b.updatedAt || b.createdAt) -
						new Date(a.updatedAt || a.createdAt)
					);
				default:
					return 0;
			}
		});

		setFilteredNotes(filtered);
	};

	const handleCreateNote = async (e) => {
		e.preventDefault();

		if (
			!newNote.title.trim() ||
			!selectedProject ||
			selectedProject === "all"
		) {
			setError("Please select a project and enter a note title");
			return;
		}

		if (!newNote.content.trim()) {
			setError("Note content is required");
			return;
		}

		try {
			const response = await createNote(selectedProject, newNote);

			// Add to local state
			const createdNote = {
				...response.data?.note,
				projectName: projects.find((p) => p._id === selectedProject)
					?.name,
				projectId: selectedProject,
			};

			setNotes((prev) => [createdNote, ...prev]);
			setNewNote({
				title: "",
				content: "",
				tags: [],
				isPinned: false,
			});
			setShowCreateModal(false);
			setSuccess("Note created successfully!");
			setTimeout(() => setSuccess(""), 3000);
		} catch (error) {
			console.error("Failed to create note:", error);
			setError(
				error.response?.data?.message ||
					"Failed to create note. Please try again.",
			);
		}
	};

	const handleUpdateNotePin = async (noteId, isPinned, projectId) => {
		try {
			await updateNote(projectId || selectedProject, noteId, {
				isPinned,
			});

			// Update local state
			setNotes((prev) =>
				prev.map((note) => {
					if (note._id === noteId) {
						return {
							...note,
							isPinned,
							updatedAt: new Date().toISOString(),
						};
					}
					return note;
				}),
			);

			setSuccess(`Note ${isPinned ? "pinned" : "unpinned"}!`);
			setTimeout(() => setSuccess(""), 3000);
		} catch (error) {
			console.error("Failed to update note:", error);
			setError("Failed to update note. Please try again.");
		}
	};

	const handleDeleteNote = async (noteId, projectId) => {
		if (!window.confirm("Are you sure you want to delete this note?")) {
			return;
		}

		try {
			await deleteNote(projectId || selectedProject, noteId);

			// Remove from local state
			setNotes((prev) => prev.filter((note) => note._id !== noteId));

			setSuccess("Note deleted successfully!");
			setTimeout(() => setSuccess(""), 3000);
		} catch (error) {
			console.error("Failed to delete note:", error);
			setError("Failed to delete note. Please try again.");
		}
	};

	// Get all unique tags from notes
	const getAllTags = () => {
		const tags = new Set();

		notes.forEach((note) => {
			note.tags?.forEach((tag) => {
				if (tag.trim()) tags.add(tag);
			});
		});

		return Array.from(tags).sort();
	};

	// Add tag to new note
	const addTag = () => {
		if (tagInput.trim() && !newNote.tags.includes(tagInput.trim())) {
			setNewNote((prev) => ({
				...prev,
				tags: [...prev.tags, tagInput.trim()],
			}));
			setTagInput("");
		}
	};

	// Remove tag from new note
	const removeTag = (tagToRemove) => {
		setNewNote((prev) => ({
			...prev,
			tags: prev.tags.filter((tag) => tag !== tagToRemove),
		}));
	};

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = now - date;
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return "Today";
		} else if (diffDays === 1) {
			return "Yesterday";
		} else if (diffDays < 7) {
			return `${diffDays} days ago`;
		} else if (diffDays < 30) {
			const weeks = Math.floor(diffDays / 7);
			return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
		}

		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	// Truncate content for preview
	const truncateContent = (content, maxLength = 150) => {
		if (!content) return "";
		if (content.length <= maxLength) return content;
		return content.substring(0, maxLength) + "...";
	};

	if (loading && notes.length === 0) {
		return (
			<div
				className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
			>
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto mb-4"></div>
					<p className={isDark ? "text-gray-400" : "text-gray-600"}>
						Loading notes...
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
						className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
					>
						Notes
					</h1>
					<p className={isDark ? "text-gray-400" : "text-gray-600"}>
						Organize and access all your project notes in one place
					</p>
				</div>

				{/* Stats Bar */}
				<div
					className={`rounded-2xl border ${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"} p-6 mb-6`}
				>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						<div>
							<div className="flex items-center gap-3">
								<div
									className={`p-3 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
								>
									<DocumentTextIcon className="h-6 w-6 text-lime-500" />
								</div>
								<div>
									<p
										className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
									>
										{notes.length}
									</p>
									<p
										className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
									>
										Total Notes
									</p>
								</div>
							</div>
						</div>

						<div>
							<div className="flex items-center gap-3">
								<div
									className={`p-3 rounded-lg ${isDark ? "bg-yellow-900/30" : "bg-yellow-100"}`}
								>
									<PinIcon className="h-6 w-6 text-yellow-500" />
								</div>
								<div>
									<p
										className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
									>
										{notes.filter((n) => n.isPinned).length}
									</p>
									<p
										className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
									>
										Pinned Notes
									</p>
								</div>
							</div>
						</div>

						<div>
							<div className="flex items-center gap-3">
								<div
									className={`p-3 rounded-lg ${isDark ? "bg-blue-900/30" : "bg-blue-100"}`}
								>
									<TagIcon className="h-6 w-6 text-blue-500" />
								</div>
								<div>
									<p
										className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
									>
										{getAllTags().length}
									</p>
									<p
										className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
									>
										Unique Tags
									</p>
								</div>
							</div>
						</div>

						<div>
							<div className="flex items-center gap-3">
								<div
									className={`p-3 rounded-lg ${isDark ? "bg-purple-900/30" : "bg-purple-100"}`}
								>
									<ClockIcon className="h-6 w-6 text-purple-500" />
								</div>
								<div>
									<p
										className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
									>
										{
											notes.filter((n) => {
												const updated = new Date(
													n.updatedAt || n.createdAt,
												);
												const weekAgo = new Date();
												weekAgo.setDate(
													weekAgo.getDate() - 7,
												);
												return updated > weekAgo;
											}).length
										}
									</p>
									<p
										className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
									>
										Updated This Week
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Action Bar */}
				<div
					className={`rounded-2xl border ${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"} p-6 mb-6`}
				>
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						{/* Project Selector */}
						<div className="relative flex-1">
							<select
								value={selectedProject}
								onChange={(e) =>
									setSelectedProject(e.target.value)
								}
								className={`w-full px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
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
						</div>

						{/* Search Bar */}
						<div className="relative flex-1">
							<div className="absolute left-3 top-1/2 transform -translate-y-1/2">
								<MagnifyingGlassIcon
									className={`h-5 w-5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
								/>
							</div>
							<input
								type="text"
								placeholder="Search notes..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white focus:border-lime-500" : "border-gray-300 bg-white text-gray-900 focus:border-lime-500"} focus:ring-2 focus:ring-lime-500/20 focus:outline-none`}
							/>
						</div>

						{/* Filters */}
						<div className="flex items-center gap-3">
							{/* Tag Filter */}
							<div className="relative">
								<select
									value={tagFilter}
									onChange={(e) =>
										setTagFilter(e.target.value)
									}
									className={`px-4 py-2 rounded-lg border appearance-none pr-8 ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
								>
									<option value="all">All Tags</option>
									{getAllTags().map((tag) => (
										<option key={tag} value={tag}>
											#{tag}
										</option>
									))}
								</select>
								<TagIcon
									className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
								/>
							</div>

							{/* Sort By */}
							<div className="relative">
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
									className={`px-4 py-2 rounded-lg border appearance-none pr-8 ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
								>
									<option value="newest">Newest First</option>
									<option value="oldest">Oldest First</option>
									<option value="title_asc">Title A-Z</option>
									<option value="title_desc">
										Title Z-A
									</option>
									<option value="pinned">Pinned First</option>
								</select>
								<FunnelIcon
									className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
								/>
							</div>

							{/* Create Button */}
							<button
								onClick={() => setShowCreateModal(true)}
								className="px-4 py-2 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700 flex items-center gap-2"
							>
								<PlusIcon className="h-4 w-4" />
								<span>New Note</span>
							</button>
						</div>
					</div>

					{/* Additional Filters Row */}
					<div className="flex items-center gap-3 mt-4">
						{/* Pinned Only Toggle */}
						<button
							onClick={() => setShowPinnedOnly(!showPinnedOnly)}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
								showPinnedOnly
									? isDark
										? "bg-yellow-900/30 text-yellow-400 border border-yellow-500/50"
										: "bg-yellow-50 text-yellow-700 border border-yellow-500"
									: isDark
										? "bg-gray-800 text-gray-300 hover:bg-gray-700"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							<PinIcon className="h-4 w-4" />
							{showPinnedOnly
								? "Showing Pinned Only"
								: "Show Pinned Only"}
						</button>
					</div>
				</div>

				{/* Success/Error Messages */}
				{success && (
					<div
						className={`mb-6 p-4 rounded-lg ${isDark ? "bg-green-900/30 border border-green-800" : "bg-green-50 border border-green-200"}`}
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
						className={`mb-6 p-4 rounded-lg ${isDark ? "bg-red-900/30 border border-red-800" : "bg-red-50 border border-red-200"}`}
					>
						<div className="flex items-center justify-between">
							<p className="text-red-500">{error}</p>
							<button onClick={() => setError("")}>
								<XMarkIcon className="h-4 w-4 text-red-500" />
							</button>
						</div>
					</div>
				)}

				{/* Notes Grid/List */}
				{filteredNotes.length === 0 ? (
					<div
						className={`rounded-2xl border ${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"} p-12 text-center`}
					>
						<DocumentTextIcon
							className={`h-16 w-16 mx-auto mb-4 ${isDark ? "text-gray-700" : "text-gray-300"}`}
						/>
						<h3
							className={`text-xl font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
						>
							{searchQuery ||
							tagFilter !== "all" ||
							showPinnedOnly
								? "No matching notes found"
								: "No notes yet"}
						</h3>
						<p
							className={`mb-6 ${isDark ? "text-gray-500" : "text-gray-500"}`}
						>
							{searchQuery ||
							tagFilter !== "all" ||
							showPinnedOnly
								? "Try adjusting your filters"
								: selectedProject === "all"
									? "Select a project or create your first note"
									: "Create your first note for this project"}
						</p>
						<button
							onClick={() => setShowCreateModal(true)}
							className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700"
						>
							<PlusIcon className="h-4 w-4" />
							Create Note
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredNotes.map((note) => (
							<div
								key={note._id}
								className={`rounded-2xl border overflow-hidden transition hover:shadow-lg ${
									note.isPinned
										? isDark
											? "border-yellow-500/30 bg-yellow-900/10"
											: "border-yellow-500/50 bg-yellow-50"
										: isDark
											? "border-gray-800 bg-gray-900/50 hover:border-lime-500/30"
											: "border-gray-200 bg-white hover:border-lime-500/50"
								}`}
							>
								{/* Note Header */}
								<div
									className={`p-6 ${isDark ? "border-b border-gray-800" : "border-b border-gray-100"}`}
								>
									<div className="flex items-start justify-between mb-4">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												<h3
													className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}
												>
													{note.title}
												</h3>
												{note.isPinned && (
													<PinIcon className="h-4 w-4 text-yellow-500" />
												)}
											</div>

											{selectedProject === "all" &&
												note.projectName && (
													<div className="flex items-center gap-1 mb-2">
														<span
															className={`text-xs px-2 py-1 rounded-full ${isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"}`}
														>
															{note.projectName}
														</span>
													</div>
												)}

											{/* Tags */}
											{note.tags &&
												note.tags.length > 0 && (
													<div className="flex flex-wrap gap-1 mb-4">
														{note.tags
															.slice(0, 3)
															.map(
																(
																	tag,
																	index,
																) => (
																	<span
																		key={
																			index
																		}
																		className={`text-xs px-2 py-1 rounded-full ${isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"}`}
																	>
																		#{tag}
																	</span>
																),
															)}
														{note.tags.length >
															3 && (
															<span
																className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
															>
																+
																{note.tags
																	.length -
																	3}{" "}
																more
															</span>
														)}
													</div>
												)}
										</div>

										{/* Actions */}
										<div className="relative">
											<button
												onClick={() =>
													setShowNoteDetails(
														showNoteDetails ===
															note._id
															? null
															: note._id,
													)
												}
												className={`p-2 rounded-lg ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}
											>
												<EllipsisVerticalIcon className="h-5 w-5" />
											</button>

											{showNoteDetails === note._id && (
												<div
													className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-10 ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}
												>
													<button
														onClick={() =>
															handleUpdateNotePin(
																note._id,
																!note.isPinned,
																note.projectId,
															)
														}
														className={`flex items-center gap-2 w-full px-4 py-3 text-left ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-50 text-gray-700"}`}
													>
														<PinIcon className="h-4 w-4" />
														{note.isPinned
															? "Unpin Note"
															: "Pin Note"}
													</button>
													<Link
														to={`/dashboard/projects/${note.projectId || selectedProject}/notes/${note._id}`}
														className={`flex items-center gap-2 w-full px-4 py-3 text-left ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-50 text-gray-700"}`}
													>
														<ArrowRightIcon className="h-4 w-4" />
														View Details
													</Link>
													<button
														onClick={() => {
															/* Edit note */
														}}
														className={`flex items-center gap-2 w-full px-4 py-3 text-left ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-50 text-gray-700"}`}
													>
														<PencilIcon className="h-4 w-4" />
														Edit Note
													</button>
													<button
														onClick={() =>
															handleDeleteNote(
																note._id,
																note.projectId,
															)
														}
														className={`flex items-center gap-2 w-full px-4 py-3 text-left ${isDark ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-50 text-red-600"}`}
													>
														<TrashIcon className="h-4 w-4" />
														Delete Note
													</button>
												</div>
											)}
										</div>
									</div>

									{/* Content Preview */}
									<p
										className={`text-sm line-clamp-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}
									>
										{truncateContent(note.content, 120)}
									</p>
								</div>

								{/* Note Footer */}
								<div
									className={`p-6 ${isDark ? "bg-gray-900/30" : "bg-gray-50"}`}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="h-8 w-8 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
												{note.createdBy?.username
													?.charAt(0)
													.toUpperCase() || "?"}
											</div>
											<div>
												<p
													className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
												>
													{note.createdBy?.username ||
														"Unknown"}
												</p>
												<p
													className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
												>
													{formatDate(
														note.updatedAt ||
															note.createdAt,
													)}
												</p>
											</div>
										</div>

										<Link
											to={`/dashboard/projects/${note.projectId || selectedProject}/notes/${note._id}`}
											className={`text-sm font-medium ${isDark ? "text-lime-400 hover:text-lime-300" : "text-lime-600 hover:text-lime-800"}`}
										>
											Read More →
										</Link>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Pagination/Info */}
				<div className="mt-6 flex items-center justify-between">
					<p className={isDark ? "text-gray-400" : "text-gray-600"}>
						Showing {filteredNotes.length} of {notes.length} notes
					</p>
					<div className="flex items-center gap-2">
						<button
							className={`px-3 py-1 rounded ${isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}
							disabled
						>
							Previous
						</button>
						<span
							className={
								isDark ? "text-gray-400" : "text-gray-600"
							}
						>
							Page 1
						</span>
						<button
							className={`px-3 py-1 rounded ${isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}
							disabled
						>
							Next
						</button>
					</div>
				</div>
			</div>

			{/* Create Note Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div
						className={`w-full max-w-2xl rounded-2xl ${isDark ? "bg-gray-900" : "bg-white"} p-6`}
					>
						<div className="flex items-center justify-between mb-6">
							<h3
								className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
							>
								<PlusIcon className="h-5 w-5 inline mr-2" />
								Create New Note
							</h3>
							<button
								onClick={() => setShowCreateModal(false)}
								className={`p-2 rounded-lg ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}
							>
								<XMarkIcon className="h-5 w-5" />
							</button>
						</div>

						<form onSubmit={handleCreateNote}>
							<div className="space-y-6">
								{/* Project Selection (if viewing all projects) */}
								{selectedProject === "all" && (
									<div>
										<label
											className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
										>
											Project *
										</label>
										<select
											value={selectedProject}
											onChange={(e) =>
												setSelectedProject(
													e.target.value,
												)
											}
											className={`w-full px-4 py-3 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
											required
										>
											<option value="">
												Select a project
											</option>
											{projects.map((project) => (
												<option
													key={project._id}
													value={project._id}
												>
													{project.name}
												</option>
											))}
										</select>
									</div>
								)}

								<div className="grid md:grid-cols-2 gap-6">
									{/* Note Title */}
									<div className="md:col-span-2">
										<label
											className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
										>
											Note Title *
										</label>
										<input
											type="text"
											value={newNote.title}
											onChange={(e) =>
												setNewNote({
													...newNote,
													title: e.target.value,
												})
											}
											placeholder="Enter a descriptive title..."
											className={`w-full px-4 py-3 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white focus:border-lime-500" : "border-gray-300 bg-white text-gray-900 focus:border-lime-500"} focus:ring-2 focus:ring-lime-500/20 focus:outline-none`}
											required
										/>
									</div>

									{/* Content */}
									<div className="md:col-span-2">
										<label
											className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
										>
											Content *
										</label>
										<textarea
											value={newNote.content}
											onChange={(e) =>
												setNewNote({
													...newNote,
													content: e.target.value,
												})
											}
											placeholder="Write your note here... (Markdown supported)"
											rows="8"
											className={`w-full px-4 py-3 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"} font-mono text-sm`}
											required
										/>
										<p
											className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-500"}`}
										>
											You can use Markdown formatting for
											rich text
										</p>
									</div>

									{/* Tags */}
									<div className="md:col-span-2">
										<label
											className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
										>
											Tags
										</label>
										<div className="flex gap-2 mb-2">
											<input
												type="text"
												value={tagInput}
												onChange={(e) =>
													setTagInput(e.target.value)
												}
												onKeyPress={(e) =>
													e.key === "Enter" &&
													(e.preventDefault(),
													addTag())
												}
												placeholder="Add a tag and press Enter"
												className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
											/>
											<button
												type="button"
												onClick={addTag}
												className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
											>
												Add
											</button>
										</div>
										<div className="flex flex-wrap gap-2">
											{newNote.tags.map((tag, index) => (
												<span
													key={index}
													className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"}`}
												>
													#{tag}
													<button
														type="button"
														onClick={() =>
															removeTag(tag)
														}
														className="ml-1 hover:text-red-500"
													>
														<XMarkIcon className="h-3 w-3" />
													</button>
												</span>
											))}
										</div>
									</div>

									{/* Pinned Toggle */}
									<div>
										<label className="flex items-center gap-2 cursor-pointer">
											<div className="relative">
												<input
													type="checkbox"
													checked={newNote.isPinned}
													onChange={(e) =>
														setNewNote({
															...newNote,
															isPinned:
																e.target
																	.checked,
														})
													}
													className="sr-only"
												/>
												<div
													className={`w-10 h-6 rounded-full transition ${newNote.isPinned ? "bg-lime-500" : isDark ? "bg-gray-700" : "bg-gray-300"}`}
												></div>
												<div
													className={`absolute left-1 top-1 w-4 h-4 rounded-full transition transform ${newNote.isPinned ? "translate-x-4 bg-white" : isDark ? "bg-gray-400" : "bg-white"}`}
												></div>
											</div>
											<span
												className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
											>
												<PinIcon className="h-4 w-4 inline mr-1" />
												Pin this note
											</span>
										</label>
										<p
											className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
										>
											Pinned notes appear at the top
										</p>
									</div>
								</div>
							</div>

							<div className="flex items-center gap-3 mt-6">
								<button
									type="submit"
									className="flex-1 px-6 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg font-medium hover:from-lime-600 hover:to-lime-700"
								>
									Create Note
								</button>
								<button
									type="button"
									onClick={() => setShowCreateModal(false)}
									className={`flex-1 px-6 py-3 rounded-lg font-medium ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
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
