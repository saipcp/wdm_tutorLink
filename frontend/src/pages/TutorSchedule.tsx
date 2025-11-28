import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  CheckCircle,
  XCircle,
  Play,
  Eye,
  MessageSquare,
  Filter,
  Search,
  Plus,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sessionsApi, subjectsApi } from "../services/mockApi";
import type { Session, Subject } from "../types";

const TutorSchedule: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "today" | "completed" | "canceled"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  if (!user || user.role !== "tutor") return null;

  // Data queries
  const { data: sessions } = useQuery({
    queryKey: ["sessions", user.id],
    queryFn: () => sessionsApi.getSessions(user.id, "tutor"),
  });

  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectsApi.getAllSubjects(),
  });

  // Filter sessions based on selected filter
  const filteredSessions =
    sessions
      ?.filter((session) => {
        const now = new Date();
        const sessionDate = new Date(session.startAt);

        switch (filter) {
          case "upcoming":
            return sessionDate > now && session.status === "confirmed";
          case "today":
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return sessionDate >= today && sessionDate < tomorrow;
          case "completed":
            return session.status === "completed";
          case "canceled":
            return session.status === "canceled";
          default:
            return true;
        }
      })
      .filter((session) => {
        if (!searchTerm) return true;
        const subject = subjects?.find((s) => s.id === session.subjectId);
        return (
          subject?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }) || [];

  // Helper functions
  const getSubjectName = (subjectId: string) => {
    return subjects?.find((s) => s.id === subjectId)?.name || "Unknown Subject";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "completed":
        return "Completed";
      case "canceled":
        return "Canceled";
      default:
        return status;
    }
  };

  // Calculate stats
  const upcomingSessions = filteredSessions.filter(
    (s) => new Date(s.startAt) > new Date() && s.status === "confirmed"
  );
  const todaySessions = filteredSessions.filter((s) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const sessionDate = new Date(s.startAt);
    return sessionDate >= today && sessionDate < tomorrow;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-600 mt-1">
            Manage your tutoring sessions and availability
          </p>
        </div>
        <button
          onClick={() => navigate("/settings")}
          className="btn-secondary flex items-center space-x-2"
        >
          <Settings className="h-4 w-4" />
          <span>Availability Settings</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {upcomingSessions.length}
          </div>
          <div className="text-sm text-gray-600">Upcoming Sessions</div>
        </div>
        <div className="card text-center">
          <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {todaySessions.length}
          </div>
          <div className="text-sm text-gray-600">Sessions Today</div>
        </div>
        <div className="card text-center">
          <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {filteredSessions.filter((s) => s.status === "completed").length}
          </div>
          <div className="text-sm text-gray-600">Completed Sessions</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input-field"
          >
            <option value="all">All Sessions</option>
            <option value="upcoming">Upcoming</option>
            <option value="today">Today</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
      </div>

      {/* Sessions List */}
      {!filteredSessions.length ? (
        <div className="card text-center py-12">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? "No sessions found" : "No sessions scheduled"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Your scheduled sessions will appear here"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSessions.map((session) => (
            <div key={session.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getSubjectName(session.subjectId)}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                        session.status
                      )}`}
                    >
                      {getStatusText(session.status)}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(session.startAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatTime(session.startAt)} -{" "}
                        {formatTime(session.endAt)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{session.studentName || "Unknown Student"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                {session.status === "confirmed" &&
                  new Date(session.startAt) > new Date() && (
                    <>
                      <button className="btn-primary text-sm flex items-center space-x-1">
                        <Play className="h-4 w-4" />
                        <span>Join Session</span>
                      </button>
                      <button className="btn-secondary text-sm flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>Message</span>
                      </button>
                    </>
                  )}
                {session.status === "completed" && (
                  <button className="btn-secondary text-sm flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorSchedule;
