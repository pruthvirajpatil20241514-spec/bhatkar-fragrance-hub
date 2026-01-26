import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";

export type UserRole = "admin" | "customer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to load user from storage:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  const generateMockToken = () => {
    return "mock_jwt_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!credentials.email.includes("@")) {
        throw new Error("Invalid email format");
      }

      if (credentials.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Admin credentials check
      const isAdmin = credentials.email === "admin@bhatkar.com" && credentials.password === "admin123";

      const mockUser: User = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        email: credentials.email,
        name: credentials.email.split("@")[0],
        role: isAdmin ? "admin" : "customer",
        phone: "+91 98765 43210",
      };

      const token = generateMockToken();

      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(mockUser));

      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  const getToken = () => {
    return localStorage.getItem("auth_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
