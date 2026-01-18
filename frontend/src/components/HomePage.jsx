import { Link } from "react-router-dom";
import { useTheme } from "../components/ThemeContext.jsx";
import {
	CheckCircleIcon,
	UserGroupIcon,
	DocumentCheckIcon,
	ChartBarIcon,
	ArrowRightIcon,
	ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function HomePage() {
	const { isDark } = useTheme();

	const features = [
		{
			icon: <UserGroupIcon className="h-8 w-8" />,
			title: "Team Collaboration",
			description:
				"Work together seamlessly with your team in real-time.",
		},
		{
			icon: <DocumentCheckIcon className="h-8 w-8" />,
			title: "Task Management",
			description: "Create, assign, and track tasks with ease.",
		},
		{
			icon: <ChartBarIcon className="h-8 w-8" />,
			title: "Progress Tracking",
			description:
				"Visualize project progress with intuitive dashboards.",
		},
		{
			icon: <ShieldCheckIcon className="h-8 w-8" />,
			title: "Secure & Private",
			description:
				"Your data is protected with enterprise-grade security.",
		},
	];

	return (
		<div
			className={`min-h-screen ${
				isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
			}`}
		>
			{/* Hero Section */}
			<div className="container mx-auto px-4 py-16 md:py-24">
				<div className="text-center max-w-4xl mx-auto">
					<div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 overflow-hidden">
						<img
							src="/favicon.ico"
							alt="Logo"
							className="w-full h-full object-cover"
						/>
					</div>

					<h1 className="text-5xl md:text-6xl font-bold mb-6">
						Organize. Collaborate.{" "}
						<span className="bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-emerald-500">
							Succeed.
						</span>
					</h1>

					<p className="text-xl mb-10 max-w-2xl mx-auto opacity-80">
						Project Camp is your all-in-one project management
						solution. Streamline workflows, boost productivity, and
						deliver projects faster.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
						<Link
							to="/register"
							className="px-8 py-4 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-xl font-semibold text-lg hover:from-lime-600 hover:to-lime-700 transition-all flex items-center justify-center gap-2 shadow-lg"
						>
							Start Free Trial
							<ArrowRightIcon className="h-5 w-5" />
						</Link>
						<Link
							to="/login"
							className={`px-8 py-4 rounded-xl font-semibold text-lg border transition ${
								isDark
									? "border-gray-700 hover:bg-gray-800"
									: "border-gray-300 hover:bg-white"
							}`}
						>
							Sign In
						</Link>
					</div>

					{/* Dashboard Preview */}
					<div
						className={`rounded-2xl overflow-hidden shadow-2xl mb-20 border ${
							isDark ? "border-gray-800" : "border-gray-200"
						}`}
					>
						<div
							className={`p-4 ${
								isDark ? "bg-gray-900" : "bg-gray-100"
							} flex items-center justify-between`}
						>
							<div className="flex items-center space-x-2">
								<div className="h-3 w-3 rounded-full bg-red-500"></div>
								<div className="h-3 w-3 rounded-full bg-yellow-500"></div>
								<div className="h-3 w-3 rounded-full bg-green-500"></div>
							</div>
							<div
								className={`text-sm ${
									isDark ? "text-gray-400" : "text-gray-500"
								}`}
							>
								dashboard.projectcamp.com
							</div>
						</div>
						<div
							className={`aspect-video ${
								isDark ? "bg-gray-900" : "bg-white"
							} flex items-center justify-center`}
						>
							<div className="text-center p-8">
								<div className="text-4xl mb-4">📊</div>
								<h3 className="text-2xl font-bold mb-2">
									Project Dashboard Preview
								</h3>
								<p className="opacity-70">
									Visualize your project progress in real-time
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Features Section */}
				<div className="max-w-6xl mx-auto">
					<h2 className="text-4xl font-bold text-center mb-4">
						Everything You Need
					</h2>
					<p
						className={`text-center text-xl mb-12 max-w-3xl mx-auto ${
							isDark ? "text-gray-400" : "text-gray-600"
						}`}
					>
						Powerful features designed to streamline your project
						management workflow.
					</p>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
						{features.map((feature, index) => (
							<div
								key={index}
								className={`p-6 rounded-2xl border transition hover:shadow-xl ${
									isDark
										? "bg-gray-900/50 border-gray-800 hover:border-lime-500/30"
										: "bg-white border-gray-200 hover:border-lime-500/50"
								}`}
							>
								<div className="text-lime-500 mb-4">
									{feature.icon}
								</div>
								<h3 className="text-xl font-bold mb-3">
									{feature.title}
								</h3>
								<p
									className={
										isDark
											? "text-gray-400"
											: "text-gray-600"
									}
								>
									{feature.description}
								</p>
							</div>
						))}
					</div>

					{/* CTA Section */}
					<div
						className={`rounded-3xl p-8 md:p-12 text-center ${
							isDark
								? "bg-gradient-to-br from-gray-900 to-gray-800"
								: "bg-gradient-to-br from-gray-50 to-white"
						} border ${
							isDark ? "border-gray-800" : "border-gray-200"
						} shadow-xl`}
					>
						<CheckCircleIcon className="h-16 w-16 text-lime-500 mx-auto mb-6" />
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Ready to Transform Your Workflow?
						</h2>
						<p
							className={`text-xl mb-8 max-w-2xl mx-auto ${
								isDark ? "text-gray-300" : "text-gray-600"
							}`}
						>
							Join thousands of teams already using Project Camp
							to deliver projects faster.
						</p>
						<Link
							to="/register"
							className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-xl font-semibold text-lg hover:from-lime-600 hover:to-lime-700 transition-all shadow-lg"
						>
							Get Started For Free
							<ArrowRightIcon className="h-5 w-5" />
						</Link>
						<p
							className={`mt-4 text-sm ${
								isDark ? "text-gray-400" : "text-gray-500"
							}`}
						>
							No credit card required • 14-day free trial
						</p>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer
				className={`border-t ${
					isDark
						? "border-gray-800 bg-gray-900"
						: "border-gray-200 bg-white"
				}`}
			>
				<div className="container mx-auto px-4 py-8">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<div className="flex items-center space-x-2 mb-4 md:mb-0">
							<img
								src="/favicon.ico"
								alt="Logo"
								className="h-6 w-6"
							/>
							<span className="font-bold">
								Project
								<span className="text-lime-500">Camp</span>
							</span>
						</div>
						<div
							className={`text-sm ${
								isDark ? "text-gray-400" : "text-gray-600"
							}`}
						>
							© {new Date().getFullYear()} Project Camp. All
							rights reserved.
						</div>
						<div className="flex space-x-6 mt-4 md:mt-0">
							<a
								href="/privacy"
								className={`text-sm hover:text-lime-500 ${
									isDark ? "text-gray-400" : "text-gray-600"
								}`}
							>
								Privacy Policy
							</a>
							<a
								href="/terms"
								className={`text-sm hover:text-lime-500 ${
									isDark ? "text-gray-400" : "text-gray-600"
								}`}
							>
								Terms of Service
							</a>
							<a
								href="/contact"
								className={`text-sm hover:text-lime-500 ${
									isDark ? "text-gray-400" : "text-gray-600"
								}`}
							>
								Contact
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
