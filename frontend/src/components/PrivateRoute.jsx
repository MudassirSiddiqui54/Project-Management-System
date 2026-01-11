import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function PrivateRoute({ children }) {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
			</div>
		);
	}

	return isAuthenticated ? children : <Navigate to="/login" />;
}
