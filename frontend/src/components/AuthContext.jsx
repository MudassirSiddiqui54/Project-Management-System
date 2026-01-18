import { createContext, useState, useContext, useEffect } from "react";
import {
	getCurrentUser,
	logout as logoutApi,
	login as loginApi,
} from "../api/auth.api";

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
			setUser(response.data.data);
		} catch (error) {
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	const login = (userData) => {
		setUser(userData);
		window.location.href = "/dashboard";
	};

	const logout = async () => {
		try {
			await logoutApi(); // backend clears cookie
		} catch (err) {
			// ignore 401 here, see explanation below
		} finally {
			setUser(null);
			window.location.href = "/";
		}
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
