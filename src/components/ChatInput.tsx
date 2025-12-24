import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useChatContext } from '@/contexts/ChatContext';
import { buildSessionConfig, RESEARCH_SYSTEM_PROMPT } from '@/lib/realtime/session-config';
import type { RealtimeEvent } from '@/lib/realtime/types';

// Type for webkit CSS properties
interface WebkitCSSStyleDeclaration extends CSSStyleDeclaration {
  webkitUserSelect: string;
  webkitTouchCallout: string;
  webkitTapHighlightColor: string;
}

interface Message {
  id: string; // Changed to string to match Realtime API IDs
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const API_URL = "/api";

const ChatInput: React.FC = () => {
  const { pageContext } = useChatContext();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Used for "Connecting..." or initial wait
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [customHeight, setCustomHeight] = useState(384); // 24rem = 384px
  const [isDragging, setIsDragging] = useState(false);
  const ORIGINAL_HEIGHT = 384;

  const wsRef = useRef<WebSocket | null>(null);
  const currentResponseIdRef = useRef<string | null>(null);

  // --- Realtime API Connection Logic ---

  useEffect(() => {
    // Connect to Realtime API on mount
    let isMounted = true;

    const connect = async () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      try {
        console.log("[ChatInput] Requesting ephemeral token...");
        const tokenRes = await fetch(`${API_URL}/realtime`, { method: "POST" });
        if (!tokenRes.ok) throw new Error("Failed to get session token");

        const data = await tokenRes.json();
        const secret = data.client_secret.value;

        if (!isMounted) return;

        console.log("[ChatInput] Connecting to OpenAI Realtime...");
        const ws = new WebSocket(
          "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
          [
            "realtime",
            `openai-insecure-api-key.${secret}`,
            "openai-beta.realtime-v1",
          ]
        );
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) {
            ws.close();
            return;
          }
          console.log("[ChatInput] WebSocket connected");
          setIsConnected(true);

          // Initial session update will be handled by the pageContext effect
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as RealtimeEvent;
            handleRealtimeEvent(data);
          } catch (err) {
            console.error("[ChatInput] Error parsing event:", err);
          }
        };

        ws.onclose = () => {
          console.log("[ChatInput] WebSocket closed");
          setIsConnected(false);
          wsRef.current = null;
        };

        ws.onerror = (err) => {
          console.error("[ChatInput] WebSocket error:", err);
          setIsConnected(false);
        };

      } catch (err) {
        console.error("[ChatInput] Connection failed:", err);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      isMounted = false;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  // Update session instructions when pageContext changes
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && pageContext) {
      const contextString = JSON.stringify(pageContext, null, 2);
      const systemInstructions = `${RESEARCH_SYSTEM_PROMPT}\n\nCURRENT PAGE CONTEXT:\n${contextString}`;

      const config = buildSessionConfig({
        mode: 'text',
        systemInstructions: systemInstructions
      });

      console.log("[ChatInput] Updating session with new context");
      wsRef.current.send(JSON.stringify({
        type: 'session.update',
        session: config
      }));
    }
  }, [pageContext, isConnected]);


  const handleRealtimeEvent = async (event: RealtimeEvent) => {
    switch (event.type) {
      case 'response.text.delta': {
        const delta = event.delta || '';
        if (currentResponseIdRef.current) {
          setMessages(prev => prev.map(msg =>
            msg.id === currentResponseIdRef.current
              ? { ...msg, text: msg.text + delta }
              : msg
          ));
        }
        break;
      }

      case 'response.done': {
        setIsLoading(false);
        break;
      }

      // Handle other events like function calls if needed, similar to ChatInterface
    }
  };


  // --- UI/UX Handlers ---

  // Handle vertical drag to resize height
  useEffect(() => {
    const handleMove = (clientY: number) => {
      if (isDragging) {
        const newHeight = Math.max(ORIGINAL_HEIGHT, window.innerHeight - clientY);
        setCustomHeight(newHeight);
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientY);
    };

    const handleEnd = () => {
      setIsDragging(false);
      const bodyStyle = document.body.style as WebkitCSSStyleDeclaration;
      bodyStyle.userSelect = '';
      bodyStyle.webkitUserSelect = '';
      bodyStyle.webkitTouchCallout = '';
      bodyStyle.webkitTapHighlightColor = '';
      document.onselectstart = null;
    };

    if (isDragging) {
      const bodyStyle = document.body.style as WebkitCSSStyleDeclaration;
      bodyStyle.userSelect = 'none';
      bodyStyle.webkitUserSelect = 'none';
      bodyStyle.webkitTouchCallout = 'none';
      bodyStyle.webkitTapHighlightColor = 'transparent';
      document.onselectstart = () => false;

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      const bodyStyle = document.body.style as WebkitCSSStyleDeclaration;
      bodyStyle.userSelect = '';
      bodyStyle.webkitUserSelect = '';
      bodyStyle.webkitTouchCallout = '';
      bodyStyle.webkitTapHighlightColor = '';
      document.onselectstart = null;
    };
  }, [isDragging]);


  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && isExpanded) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isExpanded]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const userText = message.trim();

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: userText,
        isUser: true,
        timestamp: new Date()
      };

      // Prepare bot message placeholder
      const botMsgId = (Date.now() + 1).toString();
      const botMessage: Message = {
        id: botMsgId,
        text: '',
        isUser: false,
        timestamp: new Date()
      };
      currentResponseIdRef.current = botMsgId;

      setMessages(prev => [...prev, userMessage, botMessage]);
      setMessage('');
      setIsLoading(true);

      if (!isConnected || !wsRef.current) {
        setMessages(prev => prev.map(msg =>
          msg.id === botMsgId ? { ...msg, text: "Connection lost. Please refresh the page." } : msg
        ));
        setIsLoading(false);
        return;
      }

      try {
        // Send user input
        wsRef.current.send(JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [{ type: "input_text", text: userText }]
          }
        }));

        // Trigger response
        wsRef.current.send(JSON.stringify({
          type: "response.create"
        }));

      } catch (err) {
        console.error("[ChatInput] Failed to send:", err);
        setMessages(prev => prev.map(msg =>
          msg.id === botMsgId ? { ...msg, text: "Failed to send message." } : msg
        ));
        setIsLoading(false);
      }
    }
  };

  const handleInputFocus = () => {
    if (!isExpanded && !isCollapsing) {
      setIsExpanded(true);
    }
  };

  const handleMinimize = () => {
    setIsCollapsing(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsCollapsing(false);
      setCustomHeight(384);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed left-0 right-0 z-30 bottom-0">
      <div
        className={`bg-dark-card/50 backdrop-blur-md border border-white/10 rounded-t-2xl overflow-hidden ${isDragging ? '' : 'transition-all duration-1000 ease-out'
          }`}
        style={{ height: isExpanded ? `${customHeight}px` : 'auto' }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Drag Handle */}
          {isExpanded && (
            <div
              className={`h-2 w-full cursor-ns-resize hover:bg-white/10 transition-colors ${isDragging ? 'bg-white/20' : ''
                }`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
            />
          )}
          {/* Expanded Chat Area */}
          <div className={`transition-all duration-1000 ${isExpanded
              ? isCollapsing
                ? 'opacity-0 transform translate-y-4'
                : 'opacity-100 transform translate-y-0'
              : 'opacity-0 transform translate-y-4 h-0'
            }`} style={{ height: isExpanded ? `${customHeight - (window.innerWidth >= 768 ? 120 : 135)}px` : '0' }}>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-3 px-4 py-2 rounded-2xl bg-dark-bg border border-white/10">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                <h3 className="font-medium text-white font-display">Levrok Labs AI Research Assistant</h3>
              </div>
              <button
                onClick={handleMinimize}
                className="w-6 h-6 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
              >
                <span className="text-lg leading-none">−</span>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4" style={{ height: 'calc(100% - 64px)' }}>
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p className="text-sm">Ask detailed questions about this research...</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.isUser
                            ? 'bg-blue-600 text-white border border-blue-500/30'
                            : 'bg-dark-bg text-gray-200 border border-white/10'
                          }`}
                      >
                        <div className="text-sm">
                          <ReactMarkdown
                            components={{
                              ul: ({ ...props }) => <ul className="list-disc list-inside space-y-1 mb-2" {...props} />,
                              ol: ({ ...props }) => <ol className="list-decimal list-inside space-y-1 mb-2" {...props} />,
                              li: ({ ...props }) => <li className="ml-0" {...props} />,
                              p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isLoading && !messages[messages.length - 1]?.text && (
                    <div className="flex justify-start">
                      <div className="px-4 py-3 rounded-2xl bg-dark-bg border border-white/10">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className={`p-4 ${isExpanded ? 'pb-6' : ''}`}>
            <form onSubmit={handleSubmit} className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  rows={1}
                  placeholder={isExpanded ? "Ask a follow-up question..." : "Ask about this research paper..."}
                  className="w-full px-4 py-3 pr-12 bg-dark-bg/80 border border-white/10 rounded-2xl text-white placeholder-gray-500 resize-none overflow-hidden
                    focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
                    hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                  style={{ minHeight: '48px' }}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className="absolute right-2 bottom-3 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="text-sm font-bold">→</span>
                </button>
              </div>
            </form>

            {!isExpanded && (
              <p className="text-xs text-gray-500 text-center mt-2 font-mono">
                Powered by OpenAI Realtime API. Context-aware research assistant.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
