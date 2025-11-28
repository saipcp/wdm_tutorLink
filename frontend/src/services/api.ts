// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const userStr = localStorage.getItem("tutorlink_user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.token || null;
    } catch {
      return null;
    }
  }
  return null;
};

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  // Use a plain object for headers to make TypeScript happy when adding Authorization
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Authentication API
export const authApi = {
  async login(email: string, password: string) {
    const response = await apiRequest<{ user: any; token: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
    // Return token too so callers can persist it to localStorage
    return {
      user: response.user,
      token: response.token,
      isAuthenticated: true,
      loading: false,
    };
  },

  async logout() {
    // Token is removed from localStorage in AuthContext
    return Promise.resolve();
  },

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "student" | "tutor" | "admin";
    phone?: string;
  }) {
    const response = await apiRequest<{ user: any; token: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(userData),
      }
    );
    return { user: response.user, token: response.token };
  },

  async forgotPassword(email: string) {
    return apiRequest<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string) {
    return apiRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

// Users API
export const usersApi = {
  async getCurrentUser() {
    return apiRequest<any>("/auth/me");
  },

  async updateProfile(userId: string, updates: Partial<any>) {
    return apiRequest<any>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },
};

// Tutors API
export const tutorsApi = {
  async getAllTutors(filters?: {
    subjects?: string[];
    priceRange?: [number, number];
    rating?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.subjects?.length) {
      filters.subjects.forEach((s) => params.append("subjects", s));
    }
    if (filters?.priceRange) {
      params.append("minPrice", filters.priceRange[0].toString());
      params.append("maxPrice", filters.priceRange[1].toString());
    }
    if (filters?.rating) {
      params.append("minRating", filters.rating.toString());
    }

    const queryString = params.toString();
    return apiRequest<any[]>(`/tutors${queryString ? `?${queryString}` : ""}`);
  },

  async getTutorById(tutorId: string) {
    return apiRequest<any>(`/tutors/${tutorId}`);
  },

  async getTutorByUserId(userId: string) {
    return apiRequest<any>(`/tutors/user/${userId}`);
  },

  async getTutorReviews(tutorId: string) {
    return apiRequest<any[]>(`/tutors/${tutorId}/reviews`);
  },

  async updateAvailability(tutorId: string, availability: any[]) {
    return apiRequest<void>("/tutors/profile", {
      method: "PUT",
      body: JSON.stringify({ availability }),
    });
  },
};

// Sessions API
export const sessionsApi = {
  async getSessions(userId: string, role: "student" | "tutor") {
    return apiRequest<any[]>("/sessions");
  },

  async bookSession(booking: {
    tutorId: string;
    startAt: string;
    endAt: string;
    subjectId?: string;
    topicId?: string;
    notes?: string;
  }) {
    return apiRequest<any>("/sessions", {
      method: "POST",
      body: JSON.stringify(booking),
    });
  },

  async cancelSession(sessionId: string) {
    return apiRequest<void>(`/sessions/${sessionId}/cancel`, {
      method: "PUT",
    });
  },

  async completeSession(sessionId: string, notes?: string) {
    return apiRequest<void>(`/sessions/${sessionId}/complete`, {
      method: "PUT",
      body: JSON.stringify({ notes }),
    });
  },
};

// Reviews API
export const reviewsApi = {
  async submitReview(sessionId: string, rating: number, comment?: string) {
    return apiRequest<any>("/reviews", {
      method: "POST",
      body: JSON.stringify({ sessionId, rating, comment }),
    });
  },

  async getReviewsForUser(userId: string) {
    return apiRequest<any[]>("/reviews");
  },

  async getReviewsByTutorId(tutorId: string) {
    return apiRequest<any[]>(`/reviews/tutor/${tutorId}`);
  },
};

// Students API
export const studentsApi = {
  async getStudentProfile(userId: string) {
    // This would need a separate endpoint if needed
    return apiRequest<any>(`/users/profile`);
  },

  async updateStudentProfile(userId: string, updates: Partial<any>) {
    return apiRequest<any>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },
};

// Messaging API
export const messagingApi = {
  async getConversations(userId: string) {
    return apiRequest<any[]>("/messages/conversations");
  },

  async getMessages(conversationId: string) {
    return apiRequest<any[]>(
      `/messages/conversations/${conversationId}/messages`
    );
  },

  async sendMessage(
    conversationId: string | undefined,
    body: string,
    recipientId?: string
  ) {
    // If conversationId is provided, send to that conversation
    if (conversationId) {
      return apiRequest<any>(
        `/messages/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ body, recipientId }),
        }
      );
    }

    // Otherwise, hit POST /conversations/messages which creates a conversation if recipientId is provided
    return apiRequest<any>("/messages/conversations/messages", {
      method: "POST",
      body: JSON.stringify({ body, recipientId }),
    });
  },
  async createConversation(recipientId: string, title?: string) {
    return apiRequest<any>(`/messages/conversations`, {
      method: "POST",
      body: JSON.stringify({ recipientId, title }),
    });
  },
};

// Tasks API
export const tasksApi = {
  async getTasks(userId: string) {
    return apiRequest<any[]>("/tasks");
  },

  async createTask(
    task: Omit<any, "id" | "createdAt" | "updatedAt" | "comments">
  ) {
    return apiRequest<any>("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  },

  async updateTask(taskId: string, updates: Partial<any>) {
    return apiRequest<any>(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async deleteTask(taskId: string) {
    return apiRequest<void>(`/tasks/${taskId}`, {
      method: "DELETE",
    });
  },
};

// Study Plans API
export const plansApi = {
  async getPlans(userId: string) {
    return apiRequest<any[]>("/plans");
  },

  async generateStudyPlan(request: {
    subjects: string[];
    topics: string[];
    duration: number;
    dailyHours: number;
    goals: string[];
    currentLevel: string;
  }) {
    return apiRequest<any>("/plans/generate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  async updatePlanItem(planId: string, itemId: string, completed: boolean) {
    return apiRequest<void>(`/plans/${planId}/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ completed }),
    });
  },

  async deletePlan(planId: string) {
    return apiRequest<void>(`/plans/${planId}`, {
      method: "DELETE",
    });
  },
};

