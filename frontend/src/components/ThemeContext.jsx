import { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
	// Get initial theme from localStorage or default to 'light'
	const [theme, setTheme] = useState(() => {
		const savedTheme = localStorage.getItem("theme");
		return savedTheme || "light";
	});

	useEffect(() => {
		// Save theme to localStorage whenever it changes
		localStorage.setItem("theme", theme);

		// Update HTML class for Tailwind dark mode
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
	};

	const value = {
		theme,
		toggleTheme,
		isDark: theme === "dark",
	};

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
