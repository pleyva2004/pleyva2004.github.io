import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useChatContext } from '@/contexts/ChatContext';

// Type for webkit CSS properties
interface WebkitCSSStyleDeclaration extends CSSStyleDeclaration {
  webkitUserSelect: string;
  webkitTouchCallout: string;
  webkitTapHighlightColor: string;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatInput: React.FC = () => {
  const { pageContext } = useChatContext();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [customHeight, setCustomHeight] = useState(384); // 24rem = 384px
  const [isDragging, setIsDragging] = useState(false);
  const ORIGINAL_HEIGHT = 384; // Add this constant

  // Handle vertical drag to resize height - UPDATED for mobile support
  useEffect(() => {
    const handleMove = (clientY: number) => {
      if (isDragging) {
        const newHeight = Math.max(ORIGINAL_HEIGHT, window.innerHeight - clientY); // Use original height as floor
        setCustomHeight(newHeight);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      handleMove(e.touches[0].clientY);
    };

    const handleEnd = () => {
      setIsDragging(false);
      // Re-enable text selection - Enhanced for mobile
      const bodyStyle = document.body.style as WebkitCSSStyleDeclaration;
      bodyStyle.userSelect = '';
      bodyStyle.webkitUserSelect = '';
      bodyStyle.webkitTouchCallout = '';
      bodyStyle.webkitTapHighlightColor = '';
      document.onselectstart = null;
    };

    if (isDragging) {
      // Disable text selection during drag - Enhanced for mobile
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
      // Ensure text selection is re-enabled on cleanup - Enhanced for mobile
      const bodyStyle = document.body.style as WebkitCSSStyleDeclaration;
      bodyStyle.userSelect = '';
      bodyStyle.webkitUserSelect = '';
      bodyStyle.webkitTouchCallout = '';
      bodyStyle.webkitTapHighlightColor = '';
      document.onselectstart = null;
    };
  }, [isDragging]);


  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
      // Add user message
      const userMessage: Message = {
        id: Date.now(),
        text: message.trim(),
        isUser: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setIsLoading(true);

      // Get AI response
      try {

        const tempMessages = messages.slice(-3);

        const history = tempMessages.map(message => ({
          text: message.text,
          sender: message.isUser ? 'user' : 'bot'
        }));
          

        const body = {
          question: message.trim(),
          context: pageContext,
          history: history
        }


        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        





        const data = await response.json();
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: data.message || "Sorry, I couldn't process that request.",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      } catch {
        const errorMessage: Message = {
          id: Date.now() + 1,
          text: "Sorry, I'm having trouble connecting right now. Please try again.",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
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
    // Wait for animation to complete before hiding content
    setTimeout(() => {
      setIsExpanded(false);
      setIsCollapsing(false);
      setCustomHeight(384);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Trigger submit logic directly
      if (message.trim()) {
        // Add user message
        const userMessage: Message = {
          id: Date.now(),
          text: message.trim(),
          isUser: true,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);

        // Get AI response
        try {
          const tempMessages = messages.slice(-3);
          const history = tempMessages.map(message => ({
            text: message.text,
            sender: message.isUser ? 'user' : 'bot'
          }));
            
          const body = {
            question: message.trim(),
            context: pageContext,
            history: history
          }

          fetch('/api/ask', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          }).then(async (response) => {
            const data = await response.json();
            const aiMessage: Message = {
              id: Date.now() + 1,
              text: data.message || "Sorry, I couldn't process that request.",
              isUser: false,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsLoading(false);
          }).catch(() => {
            const errorMessage: Message = {
              id: Date.now() + 1,
              text: "Sorry, I'm having trouble connecting right now. Please try again.",
              isUser: false,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
          });
        } catch {
          const errorMessage: Message = {
            id: Date.now() + 1,
            text: "Sorry, I'm having trouble connecting right now. Please try again.",
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <div className="fixed left-0 right-0 z-30 bottom-0">
      <div
        className={`bg-dark-card/50 backdrop-blur-md border border-accent-blue/20 rounded-t-2xl overflow-hidden ${
          isDragging ? '' : 'transition-all duration-1000 ease-out'
        }`}
        style={{ height: isExpanded ? `${customHeight}px` : 'auto' }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Drag Handle */}
          {isExpanded && (
            <div
              className={`h-2 w-full cursor-ns-resize hover:bg-accent-blue/30 transition-colors ${
                isDragging ? 'bg-accent-blue/40' : ''
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
          <div className={`transition-all duration-1000 ${
            isExpanded
              ? isCollapsing
                ? 'opacity-0 transform translate-y-4'
                : 'opacity-100 transform translate-y-0'
              : 'opacity-0 transform translate-y-4 h-0'
          }`} style={{ height: isExpanded ? `${customHeight - (window.innerWidth >= 768 ? 120 : 135)}px` : '0' }}>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-accent-blue/20">
              <div className="flex items-center space-x-3 px-4 py-2 rounded-2xl bg-dark-bg border border-accent-blue/30">
                {/* <div className="w-3 h-3 bg-gradient-to-r from-accent-blue to-accent-purple rounded-full"></div> */}
                <h3 className="font-medium text-white">Levrok Labs AI</h3>
              </div>
              <button
                onClick={handleMinimize}
                className="w-6 h-6 text-gray-400 hover:text-accent-blue transition-colors flex items-center justify-center"
              >
                <span className="text-lg leading-none">−</span>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4" style={{ height: 'calc(100% - 64px)' }}>
              {messages.length === 0 && !isLoading ? (
                <div className="text-center text-gray-400 py-8">
                  <p className="text-sm">Ask about Pablo&apos;s research</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          msg.isUser
                            ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white border border-accent-blue/30'
                            : 'bg-dark-bg text-gray-200 border border-accent-blue/20'
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
                        {/* <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p> */}
                      </div>
                    </div>
                  ))}

                  {/* Loading Animation */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-dark-bg border border-accent-blue/20">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          {/* <span className="text-xs text-gray-400">Levrok Labs is thinking...</span> */}
                        </div>
                      </div>
                    </div>
                  )}
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
                  disabled={isLoading}
                  rows={1}
                  placeholder={isExpanded ? "Continue the conversation..." : "Ask about Pablo's research..."}
                  className="w-full px-4 py-3 pr-12 bg-dark-bg/60 border border-accent-blue/30 rounded-2xl text-white placeholder-gray-500 resize-none overflow-hidden
                    focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20
                    hover:border-accent-blue/40 hover:bg-dark-bg/80
                    transition-all duration-300"
                  style={{ minHeight: '48px' }}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className="absolute right-2 bottom-3 w-8 h-8 bg-gradient-to-r from-accent-blue to-accent-purple text-white rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:from-gray-700 disabled:to-gray-700"
                >
                  <span className="text-sm">→</span>
                </button>
              </div>
            </form>

            {!isExpanded && (
              <p className="text-xs text-gray-500 text-center mt-2">
                AI can make mistakes. Consider checking important information. Press Enter to send, Shift+Enter for new line.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;