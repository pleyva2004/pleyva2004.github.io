import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onClose: () => void;
}

// Mock responses removed - now using real API

const quickReplies = [
  'Tell me about Pablo\'s experience',
  'What skills does Pablo have?',
  'Show me Pablo\'s projects',
  'What are Pablo\'s goals?'
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey, I am an AI Agent from Levrok Labs. Please enter \\help for usage tips',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userColor, setUserColor] = useState<string>(() => {
    // Load saved color from localStorage or default to brown
    return localStorage.getItem('chatUserColor') || 'brown';
  });
  
  // Window state
  const [windowSize, setWindowSize] = useState({ width: 80, height: 80 }); // in vw/vh units
  const [windowPosition, setWindowPosition] = useState({ x: 10, y: 10 }); // in vw/vh units
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  // Essential color names and their CSS values
  const colorMap: Record<string, string> = {
    'red': '#ef4444',
    'blue': '#3b82f6',
    'green': '#10b981',
    'yellow': '#f59e0b',
    'purple': '#8b5cf6',
    'pink': '#ec4899',
    'orange': '#f97316',
    'brown': '#8b4513',
    'white': '#ffffff',
    'black': '#000000',
    'gray': '#6b7280'
  };

  const isColorCommand = (text: string): string | null => {
    const lowerText = text.toLowerCase().trim();
    
    // Direct color match
    if (colorMap[lowerText]) return colorMap[lowerText];
    
    // Hex color match
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(lowerText)) return lowerText;
    
    // Color phrase match
    const colorMatch = lowerText.match(/(?:set color to |change color to |use color |my color is |color: )(.+)/);
    if (colorMatch) {
      const colorName = colorMatch[1].trim();
      return colorMap[colorName] || (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorName) ? colorName : null);
    }
    
    return null;
  };

  const getTextColor = (backgroundColor: string): string => {
    // Simple logic to determine if text should be black or white based on background
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - (windowPosition.x * window.innerWidth / 100),
      y: e.clientY - (windowPosition.y * window.innerHeight / 100)
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(100 - windowSize.width, (e.clientX - dragStart.x) / window.innerWidth * 100));
      const newY = Math.max(0, Math.min(100 - windowSize.height, (e.clientY - dragStart.y) / window.innerHeight * 100));
      setWindowPosition({ x: newX, y: newY });
    }
    
    if (isResizing) {
      const deltaX = (e.clientX - resizeStart.x) / window.innerWidth * 100;
      const deltaY = (e.clientY - resizeStart.y) / window.innerHeight * 100;
      
      const newWidth = Math.max(30, Math.min(90, resizeStart.width + deltaX));
      const newHeight = Math.max(40, Math.min(90, resizeStart.height + deltaY));
      
      setWindowSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: windowSize.width,
      height: windowSize.height
    });
  };

  // Add global event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, windowSize.width, windowSize.height]);

  // API configuration
  const API_URL = import.meta.env.VITE_API_URL;

  // Real API integration
  const sendMessageToAPI = async (message: string): Promise<string> => {
    console.log("Sending message to API");
    console.log(message);
    console.log("--------------------------------")
    console.log(API_URL)
    console.log("--------------------------------")
    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.answer || "Sorry, I couldn't process that request.";
    } catch (error) {
      console.error('API Error:', error);
      return "Sorry, I'm having trouble connecting right now. Please try again.";
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Check if this is a help command
    if (text.toLowerCase().trim() === '\\help') {
      const helpText = `## SETTINGS\n- Change text color: Type a color name\n- Resize window: Drag bottom-right corner\n- Move window: Drag header\n\n## FUNCTIONS\n- Ask about Pablo's experience\n- Inquire about technical skills\n- Learn about projects\n\n## ACTIONS\n- Write an email to Pablo\n- Set up a meeting\n- Provide contact information`;
      
      setMessages(prev => [...prev, 
        { id: Date.now().toString(), text, sender: 'user', timestamp: new Date() },
        { id: (Date.now() + 1).toString(), text: helpText, sender: 'bot', timestamp: new Date() }
      ]);
      setInputText('');
      return;
    }

    // Check if this is a color command
    const newColor = isColorCommand(text);
    
    if (newColor) {
      // Update user color and save to localStorage
      setUserColor(newColor);
      localStorage.setItem('chatUserColor', newColor);
      
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: text,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Add bot confirmation message
      const colorName = Object.keys(colorMap).find(key => colorMap[key] === newColor) || newColor;
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Great! I've set your message color to ${colorName}. Your messages will now appear in this color for the rest of our conversation!`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setInputText('');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await sendMessageToAPI(text);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col shadow-2xl absolute select-none"
        style={{
          left: `${windowPosition.x}vw`,
          top: `${windowPosition.y}vh`,
          width: `${windowSize.width}vw`,
          height: `${windowSize.height}vh`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div>
            <h3 className="text-white font-medium">Levrok Labs AI</h3>
            <p className="text-white/60 text-xs">Ask me anything about Pablo</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-600/90 flex items-center justify-center text-white transition-colors backdrop-blur-sm border border-red-400/50 shadow-lg"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => {
              const isUser = message.sender === 'user';
              const messageStyle = isUser ? {
                backgroundColor: userColor,
                color: getTextColor(userColor)
              } : {
                backgroundColor: '#374151',
                color: 'white'
              };

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} max-w-[80%]`}>
                    <div 
                      className={`rounded-lg p-3 ${!isUser ? 'border border-black' : ''}`}
                      style={messageStyle}
                    >
                      <div className="text-sm leading-relaxed">
                        <ReactMarkdown
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-3 mt-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 mt-3" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-sm font-semibold mb-2 mt-2" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 mb-3 ml-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 mb-3 ml-2" {...props} />,
                            li: ({node, ...props}) => <li className="ml-2" {...props} />,
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                            em: ({node, ...props}) => <em className="italic" {...props} />,
                            code: ({node, ...props}) => <code className="bg-black/20 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                            pre: ({node, ...props}) => <pre className="bg-black/20 p-2 rounded mt-2 mb-2 text-xs font-mono overflow-x-auto" {...props} />
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex justify-start">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length === 1 && (
          <div className="px-4 py-2">
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white/90 px-3 py-1 rounded-full transition-colors backdrop-blur-sm border border-white/10"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="w-full bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-white/60 resize-none overflow-hidden"
                disabled={isTyping}
                rows={1}
                style={{ minHeight: '40px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="bg-amber-800 hover:bg-amber-900 disabled:bg-white/20 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors backdrop-blur-sm flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-xs text-white/40 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
        
        {/* Resize Handle */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-white/20 hover:bg-white/30 transition-colors"
          onMouseDown={handleResizeMouseDown}
          style={{
            clipPath: 'polygon(100% 0, 0 100%, 100% 100%)'
          }}
        />
      </motion.div>
    </div>
  );
};

export default ChatInterface;