// Subjects API
export const subjectsApi = {
  async getAllSubjects() {
    return apiRequest<any[]>("/subjects");
  },

  async getSubjectById(subjectId: string) {
    return apiRequest<any>(`/subjects/${subjectId}`);
  },

  async createSubject(subjectData: { name: string; topics?: string[] }) {
    return apiRequest<any>("/subjects", {
      method: "POST",
      body: JSON.stringify(subjectData),
    });
  },
};

// Notifications API
export const notificationsApi = {
  async getNotifications(userId: string) {
    return apiRequest<any[]>("/notifications");
  },

  async markAsRead(notificationId: string) {
    return apiRequest<void>(`/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  },

  async markAllAsRead(userId: string) {
    return apiRequest<void>("/notifications/read-all", {
      method: "PUT",
    });
  },
};

// Dashboard API
export const dashboardApi = {
  async getStudentDashboard(studentId: string) {
    return apiRequest<any>("/dashboard/student");
  },

  async getTutorDashboard(tutorId: string) {
    return apiRequest<any>("/dashboard/tutor");
  },
};

// Admin API
export const adminApi = {
  async getAllUsers() {
    return apiRequest<any[]>("/admin/users");
  },

  async getUserById(userId: string) {
    return apiRequest<any>(`/admin/users/${userId}`);
  },

  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "student" | "tutor" | "admin";
    phone?: string;
  }) {
    return apiRequest<any>("/admin/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async updateUser(userId: string, updates: Partial<any>) {
    return apiRequest<any>(`/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async deleteUser(userId: string) {
    return apiRequest<void>(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  },

  async getAllSessions() {
    return apiRequest<any[]>("/admin/sessions");
  },

  async getAdminStats() {
    return apiRequest<any>("/admin/stats");
  },
  async getSetting(key: string) {
    return apiRequest<any>(`/admin/settings/${key}`);
  },

  async updateSetting(key: string, value: any) {
    return apiRequest<any>(`/admin/settings/${key}`, {
      method: "PUT",
      body: JSON.stringify(value),
    });
  },
};

// AI Features API
export const aiApi = {
  async generateStudyPlan(request: {
    subjects: string[];
    topics: string[];
    duration: number;
    dailyHours: number;
    goals: string[];
    currentLevel: string;
  }) {
    return plansApi.generateStudyPlan(request);
  },

  async getTutorRecommendation(studentId: string, subject: string) {
    return tutorsApi.getAllTutors({ subjects: [subject], rating: 4 });
  },

  async accessibilityAudit(content: string) {
    // This would need a separate AI endpoint if implemented
    return Promise.resolve({
      score: 85,
      issues: [],
      suggestions: [],
    });
  },
};
