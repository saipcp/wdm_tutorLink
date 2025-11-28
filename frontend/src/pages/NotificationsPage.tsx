import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () =>
      user?.id
        ? notificationsApi.getNotifications(user.id)
        : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries(["notifications", user?.id]),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(user?.id || ""),
    onSuccess: () => queryClient.invalidateQueries(["notifications", user?.id]),
  });

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div>
          <button
            onClick={() => markAllMutation.mutate()}
            className="btn-secondary"
          >
            Mark all read
          </button>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div>Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="text-gray-500">No notifications</div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n: any) => (
              <div
                key={n.id}
                className={`p-3 rounded border ${
                  n.isRead ? "bg-white" : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="text-sm text-gray-800">
                    <div className="font-medium truncate">{n.type}</div>
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
                        onClick={() => markAsReadMutation.mutate(n.id)}
                        className="text-xs mt-2 text-blue-600"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
