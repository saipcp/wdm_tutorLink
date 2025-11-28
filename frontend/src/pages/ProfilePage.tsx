import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  Calendar,
  Award,
  BookOpen,
  Star,
  GraduationCap,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  usersApi,
  tutorsApi,
  studentsApi,
  sessionsApi,
  reviewsApi,
} from "../services/mockApi";
import type { TutorProfile, StudentProfile } from "../types";

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Role-specific profile data
  const { data: tutorProfile } = useQuery({
    queryKey: ["tutorProfile", user?.id],
    queryFn: () => tutorsApi.getTutorById(user!.id),
    enabled: !!user?.id && user.role === "tutor",
  });

  const { data: studentProfile } = useQuery({
    queryKey: ["studentProfile", user?.id],
    queryFn: () => studentsApi.getStudentProfile(user!.id),
    enabled: !!user?.id && user.role === "student",
  });

  // Statistics queries
  const { data: sessions } = useQuery({
    queryKey: ["sessions", user?.id, user?.role],
    queryFn: () =>
      sessionsApi.getSessions(user!.id, user!.role as "student" | "tutor"),
    enabled: !!user?.id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", user?.id],
    queryFn: () => reviewsApi.getReviewsForUser(user!.id),
    enabled: !!user?.id,
  });

  // Mutations
  const updateUserMutation = useMutation({
    mutationFn: (updates: Partial<typeof editForm>) =>
      usersApi.updateProfile(user!.id, updates),
    onSuccess: (updatedUser) => {
      updateProfile(updatedUser);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["tutorProfile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["studentProfile", user?.id] });
    },
  });

  const handleEdit = () => {
    setEditForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await updateUserMutation.mutateAsync(editForm);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate statistics
  const totalSessions = sessions?.length || 0;
  const completedSessions =
    sessions?.filter((s) => s.status === "completed").length || 0;
  const averageRating = reviews?.length
    ? (
        reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      ).toFixed(1)
    : "0.0";

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Profile</h1>
          <p className="text-secondary-600">Manage your account information</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="btn-secondary flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">
                Basic Information
              </h3>
              <User className="h-5 w-5 text-secondary-400" />
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      `${user.firstName || "Unknown"} ${
                        user.lastName || "User"
                      }`
                    )}&size=80&background=3B82F6&color=FFFFFF&bold=true`}
                    alt={`${user.firstName || "Unknown"} ${
                      user.lastName || "User"
                    }`}
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      // Fallback to initials in a colored circle if image fails
                      const target = e.target as HTMLImageElement;
                      const initials = `${user.firstName?.[0] || "?"}${
                        user.lastName?.[0] || "?"
                      }`;
                      target.src = `data:image/svg+xml;base64,${btoa(`
                        <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                          <rect width="80" height="80" fill="#3B82F6"/>
                          <text x="40" y="50" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
                        </svg>
                      `)}`;
                    }}
                  />
                  <div>
                    <h4 className="text-xl font-semibold text-secondary-900">
                      {user.firstName} {user.lastName}
                    </h4>
                    <p className="text-secondary-600 capitalize">{user.role}</p>
                    <p className="text-sm text-secondary-500">
                      Member since{" "}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-secondary-200">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-secondary-400" />
                    <span className="text-sm text-secondary-600">
                      {user.email}
                    </span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-secondary-400" />
                      <span className="text-sm text-secondary-600">
                        {user.phone}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-secondary-400" />
                    <span className="text-sm text-secondary-600">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Role-specific Information */}
          {user.role === "tutor" && tutorProfile && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Tutor Profile
                </h3>
                <Award className="h-5 w-5 text-secondary-400" />
              </div>
              <div className="space-y-4">
                {tutorProfile.bio && (
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-2">Bio</h4>
                    <p className="text-secondary-600">{tutorProfile.bio}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-2">
                      Rating
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-secondary-600">
                        {averageRating} ({reviews?.length || 0} reviews)
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-2">
                      Experience
                    </h4>
                    <span className="text-secondary-600">
                      {tutorProfile.experience} years
                    </span>
                  </div>
                  {tutorProfile.hourlyRate && (
                    <div>
                      <h4 className="font-medium text-secondary-900 mb-2">
                        Hourly Rate
                      </h4>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-secondary-600">
                          ${tutorProfile.hourlyRate}
                        </span>
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-2">
                      Languages
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {tutorProfile.languages.map((lang) => (
                        <span
                          key={lang}
                          className="text-xs px-2 py-1 bg-secondary-100 text-secondary-700 rounded"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {tutorProfile.subjects.length > 0 && (
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-2">
                      Subjects
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {tutorProfile.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {tutorProfile.education.length > 0 && (
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-2">
                      Education
                    </h4>
                    <div className="space-y-1">
                      {tutorProfile.education.map((edu, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <GraduationCap className="h-4 w-4 text-secondary-400" />
                          <span className="text-sm text-secondary-600">
                            {edu}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {user.role === "student" && studentProfile && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Student Profile
                </h3>
                <BookOpen className="h-5 w-5 text-secondary-400" />
              </div>
              <div className="space-y-4">
                {studentProfile.grade && (
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-2">
                      Grade
                    </h4>
                    <span className="text-secondary-600">
                      {studentProfile.grade}
                    </span>
                  </div>
                )}
                {studentProfile.school && (
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-2">
                      School
                    </h4>
                    <span className="text-secondary-600">
                      {studentProfile.school}
                    </span>
                  </div>
                )}
                {studentProfile.preferences && (
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-2">
                      Learning Preferences
                    </h4>
                    <div className="space-y-2">
                      {studentProfile.preferences.subjects.length > 0 && (
                        <div>
                          <span className="text-sm text-secondary-500">
                            Preferred Subjects:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {studentProfile.preferences.subjects.map(
                              (subject) => (
                                <span
                                  key={subject}
                                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                                >
                                  {subject}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                      {studentProfile.preferences.goals.length > 0 && (
                        <div>
                          <span className="text-sm text-secondary-500">
                            Goals:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {studentProfile.preferences.goals.map((goal) => (
                              <span
                                key={goal}
                                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                              >
                                {goal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Statistics Sidebar */}
        <div className="space-y-6">
          {/* Account Statistics */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Account Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Total Sessions</span>
                <span className="font-semibold text-secondary-900">
                  {totalSessions}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Completed Sessions</span>
                <span className="font-semibold text-green-600">
                  {completedSessions}
                </span>
              </div>
              {user.role === "tutor" && (
                <div className="flex justify-between items-center">
                  <span className="text-secondary-600">Average Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold text-secondary-900">
                      {averageRating}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Member Since</span>
                <span className="font-semibold text-secondary-900">
                  {new Date(user.createdAt).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="font-medium text-secondary-900">
                  Change Password
                </div>
                <div className="text-sm text-secondary-600">
                  Update your password
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="font-medium text-secondary-900">
                  Privacy Settings
                </div>
                <div className="text-sm text-secondary-600">
                  Manage your privacy preferences
                </div>
              </button>
              {user.role === "tutor" && (
                <button className="w-full text-left p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                  <div className="font-medium text-secondary-900">
                    Update Availability
                  </div>
                  <div className="text-sm text-secondary-600">
                    Set your tutoring schedule
                  </div>
                </button>
              )}
              {user.role === "student" && (
                <button className="w-full text-left p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                  <div className="font-medium text-secondary-900">
                    Study Preferences
                  </div>
                  <div className="text-sm text-secondary-600">
                    Customize your learning goals
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
