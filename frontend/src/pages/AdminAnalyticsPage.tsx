import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Users, BookOpen, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  authApi,
  subjectsApi,
  sessionsApi,
  reviewsApi,
} from "../services/api";
import type { User as UserType, Subject, Session } from "../types";

const AdminAnalyticsPage: React.FC = () => {
  const { user } = useAuth();

  // Admin data queries
  const { data: allUsers } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      // In a real app, this would be an admin API call
      // For demo, we'll simulate by returning all mock users
      const users = await Promise.all([
        authApi.login("student@tutorlink.com", "password"),
        authApi.login("tutor@tutorlink.com", "password"),
        authApi.login("admin@tutorlink.com", "password"),
      ]);
      return users.map((u) => u.user).filter((u) => u !== null) as UserType[];
    },
  });

  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectsApi.getAllSubjects(),
  });

  const { data: allSessions } = useQuery({
    queryKey: ["allSessions"],
    queryFn: async () => {
      // Get sessions for all users (admin view)
      const users = allUsers || [];
      const allSessions: Session[] = [];

      for (const user of users) {
        try {
          const sessions = await sessionsApi.getSessions(
            user.id,
            user.role as "student" | "tutor"
          );
          allSessions.push(...sessions);
        } catch (error) {
          // Ignore errors for users without sessions
        }
      }

      return allSessions;
    },
    enabled: !!allUsers?.length,
  });

  const { data: reviews } = useQuery({
    queryKey: ["allReviews"],
    queryFn: async () => {
      // Get all reviews for admin view
      const allReviews = await Promise.all([
        reviewsApi.getReviewsByTutorId("1"), // Student demo account
        reviewsApi.getReviewsByTutorId("2"), // Tutor demo account
        reviewsApi.getReviewsByTutorId("3"), // Admin demo account
      ]);
      return allReviews.flat();
    },
  });

  // Calculate analytics
  const totalUsers = allUsers?.length || 0;
  const totalStudents =
    allUsers?.filter((u) => u.role === "student").length || 0;
  const totalTutors = allUsers?.filter((u) => u.role === "tutor").length || 0;
  const totalSessions = allSessions?.length || 0;
  const completedSessions =
    allSessions?.filter((s) => s.status === "completed").length || 0;
  const totalSubjects = subjects?.length || 0;

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Analytics
          </h1>
          <p className="text-gray-600">View platform metrics and insights</p>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card text-center">
            <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {totalSessions}
            </div>
            <div className="text-sm text-gray-600">Total Sessions</div>
            <div className="text-xs text-gray-500 mt-1">
              {completedSessions} completed
            </div>
          </div>

          <div className="card text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
            <div className="text-sm text-gray-600">Active Users</div>
            <div className="text-xs text-gray-500 mt-1">
              {totalStudents} students, {totalTutors} tutors
            </div>
          </div>

          <div className="card text-center">
            <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {totalSubjects}
            </div>
            <div className="text-sm text-gray-600">Subjects Available</div>
            <div className="text-xs text-gray-500 mt-1">
              {subjects?.reduce((acc, s) => acc + s.topics.length, 0) || 0}{" "}
              total topics
            </div>
          </div>

          <div className="card text-center">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {reviews?.length
                ? (
                    reviews.reduce((acc, review) => acc + review.rating, 0) /
                    reviews.length
                  ).toFixed(1)
                : "0.0"}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
            <div className="text-xs text-gray-500 mt-1">
              {reviews?.length || 0} total reviews
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Platform Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                User Distribution
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Students</span>
                  <span className="text-sm font-medium text-gray-900">
                    {totalStudents} (
                    {((totalStudents / totalUsers) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tutors</span>
                  <span className="text-sm font-medium text-gray-900">
                    {totalTutors} (
                    {((totalTutors / totalUsers) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Admins</span>
                  <span className="text-sm font-medium text-gray-900">
                    1 ({((1 / totalUsers) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Session Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-medium text-green-600">
                    {completedSessions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Booked</span>
                  <span className="text-sm font-medium text-blue-600">
                    {totalSessions - completedSessions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {totalSessions > 0
                      ? ((completedSessions / totalSessions) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
