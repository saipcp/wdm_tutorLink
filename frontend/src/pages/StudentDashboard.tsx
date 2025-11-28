import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Calendar,
  BookOpen,
  CheckSquare,
  MessageSquare,
  User,
  Clock,
  Star,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  sessionsApi,
  tasksApi,
  plansApi,
  subjectsApi,
  messagingApi,
  dashboardApi,
} from "../services/mockApi";
import type {
  Session,
  Task,
  Plan,
  Subject,
  Conversation,
  Notification,
} from "../types";

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Dashboard data queries
  const { data: dashboardData } = useQuery({
    queryKey: ["studentDashboard", user?.id],
    queryFn: () => dashboardApi.getStudentDashboard(user!.id),
    enabled: !!user?.id,
  });

  const { data: sessions } = useQuery({
    queryKey: ["sessions", user?.id, "student"],
    queryFn: () => sessionsApi.getSessions(user!.id, "student"),
    enabled: !!user?.id,
  });

  const { data: tasks } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: () => tasksApi.getTasks(user!.id),
    enabled: !!user?.id,
  });

  const { data: plans } = useQuery({
    queryKey: ["plans", user?.id],
    queryFn: () => plansApi.getPlans(user!.id),
    enabled: !!user?.id,
  });

  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectsApi.getAllSubjects(),
  });

  const { data: conversations } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => messagingApi.getConversations(user!.id),
    enabled: !!user?.id,
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (
      task: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">
    ) => tasksApi.createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["studentDashboard", user?.id],
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      tasksApi.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["studentDashboard", user?.id],
      });
    },
  });

  // Quick action handlers
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    subjectId: "",
    topicId: "",
    estimatedMins: 60,
    dueAt: "",
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newTask.title.trim()) return;

    await createTaskMutation.mutateAsync({
      userId: user.id,
      title: newTask.title,
      subjectId: newTask.subjectId || undefined,
      topicId: newTask.topicId || undefined,
      estimatedMins: newTask.estimatedMins,
      dueAt: newTask.dueAt || undefined,
      status: "todo",
    });

    setNewTask({
      title: "",
      subjectId: "",
      topicId: "",
      estimatedMins: 60,
      dueAt: "",
    });
    setShowTaskForm(false);
  };

  const handleTaskStatusChange = async (
    taskId: string,
    status: Task["status"]
  ) => {
    await updateTaskMutation.mutateAsync({ id: taskId, updates: { status } });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600">Here's your learning overview</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowTaskForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card text-center">
          <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {dashboardData?.upcomingSessions.length || 0}
          </div>
          <div className="text-sm text-gray-600">Upcoming Sessions</div>
        </div>

        <div className="card text-center">
          <CheckSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {dashboardData?.completedTasks.length || 0}
          </div>
          <div className="text-sm text-gray-600">Completed Tasks</div>
        </div>

        <div className="card text-center">
          <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {dashboardData?.activePlans.length || 0}
          </div>
          <div className="text-sm text-gray-600">Active Plans</div>
        </div>

        <div className="card text-center">
          <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {dashboardData?.totalStudyTime || 0}
          </div>
          <div className="text-sm text-gray-600">Study Hours</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="font-medium text-gray-900">Find Tutors</div>
              <div className="text-sm text-gray-600">
                Browse available tutors
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="font-medium text-gray-900">Book Session</div>
              <div className="text-sm text-gray-600">
                Schedule a new session
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="font-medium text-gray-900">Study Planner</div>
              <div className="text-sm text-gray-600">Create study plans</div>
            </button>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Sessions
            </h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {dashboardData?.upcomingSessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className="p-3 rounded-lg border border-gray-200"
              >
                <div className="font-medium text-gray-900">
                  {session.subjectId &&
                    subjects?.find((s) => s.id === session.subjectId)?.name}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(session.startAt).toLocaleDateString()} at{" "}
                  {new Date(session.startAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {!dashboardData?.upcomingSessions.length && (
              <p className="text-gray-500 text-sm">No upcoming sessions</p>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Tasks
            </h3>
            <CheckSquare className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {tasks?.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{task.title}</div>
                  <div className="text-sm text-gray-600">
                    {task.estimatedMins} mins • {task.status}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {task.status === "todo" && (
                    <button
                      onClick={() =>
                        handleTaskStatusChange(task.id, "in_progress")
                      }
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                    >
                      Start
                    </button>
                  )}
                  {task.status === "in_progress" && (
                    <button
                      onClick={() => handleTaskStatusChange(task.id, "done")}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!tasks?.length && (
              <p className="text-gray-500 text-sm">No tasks yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="input-field"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject (Optional)
                </label>
                <select
                  value={newTask.subjectId}
                  onChange={(e) =>
                    setNewTask({ ...newTask, subjectId: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Select subject</option>
                  {subjects?.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Minutes
                </label>
                <input
                  type="number"
                  value={newTask.estimatedMins}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      estimatedMins: parseInt(e.target.value) || 60,
                    })
                  }
                  className="input-field"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={newTask.dueAt}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueAt: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications */}
      {dashboardData?.unreadNotifications > 0 && (
        <div className="card border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="font-medium text-gray-900">
                {dashboardData.unreadNotifications} unread notifications
              </span>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm">
              View all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
