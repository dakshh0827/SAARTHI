// =====================================================
// src/pages/ChatbotPage.jsx
// =====================================================

import { useState, useEffect, useRef } from "react";
import { useChatbotStore } from "../stores/chatbotStore";
import { FaPaperPlane, FaRobot, FaUser, FaTrashAlt } from "react-icons/fa";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function ChatbotPage() {
  const { messages, sendMessage, isLoading, clearHistory } = useChatbotStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput(""); // Clear input immediately

    await sendMessage(userMessage);
  };

  const quickActions = [
    "Show equipment status",
    "Recent alerts",
    "Maintenance schedule",
    "Analytics overview",
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaRobot className="text-blue-600" /> AI Assistant
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Powered by MaViK-39 Neural Engine
          </p>
        </div>
        <button 
            onClick={clearHistory}
            className="text-gray-400 hover:text-red-500 transition-colors p-2"
            title="Clear Chat History"
        >
            <FaTrashAlt />
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-y-auto custom-scrollbar relative">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-80">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <FaRobot className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              How can I help you today?
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mb-8">
              Ask about equipment status, maintenance schedules, or specific lab alerts.
            </p>
            
            <div className="grid grid-cols-2 gap-3 max-w-md w-full">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInput(action)}
                  className="px-4 py-3 text-xs font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 border border-gray-100 hover:border-blue-100 transition-all text-left"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className="space-y-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="flex items-end gap-2 max-w-[80%] flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 border border-indigo-200">
                      <FaUser className="w-4 h-4 text-indigo-700" />
                    </div>
                    <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 shadow-sm text-sm leading-relaxed">
                      {msg.message}
                    </div>
                  </div>
                </div>

                {/* Bot Response */}
                <div className="flex justify-start">
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 border border-emerald-200">
                      <FaRobot className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div className="bg-gray-50 text-gray-800 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm border border-gray-100 text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.response || (
                        <div className="flex gap-1 py-1">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator for new message */}
            {isLoading && messages[messages.length-1]?.response && (
                 <div className="flex justify-start animate-pulse">
                 <div className="flex items-end gap-2 max-w-[85%]">
                   <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 border border-emerald-200">
                     <FaRobot className="w-4 h-4 text-emerald-700" />
                   </div>
                   <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                        </div>
                   </div>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 pl-4 flex gap-2 items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 text-gray-700 placeholder-gray-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" color="white" />
          ) : (
            <FaPaperPlane className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}