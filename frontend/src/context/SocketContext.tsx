import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const SocketContext = createContext<any>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [typingStatus, setTypingStatus] = useState<Record<string, Set<string>>>(
    {}
  );

  // derive backend base URL (strip /api/...)
  const apiBase =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
  const baseUrl = apiBase.replace(/\/api\/.+$/, "") || "http://localhost:5000";

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("tutorlink_user")
      ? JSON.parse(localStorage.getItem("tutorlink_user") || "{}").token
      : null;
    if (!token) return;

    const s: Socket = io(baseUrl, {
      auth: { token },
      autoConnect: true,
      transports: ["websocket"],
    });

    setSocket(s);

    // listeners
    s.on("connect", () => {
      // console.log('socket connected:', s.id);
    });

    s.on("presence", ({ userId, online }) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: online }));
    });

    s.on("newMessage", (message: any) => {
      if (!message || !message.conversationId) return;
      const key = ["messages", message.conversationId];
      queryClient.setQueryData(key, (old: any[] | undefined) => {
        if (!old) return [message];
        return [...old, message];
      });

      // update conversations list
      queryClient.invalidateQueries(["conversations"]);
      // update notifications list
      queryClient.invalidateQueries(["notifications", user?.id]);
    });

    s.on("conversationCreated", (payload: any) => {
      queryClient.invalidateQueries(["conversations"]);
      queryClient.invalidateQueries(["notifications", user?.id]);
    });

    s.on(
      "messagesRead",
      ({
        conversationId,
        userId,
      }: {
        conversationId: string;
        userId: string;
      }) => {
        // mark messages as read in cache for that conversation
        const key = ["messages", conversationId];
        queryClient.setQueryData(key, (old: any[] | undefined) => {
          if (!old) return old;
          return old.map((m) =>
            m.senderId !== userId ? { ...m, isRead: true } : m
          );
        });
        queryClient.invalidateQueries(["conversations"]);
      }
    );

    s.on("typing", ({ conversationId, userId, isTyping }: any) => {
      setTypingStatus((prev) => {
        const copy = { ...prev };
        if (!copy[conversationId]) copy[conversationId] = new Set();
        if (isTyping) copy[conversationId].add(userId);
        else copy[conversationId].delete(userId);
        return copy;
      });
    });

    s.on(
      "messageDelivered",
      ({ messageId, conversationId, recipients }: any) => {
        // update message in cache as delivered for sender
        if (!conversationId) return;
        const key = ["messages", conversationId];
        queryClient.setQueryData(key, (old: any[] | undefined) => {
          if (!old) return old;
          return old.map((m) =>
            m.id === messageId ? { ...m, delivered: true } : m
          );
        });
      }
    );

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user]);

  const joinConversation = (conversationId: string) => {
    if (!socket || !conversationId) return;
    socket.emit("joinConversation", { conversationId });
  };

  const leaveConversation = (conversationId: string) => {
    if (!socket || !conversationId) return;
    socket.emit("leaveConversation", { conversationId });
  };

  const sendTyping = (conversationId: string, isTyping: boolean) => {
    if (!socket || !conversationId) return;
    socket.emit("typing", { conversationId, isTyping });
  };

  const markConversationRead = (conversationId: string) => {
    if (!socket || !conversationId) return;
    socket.emit("markRead", { conversationId });
  };

  const value = useMemo(
    () => ({
      socket,
      onlineUsers,
      typingStatus,
      joinConversation,
      leaveConversation,
      sendTyping,
      markConversationRead,
    }),
    [socket, onlineUsers, typingStatus]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

export default SocketContext;
