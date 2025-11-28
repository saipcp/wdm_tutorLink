import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  BookOpen,
  User,
  LogOut,
  Settings,
  Bell,
  MessageSquare,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../../services/api";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const notificationsQuery = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () =>
      user?.id
        ? notificationsApi.getNotifications(user.id)
        : Promise.resolve([]),
    enabled: !!user?.id,
    refetchInterval: 10000,
  });

  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(user?.id || ""),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });

  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "student":
        return "/student";
      case "tutor":
        return "/tutor";
      case "admin":
        return "/admin";
      default:
        return "/student";
    }
  };

  const navigationItems = [
    { name: "Find Tutors", href: "/browse", roles: ["student", "tutor"] },
    {
      name: "Study Planner",
      href: "/student/study-planner",
      roles: ["student"],
    },
    { name: "My Sessions", href: "/student/sessions", roles: ["student"] },
    { name: "Messages", href: "/messages", roles: ["student", "tutor"] },
    { name: "Tasks", href: "/tasks", roles: ["student", "tutor"] },
    { name: "My Schedule", href: "/tutor/schedule", roles: ["tutor"] },
    { name: "Students", href: "/tutor/students", roles: ["tutor"] },
  ];

  const filteredNavItems = navigationItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || "")
  );

  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200">
      <div className="max-w-full mx-auto sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 py-2">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-secondary-900">
                TutorLink
              </span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-secondary-600 hover:text-secondary-900 relative"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {/** unread count */}
                    {notificationsQuery.data &&
                      notificationsQuery.data.filter((n: any) => !n.isRead)
                        .length > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 text-[11px] bg-red-500 text-white rounded-full flex items-center justify-center">
                          {
                            notificationsQuery.data.filter(
                              (n: any) => !n.isRead
                            ).length
                          }
                        </span>
                      )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-secondary-200 z-50">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-secondary-100">
                        <div className="font-medium text-sm">Notifications</div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => markAllMutation.mutate()}
                            className="text-xs text-secondary-500 hover:underline"
                          >
                            Mark all read
                          </button>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="text-xs text-secondary-400"
                          >
                            Close
                          </button>
                        </div>
                      </div>

                      <div className="max-h-64 overflow-auto p-2 space-y-2">
                        {notificationsQuery.isLoading ? (
                          <div className="p-3 text-sm text-gray-500">
                            Loading…
                          </div>
                        ) : !notificationsQuery.data ||
                          notificationsQuery.data.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500">
                            No notifications
                          </div>
                        ) : (
                          notificationsQuery.data.slice(0, 6).map((n: any) => (
                            <div
                              key={n.id}
                              className={`p-3 rounded border ${
                                n.isRead
                                  ? "bg-white"
                                  : "bg-blue-50 border-blue-200"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="text-sm text-gray-800">
                                  <div className="font-medium truncate">
                                    {n.type}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                                    {JSON.stringify(n.payload)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-gray-400">
                                    {new Date(n.createdAt).toLocaleString()}
                                  </div>
                                  {!n.isRead && (
                                    <button
                                      onClick={() =>
                                        markAsReadMutation.mutate(n.id)
                                      }
                                      className="text-xs mt-2 text-blue-600"
                                    >
                                      Mark
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="border-t border-secondary-100 p-2 text-center">
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            navigate("/notifications");
                          }}
                          className="text-sm text-primary-600 hover:underline"
                        >
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100"
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        `${user?.firstName || "Unknown"} ${
                          user?.lastName || "User"
                        }`
                      )}&size=32&background=3B82F6&color=FFFFFF&bold=true`}
                      alt={`${user?.firstName || "Unknown"} ${
                        user?.lastName || "User"
                      }`}
                      className="h-8 w-8 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const initials = `${user?.firstName?.[0] || "?"}${
                          user?.lastName?.[0] || "?"
                        }`;
                        target.src = `data:image/svg+xml;base64,${btoa(`
                          <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" fill="#3B82F6"/>
                            <text x="16" y="22" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
                          </svg>
                        `)}`;
                      }}
                    />
                    <span className="hidden sm:block text-sm font-medium text-secondary-700">
                      {user?.firstName}
                    </span>
                  </button>

                  {/* User dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50">
                      <Link
                        to={`${getDashboardPath()}/profile`}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to={`${getDashboardPath()}/settings`}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      <Link
                        to={`${getDashboardPath()}/payment`}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Payment</span>
                      </Link>
                      <hr className="my-1 border-secondary-200" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn-secondary">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-secondary-200 py-4">
            <div className="space-y-2">
              {isAuthenticated ? (
                <>
                  {/* Always show dashboard navigation in mobile menu */}
                  <Link
                    to={getDashboardPath()}
                    className="block px-3 py-2 text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-secondary-50 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {filteredNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-3 py-2 text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-secondary-50 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-secondary-50 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-base font-medium text-primary-600 hover:bg-primary-50 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Backdrop for mobile menu */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {/* Backdrop for user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Backdrop for notifications dropdown */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
