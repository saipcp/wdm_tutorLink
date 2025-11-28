import React, { useState } from "react";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  Eye,
  EyeOff,
  Monitor,
  Keyboard,
  Volume2,
  Save,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AccessibilityAudit from "../components/Layout/AccessibilityAudit";

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "notifications" | "privacy" | "payment" | "accessibility"
  >("profile");
  const [settings, setSettings] = useState({
    profile: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: "",
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      sessionReminders: true,
      newMessages: true,
      weeklyReports: false,
    },
    privacy: {
      profileVisibility: "public",
      showOnlineStatus: true,
      allowMessages: true,
      dataSharing: false,
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      screenReader: false,
    },
  });

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Settings saved:", settings);
    // Show success message
    alert("Settings saved successfully!");
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "accessibility", label: "Accessibility", icon: Eye },
  ];

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences and accessibility options
          </p>
        </div>
        <button
          onClick={handleSave}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Settings Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Settings */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Profile Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={settings.profile.firstName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        profile: {
                          ...settings.profile,
                          firstName: e.target.value,
                        },
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={settings.profile.lastName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        profile: {
                          ...settings.profile,
                          lastName: e.target.value,
                        },
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        profile: { ...settings.profile, email: e.target.value },
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        profile: { ...settings.profile, phone: e.target.value },
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={settings.profile.bio}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      profile: { ...settings.profile, bio: e.target.value },
                    })
                  }
                  rows={4}
                  className="input-field"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Notification Preferences
              </h3>
              <div className="space-y-4">
                {[
                  {
                    key: "emailNotifications",
                    label: "Email Notifications",
                    desc: "Receive updates via email",
                  },
                  {
                    key: "pushNotifications",
                    label: "Push Notifications",
                    desc: "Get notified in your browser",
                  },
                  {
                    key: "sessionReminders",
                    label: "Session Reminders",
                    desc: "Reminders before tutoring sessions",
                  },
                  {
                    key: "newMessages",
                    label: "New Messages",
                    desc: "Notifications for new messages",
                  },
                  {
                    key: "weeklyReports",
                    label: "Weekly Reports",
                    desc: "Weekly progress summaries",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.label}
                      </div>
                      <div className="text-sm text-gray-600">{item.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          settings.notifications[
                            item.key as keyof typeof settings.notifications
                          ]
                        }
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              [item.key]: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Privacy & Security
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Visibility
                  </label>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        privacy: {
                          ...settings.privacy,
                          profileVisibility: e.target.value,
                        },
                      })
                    }
                    className="input-field"
                  >
                    <option value="public">Public</option>
                    <option value="students">Students Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                {[
                  {
                    key: "showOnlineStatus",
                    label: "Show Online Status",
                    desc: "Let others see when you're online",
                  },
                  {
                    key: "allowMessages",
                    label: "Allow Direct Messages",
                    desc: "Receive messages from other users",
                  },
                  {
                    key: "dataSharing",
                    label: "Data Sharing",
                    desc: "Share anonymous usage data to improve the platform",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.label}
                      </div>
                      <div className="text-sm text-gray-600">{item.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          settings.privacy[
                            item.key as keyof typeof settings.privacy
                          ]
                        }
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            privacy: {
                              ...settings.privacy,
                              [item.key]: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === "payment" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Methods
              </h3>
              <div className="space-y-4">
                <div className="card bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          •••• •••• •••• 4242
                        </div>
                        <div className="text-sm text-gray-600">
                          Expires 12/25
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-green-600 font-medium">
                      Primary
                    </span>
                  </div>
                </div>

                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Add Payment Method</span>
                </button>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Payment History
                  </h4>
                  <div className="space-y-2">
                    {[
                      {
                        date: "2025-01-15",
                        amount: "$50.00",
                        description: "Tutoring Session - Math",
                      },
                      {
                        date: "2025-01-10",
                        amount: "$75.00",
                        description: "Tutoring Session - Physics",
                      },
                      {
                        date: "2025-01-05",
                        amount: "$25.00",
                        description: "Study Plan Consultation",
                      },
                    ].map((payment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {payment.description}
                          </div>
                          <div className="text-sm text-gray-600">
                            {payment.date}
                          </div>
                        </div>
                        <div className="font-medium text-gray-900">
                          {payment.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Accessibility Settings */}
        {activeTab === "accessibility" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Accessibility Options
              </h3>
              <div className="space-y-4">
                {[
                  {
                    key: "reducedMotion",
                    label: "Reduced Motion",
                    desc: "Minimize animations and transitions",
                  },
                  {
                    key: "highContrast",
                    label: "High Contrast",
                    desc: "Increase contrast for better visibility",
                  },
                  {
                    key: "largeText",
                    label: "Large Text",
                    desc: "Use larger text throughout the interface",
                  },
                  {
                    key: "screenReader",
                    label: "Screen Reader Support",
                    desc: "Optimize for screen reader compatibility",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.label}
                      </div>
                      <div className="text-sm text-gray-600">{item.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          settings.accessibility[
                            item.key as keyof typeof settings.accessibility
                          ]
                        }
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            accessibility: {
                              ...settings.accessibility,
                              [item.key]: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Accessibility Audit Component */}
            <div className="pt-6 border-t border-gray-200">
              <AccessibilityAudit />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
