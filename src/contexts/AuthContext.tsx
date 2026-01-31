import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import apiClient from "../api/client";

export type UserRole = "admin" | "customer";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  role: UserRole;
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
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ============================================================================
     RESTORE SESSION ON PAGE REFRESH
  ============================================================================ */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("auth_user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to restore user session:", error);
        localStorage.removeItem("auth_user");
        localStorage.removeItem("accessToken");
      }
    }

    setIsLoading(false);
  }, []);

  /* ============================================================================
     LOGIN (REAL BACKEND AUTH)
  ============================================================================ */
  const login = async ({
    email,
    password,
  }: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      const data = response.data?.data;
      const accessToken = data?.accessToken;
      const user: User = data?.user;

      if (!accessToken || !user?.id) {
        throw new Error("Invalid login response from server");
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("auth_user", JSON.stringify(user));

      setUser(user);
      return true;
    } catch (error: any) {
      console.error(
        "Login failed:",
        error?.response?.data || error.message
      );
      logout();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /* ============================================================================
     LOGOUT
  ============================================================================ */
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  /* ============================================================================
     GET ACCESS TOKEN
  ============================================================================ */
  const getToken = () => {
    return localStorage.getItem("accessToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
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

/* ============================================================================
   CUSTOM HOOK
============================================================================ */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
