import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  MessageCircle,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { aiApi } from "../services/api";
import type { Message } from "../types";

interface ChatMessage extends Message {
  isAI?: boolean;
  timestamp: string;
}

const Messaging: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      conversationId: "tutorbot",
      senderId: "ai-tutorbot",
      body: "Hi! I'm TutorBot, your AI study assistant. I can help you with:\n\n• Study planning and organization\n• Subject-specific questions\n• Learning strategies and tips\n• Progress tracking\n• Motivation and goal setting\n\nWhat would you like to work on today?",
      sentAt: new Date().toISOString(),
      isRead: true,
      isAI: true,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !user?.id) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      conversationId: "tutorbot",
      senderId: user.id,
      body: inputMessage,
      sentAt: new Date().toISOString(),
      isRead: true,
      isAI: false,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Simulate AI response delay
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      const aiResponse = await generateAIResponse(inputMessage);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        conversationId: "tutorbot",
        senderId: "ai-tutorbot",
        body: aiResponse,
        sentAt: new Date().toISOString(),
        isRead: true,
        isAI: true,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        conversationId: "tutorbot",
        senderId: "ai-tutorbot",
        body: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        sentAt: new Date().toISOString(),
        isRead: true,
        isAI: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    const input = userInput.toLowerCase();

    // Study planning related responses
    if (
      input.includes("study plan") ||
      input.includes("plan") ||
      input.includes("schedule")
    ) {
      return "I'd be happy to help you create a study plan! Based on your message, I can see you're interested in organizing your study time. \n\nHere's what I recommend:\n\n📚 **Daily Study Routine:**\n• 2-3 hours of focused study time\n• Break into 25-minute Pomodoro sessions\n• Include short breaks between sessions\n\n⏰ **Sample Schedule:**\n• 9:00 AM - 11:00 AM: Main subjects\n• 11:30 AM - 12:30 PM: Practice problems\n• 2:00 PM - 3:00 PM: Review and notes\n\nWould you like me to help you create a more specific plan for particular subjects?";
    }

    // Subject-specific help
    if (
      input.includes("math") ||
      input.includes("calculus") ||
      input.includes("algebra")
    ) {
      return "For mathematics, I recommend:\n\n🔢 **Key Strategies:**\n• Practice problems daily (at least 30 minutes)\n• Focus on understanding concepts, not just memorization\n• Use spaced repetition for formulas\n\n📝 **Study Tips:**\n• Work through examples step by step\n• Teach concepts to someone else\n• Use visual aids like graphs and diagrams\n\n💡 **Resources:**\n• Khan Academy for video explanations\n• Wolfram Alpha for problem solving\n• Practice worksheets from your textbook\n\nWhat specific math topic are you working on?";
    }

    if (
      input.includes("english") ||
      input.includes("writing") ||
      input.includes("grammar")
    ) {
      return "For English and writing skills:\n\n✍️ **Writing Practice:**\n• Write for 20-30 minutes daily\n• Focus on one type of writing (essays, creative, technical)\n• Read your work aloud to catch errors\n\n📖 **Reading Strategy:**\n• Read actively with a pen in hand\n• Note new vocabulary and sentence structures\n• Summarize what you've read in your own words\n\n🔤 **Grammar Tips:**\n• Review one grammar rule per day\n• Practice with exercises from grammar workbooks\n• Use apps like Grammarly for feedback\n\nWould you like help with a specific writing assignment or grammar concept?";
    }

    // Motivation and productivity
    if (
      input.includes("motivat") ||
      input.includes("lazy") ||
      input.includes("procrastinat")
    ) {
      return "Staying motivated can be challenging! Here are some proven strategies:\n\n🎯 **Goal Setting:**\n• Set specific, achievable daily goals\n• Break large tasks into smaller steps\n• Celebrate small wins along the way\n\n⏰ **Time Management:**\n• Use the Pomodoro technique (25 min work + 5 min break)\n• Create a dedicated study space\n• Eliminate distractions during study time\n\n💪 **Mindset Tips:**\n• Remember why you started\n• Track your progress visually\n• Connect with study buddies for accountability\n\nYou're capable of amazing things! What's one small step you can take today toward your goals?";
    }

    // General study advice
    if (
      input.includes("help") ||
      input.includes("advice") ||
      input.includes("tips")
    ) {
      return "Here are some general study strategies that work well:\n\n🧠 **Active Learning:**\n• Don't just read - engage with the material\n• Ask yourself questions as you study\n• Teach concepts to others or explain them out loud\n\n📅 **Consistent Practice:**\n• Study a little bit every day rather than cramming\n• Review material from previous days regularly\n• Use spaced repetition for better retention\n\n🎯 **Focus Techniques:**\n• Work in focused blocks of 25-50 minutes\n• Take meaningful breaks to recharge\n• Minimize multitasking during study sessions\n\nWhat subject or topic would you like specific help with?";
    }

    // Default response for unrecognized queries
    return "That's an interesting question! While I specialize in study planning, learning strategies, and academic support, I'd be happy to help you think through your learning goals and create a plan to achieve them.\n\nCould you tell me more about:\n• What subject you're studying\n• What specific challenge you're facing\n• What your learning goals are\n\nI'm here to help you succeed in your academic journey!";
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TutorBot</h1>
            <p className="text-gray-600">Your AI Study Assistant</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Online</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="card text-center p-4 hover:bg-blue-50 transition-colors">
          <Sparkles className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="font-medium text-gray-900">Study Planning</div>
          <div className="text-sm text-gray-600">
            Get personalized study schedules
          </div>
        </button>
        <button className="card text-center p-4 hover:bg-green-50 transition-colors">
          <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="font-medium text-gray-900">Progress Tracking</div>
          <div className="text-sm text-gray-600">
            Monitor your learning progress
          </div>
        </button>
        <button className="card text-center p-4 hover:bg-purple-50 transition-colors">
          <MessageCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="font-medium text-gray-900">Study Tips</div>
          <div className="text-sm text-gray-600">
            Get expert learning advice
          </div>
        </button>
      </div>

      {/* Chat Interface */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-gray-200">
          <Bot className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-900">Chat with TutorBot</span>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isAI ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isAI
                    ? "bg-blue-100 text-blue-900"
                    : "bg-blue-600 text-white"
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {message.isAI ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="text-xs opacity-75">
                    {message.isAI ? "TutorBot" : "You"}
                  </span>
                  <span className="text-xs opacity-75">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <div className="whitespace-pre-wrap text-sm">
                  {message.body}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-blue-100 text-blue-900 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <span className="text-xs">TutorBot is typing...</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask TutorBot anything about your studies..."
            className="flex-1 input-field"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Help Topics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Popular Topics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "Create a study schedule",
            "Math problem help",
            "Writing improvement",
            "Test preparation",
            "Time management",
            "Motivation tips",
          ].map((topic) => (
            <button
              key={topic}
              onClick={() => setInputMessage(topic)}
              className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900">{topic}</div>
              <div className="text-xs text-gray-600 mt-1">Click to ask</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Messaging;
