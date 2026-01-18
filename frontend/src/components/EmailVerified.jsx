export default function EmailVerified() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-2xl font-bold">Email verified</h1>
				<p className="mt-2 text-gray-500">
					You can now log in to your account.
				</p>
				<a
					href="/login"
					className="mt-4 inline-block text-blue-600 underline"
				>
					Go to login
				</a>
			</div>
		</div>
	);
}
