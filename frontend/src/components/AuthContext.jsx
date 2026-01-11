import { createContext, useState, useContext, useEffect } from "react";
import { getCurrentUser } from "../api/auth.api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = async () => {
		try {
			const response = await getCurrentUser();
			setUser(response.data.user);
		} catch (error) {
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	const login = (userData) => {
		setUser(userData);
	};

	const logout = async () => {
		setUser(null);
		// You might want to call logout API here
	};

	const value = {
		user,
		loading,
		login,
		logout,
		isAuthenticated: !!user,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
};
