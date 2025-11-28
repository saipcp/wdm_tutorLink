import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Navigate } from "react-router-dom";
import { User, AuthState } from "../types";
import { authApi, usersApi } from "../services/mockApi";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "student" | "tutor" | "admin";
  }) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is already logged in (e.g., from localStorage in real app)
        const savedUser = localStorage.getItem("tutorlink_user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setAuthState({
            user,
            isAuthenticated: true,
            loading: false,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true }));

      const result = await authApi.login(email, password);

      // Save to localStorage (in real app, use secure storage)
      localStorage.setItem("tutorlink_user", JSON.stringify(result.user));

      setAuthState({
        user: result.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      setAuthState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();

      // Clear localStorage
      localStorage.removeItem("tutorlink_user");

      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if API call fails, clear local state
      localStorage.removeItem("tutorlink_user");
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "student" | "tutor" | "admin";
  }) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true }));

      const newUser = await authApi.register({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
      });

      // Save to localStorage
      localStorage.setItem("tutorlink_user", JSON.stringify(newUser));

      setAuthState({
        user: newUser,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      setAuthState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!authState.user) throw new Error("No user logged in");

    try {
      const updatedUser = await usersApi.updateProfile(
        authState.user.id,
        updates
      );

      // Update localStorage
      localStorage.setItem("tutorlink_user", JSON.stringify(updatedUser));

      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authApi.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await authApi.resetPassword(token, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    updateProfile,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Utility function to get role-based dashboard path
const getDashboardPath = (role: string) => {
  switch (role) {
    case "tutor":
      return "/tutor";
    case "admin":
      return "/admin";
    default:
      return "/student";
  }
};

// Helper hooks for role-based access
export const useRole = () => {
  const { user } = useAuth();
  return user?.role;
};

export const useIsStudent = () => {
  const role = useRole();
  return role === "student";
};

export const useIsTutor = () => {
  const role = useRole();
  return role === "tutor";
};

export const useIsAdmin = () => {
  const role = useRole();
  return role === "admin";
};

// Protected route component
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("student" | "tutor" | "admin")[];
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ["student", "tutor", "admin"],
  fallback = null,
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Access Denied
          </h1>
          <p className="text-secondary-600 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-secondary-500">
            Required role: {allowedRoles.join(" or ")}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Public auth route component - only allows unauthenticated users
interface PublicAuthRouteProps {
  children: ReactNode;
}

export const PublicAuthRoute: React.FC<PublicAuthRouteProps> = ({
  children,
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Redirect authenticated users to their role-based dashboard
    const dashboardPath = getDashboardPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};
