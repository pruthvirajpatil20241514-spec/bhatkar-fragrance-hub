import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/api/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  /* ============================================================================
     CLOSE MODAL ON OUTSIDE CLICK
  ============================================================================ */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  /* ============================================================================
     REDIRECT ADMIN AFTER LOGIN
  ============================================================================ */
  useEffect(() => {
    if (user?.role === "admin" && !isOpen) {
      navigate("/admin/dashboard");
    }
  }, [user, navigate, isOpen]);

  /* ============================================================================
     LOGIN HANDLER (REAL AUTH)
  ============================================================================ */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(loginData);

      if (success) {
        onClose();
        setLoginData({ email: "", password: "" });
      } else {
        setError("Invalid email or password");
      }
    } catch {
      setError("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  /* ============================================================================
     SIGNUP HANDLER (FIXED)
  ============================================================================ */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (signupData.password !== signupData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (signupData.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Split full name
      const parts = signupData.name.trim().split(/\s+/);
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ") || "";

      // 👉 REGISTER USER (THIS WAS MISSING EARLIER)
      await apiClient.post("/auth/register", {
        email: signupData.email,
        password: signupData.password,
        firstName,
        lastName,
      });

      // 👉 LOGIN AFTER SUCCESSFUL SIGNUP
      const success = await login({
        email: signupData.email,
        password: signupData.password,
      });

      if (success) {
        onClose();
        setSignupData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        setError(
          "Account created but login failed. Please log in manually."
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err.message || "Sign up failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 mt-2 w-96 bg-background border border-border rounded-lg shadow-xl z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-bold">
              {isLogin ? "Log In" : "Sign Up"}
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  required
                />

                <Input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  required
                />

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Logging in..." : "Log In"}
                </Button>

                <p className="text-xs text-center">
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setError("");
                    }}
                    className="text-primary underline"
                  >
                    Sign Up
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <Input
                  placeholder="Full Name"
                  value={signupData.name}
                  onChange={(e) =>
                    setSignupData({ ...signupData, name: e.target.value })
                  }
                  required
                />

                <Input
                  type="email"
                  placeholder="Email"
                  value={signupData.email}
                  onChange={(e) =>
                    setSignupData({ ...signupData, email: e.target.value })
                  }
                  required
                />

                <Input
                  type="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                  required
                />

                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>

                <p className="text-xs text-center">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setError("");
                    }}
                    className="text-primary underline"
                  >
                    Log In
                  </button>
                </p>
              </form>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
