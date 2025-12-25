// src/components/ChatInterface.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { buildSessionConfig } from '@/lib/realtime/session-config';
import type { RealtimeEvent } from '@/lib/realtime/types';
import { useWebLLM } from '@/hooks/useWebLLM';
import { ModelSelector } from './ModelSelector';
import { ModelLoadingProgress } from './ModelLoadingProgress';
import { AVAILABLE_MODELS, type ChatMode, type ChatBackend } from '@/lib/webllm/types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

interface ChatInterfaceProps {
  onClose: () => void;
}

const quickReplies = [
  'Show me Pablo\'s resume',
  'Tell me about Pablo\'s experience',
  'What skills does Pablo have?',
  'Show me Pablo\'s projects',
  'What are Pablo\'s goals?',
  'Check Pablo\'s schedule',
];

const API_URL = "/api";

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  // ============ STATE ============
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey, I am an AI Agent from Levrok Labs. Please enter \\help for usage tips',
      sender: 'bot',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userColor, setUserColor] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chatUserColor') || 'brown';
    }
    return 'brown';
  });

  // ============ BACKEND SELECTION ============
  const [chatMode, setChatMode] = useState<ChatMode>('text');
  const [chatBackend, setChatBackend] = useState<ChatBackend>(() => {
    if (typeof window !== 'undefined') {
      const savedModelId = localStorage.getItem('selectedModelId');
      return savedModelId === 'gpt-4o' ? 'openai' : 'webllm';
    }
    return 'webllm';
  });

  // ============ WEBLLM HOOK ============
  const {
    engineState,
    hardware,
    currentModelId,
    initialize: initializeWebLLM,
    switchModelTo,
    sendMessage: sendWebLLMMessage,
  } = useWebLLM();

  // ============ OPENAI WEBSOCKET (for voice mode & fallback) ============
  const wsRef = useRef<WebSocket | null>(null);
  const currentResponseIdRef = useRef<string | null>(null);

  // ============ WINDOW STATE ============
  const [windowSize, setWindowSize] = useState({ width: 80, height: 80 });
  const [windowPosition, setWindowPosition] = useState({ x: 10, y: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ============ OPENAI CONNECTION (for voice mode or cloud backend) ============
  const connectToOpenAI = useCallback(async () => {
    // If already connected or connecting, skip
    if (wsRef.current && wsRef.current.readyState <= 1) return;

    try {
      console.log("[Chat] Requesting ephemeral token...");
      const tokenRes = await fetch(`${API_URL}/realtime`, { method: "POST" });
      if (!tokenRes.ok) throw new Error("Failed to get session token");

      const data = await tokenRes.json();
      const secret = data.client_secret.value;

      console.log("[Chat] Connecting to OpenAI Realtime...");
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
        console.log("[Chat] WebSocket connected");
        // Always set to text mode settings for cloud text chat, override if voice is active
        const config = buildSessionConfig({ mode: chatMode === 'voice' ? 'voice' : 'text' });
        ws.send(JSON.stringify({
          type: 'session.update',
          session: config
        }));
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data) as RealtimeEvent;
          handleRealtimeEvent(data);
        } catch (err) {
          console.error("[Chat] Error parsing event:", err);
        }
      };

      ws.onclose = () => {
        console.log("[Chat] WebSocket closed");
        wsRef.current = null;
      };

      ws.onerror = (err) => {
        console.error("[Chat] WebSocket error:", err);
      };

    } catch (err) {
      console.error("[Chat] Connection failed:", err);
    }
  }, [chatMode]);

  const disconnectFromOpenAI = useCallback(() => {
    if (wsRef.current) {
      console.log("[Chat] Disconnecting from OpenAI...");
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

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

      case 'response.output_item.done': {
        const item = event.item;
        if (item?.type === 'function_call') {
          console.log("[Chat] Function call:", item.name, item.arguments);
          try {
            const res = await fetch(`${API_URL}/tools`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: item.call_id,
                name: item.name,
                argumentsJson: item.arguments
              })
            });

            const result = await res.json();
            console.log("[Chat] Tool result:", result);

            wsRef.current?.send(JSON.stringify({
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: item.call_id,
                output: JSON.stringify(result)
              }
            }));

            wsRef.current?.send(JSON.stringify({ type: "response.create" }));

          } catch (err) {
            console.error("[Chat] Tool execution failed:", err);
          }
        }
        break;
      }

      case 'response.done': {
        setIsTyping(false);
        break;
      }
    }
  };

  // ============ INITIALIZATION ============
  useEffect(() => {
    const init = async () => {
      if (!hardware) return;

      // Check for saved model preference
      const savedModelId = typeof window !== 'undefined'
        ? localStorage.getItem('selectedModelId')
        : null;

      // If GPT-4o was previously selected, connect to OpenAI
      if (savedModelId === 'gpt-4o') {
        console.log('[Chat] Restoring GPT-4o backend from localStorage');
        setChatBackend('openai');
        return; // WebSocket connection will be established by the backend effect
      }

      if (!hardware.webgpuSupported) {
        // No WebGPU - fall back to OpenAI for everything
        console.log('[Chat] WebGPU not supported, using OpenAI backend');
        setChatBackend('openai');
        localStorage.setItem('selectedModelId', 'gpt-4o');
        return;
      }

      // Use saved model ID or fall back to recommended
      const modelToLoad = savedModelId && savedModelId !== 'gpt-4o'
        ? savedModelId
        : hardware.recommendedModelId;

      console.log('[Chat] WebGPU supported, preloading model:', modelToLoad);
      try {
        await initializeWebLLM(modelToLoad);
      } catch (err) {
        console.error('[Chat] WebLLM init failed, falling back to OpenAI:', err);
        setChatBackend('openai');
        localStorage.setItem('selectedModelId', 'gpt-4o');
      }
    };

    init();
  }, [hardware, initializeWebLLM, connectToOpenAI]);

  // Manage WebSocket connection based on backend
  useEffect(() => {
    if (chatBackend === 'openai' || chatMode === 'voice') {
      connectToOpenAI();
    } else {
      disconnectFromOpenAI();
    }

    // Cleanup: close WebSocket when chat is closed (component unmounts)
    return () => {
      disconnectFromOpenAI();
    };
  }, [chatBackend, chatMode, connectToOpenAI, disconnectFromOpenAI]);

  // ============ HELPER FUNCTIONS ============
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

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
    if (colorMap[lowerText]) return colorMap[lowerText];
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(lowerText)) return lowerText;
    const colorMatch = lowerText.match(/(?:set color to |change color to |use color |my color is |color: )(.+)/);
    if (colorMatch) {
      const colorName = colorMatch[1].trim();
      return colorMap[colorName] || (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorName) ? colorName : null);
    }
    return null;
  };

  const getTextColor = (backgroundColor: string): string => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  const waitForConnection = (timeoutMs: number = 5000): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }
      const checkInterval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          resolve();
        }
      }, 100);
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Connection timeout"));
      }, timeoutMs);
    });
  };

  // ============ MESSAGE HANDLERS ============

  // WebLLM message handler
  const handleWebLLMMessage = async (text: string) => {
    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    const botMsgId = (Date.now() + 1).toString();
    const botMessage: Message = { id: botMsgId, text: '', sender: 'bot' };

    setMessages(prev => [...prev, userMessage, botMessage]);
    currentResponseIdRef.current = botMsgId;
    setIsTyping(true);

    // Build conversation history for context
    const conversationHistory = messages
      .filter(m => m.id !== '1') // Skip initial greeting
      .map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text
      }));

    await sendWebLLMMessage(
      text,
      conversationHistory,
      // onDelta
      (_delta, fullText) => {
        setMessages(prev => prev.map(msg =>
          msg.id === botMsgId ? { ...msg, text: fullText } : msg
        ));
      },
      // onToolCall
      (toolCall, result) => {
        console.log('[Chat] Tool executed:', toolCall.action, result);
      },
      // onComplete
      (finalText) => {
        setMessages(prev => prev.map(msg =>
          msg.id === botMsgId ? { ...msg, text: finalText } : msg
        ));
        setIsTyping(false);
      },
      // onError
      (error) => {
        console.error('[Chat] WebLLM error:', error);
        setMessages(prev => prev.map(msg =>
          msg.id === botMsgId ? { ...msg, text: `Error: ${error.message}` } : msg
        ));
        setIsTyping(false);
      }
    );
  };

  // OpenAI message handler (for voice mode & fallback)
  const handleOpenAIMessage = async (text: string) => {
    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    const botMsgId = (Date.now() + 1).toString();
    const botMessage: Message = { id: botMsgId, text: '', sender: 'bot' };

    setMessages(prev => [...prev, userMessage, botMessage]);
    currentResponseIdRef.current = botMsgId;
    setIsTyping(true);

    try {
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        setMessages(prev => prev.map(msg =>
          msg.id === botMsgId ? { ...msg, text: 'Connecting...' } : msg
        ));
        await waitForConnection(5000);
        setMessages(prev => prev.map(msg =>
          msg.id === botMsgId ? { ...msg, text: '' } : msg
        ));
      }

      wsRef.current!.send(JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text }]
        }
      }));

      wsRef.current!.send(JSON.stringify({ type: "response.create" }));

    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages(prev => prev.map(msg =>
        msg.id === botMsgId
          ? { ...msg, text: "I'm currently disconnected. Please close and reopen the chat." }
          : msg
      ));
      setIsTyping(false);
    }
  };

  // Main send message handler
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Help command
    if (text.toLowerCase().trim() === '\\help') {
      const helpText = `## SETTINGS\n- Change text color: Type a color name\n- Resize window: Drag bottom-right corner\n- Move window: Drag header\n- Switch AI model: Use selector in header\n\n## FUNCTIONS\n- Ask about Pablo's experience\n- Inquire about technical skills\n- Learn about projects\n\n## ACTIONS\n- Write an email to Pablo\n- Set up a meeting\n- Provide contact information`;
      setMessages(prev => [...prev,
      { id: Date.now().toString(), text, sender: 'user' },
      { id: (Date.now() + 1).toString(), text: helpText, sender: 'bot' }
      ]);
      setInputText('');
      return;
    }

    // Color command
    const newColor = isColorCommand(text);
    if (newColor) {
      setUserColor(newColor);
      localStorage.setItem('chatUserColor', newColor);
      const colorName = Object.keys(colorMap).find(key => colorMap[key] === newColor) || newColor;
      setMessages(prev => [...prev,
      { id: Date.now().toString(), text, sender: 'user' },
      { id: (Date.now() + 1).toString(), text: `Great! I've set your message color to ${colorName}.`, sender: 'bot' }
      ]);
      setInputText('');
      return;
    }

    setInputText('');

    // Route to appropriate backend
    if (chatMode === 'voice' || chatBackend === 'openai') {
      await handleOpenAIMessage(text);
    } else {
      await handleWebLLMMessage(text);
    }
  };

  // ============ MODEL SELECTION ============
  const handleModelSwitch = async (modelId: string) => {
    // Save selection to localStorage
    localStorage.setItem('selectedModelId', modelId);

    // Handle GPT-4o selection
    if (modelId === 'gpt-4o') {
      if (chatBackend !== 'openai') {
        setChatBackend('openai');
      }
      return;
    }

    // Handle Local Model selection
    if (chatBackend === 'openai') {
      setChatBackend('webllm');
    }

    if (modelId === currentModelId && chatBackend === 'webllm') return;
    try {
      await switchModelTo(modelId);
    } catch (err) {
      console.error('[Chat] Failed to switch model:', err);
    }
  };

  // ============ MODE TOGGLE ============
  const handleModeToggle = () => {
    const newMode = chatMode === 'text' ? 'voice' : 'text';
    setChatMode(newMode);

    if (newMode === 'voice' && !wsRef.current) {
      connectToOpenAI();
    }
  };

  // ============ DRAG/RESIZE HANDLERS ============
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - (windowPosition.x * window.innerWidth / 100),
      y: e.clientY - (windowPosition.y * window.innerHeight / 100)
    });
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(100 - windowSize.width, (e.clientX - dragStart.x) / window.innerWidth * 100));
        const newY = Math.max(0, Math.min(100 - windowSize.height, (e.clientY - dragStart.y) / window.innerHeight * 100));
        setWindowPosition({ x: newX, y: newY });
      }
      if (isResizing) {
        const newWidth = Math.max(20, Math.min(80, (e.clientX - resizeStart.x) / window.innerWidth * 100 + windowSize.width));
        const newHeight = Math.max(20, Math.min(80, (e.clientY - resizeStart.y) / window.innerHeight * 100 + windowSize.height));
        setWindowSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, windowSize.width, windowSize.height]);

  const handleQuickReply = (reply: string) => handleSendMessage(reply);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSendMessage(inputText); };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(inputText); }
  };

  // ============ RENDER ============
  const currentModel = AVAILABLE_MODELS.find(m => m.id === currentModelId);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md">
      <motion.div
        layoutId="chat-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col shadow-2xl absolute select-none"
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
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-white font-medium">Levrok Labs AI</h3>
              <p className="text-white/60 text-xs">
                {chatBackend === 'webllm'
                  ? `Local AI • ${currentModel?.name || 'Loading...'}`
                  : `Cloud AI • ${chatMode === 'voice' ? 'OpenAI Voice' : 'GPT-4o'}`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <button
              onClick={handleModeToggle}
              className={`p-2 rounded-lg transition-colors ${chatMode === 'voice'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-white/10 text-white/60 hover:text-white'
                }`}
              title={chatMode === 'voice' ? 'Switch to Text Mode' : 'Switch to Voice Mode'}
            >
              {chatMode === 'voice' ? <MessageSquare size={16} /> : <Mic size={16} />}
            </button>

            {/* Model Selector (only for text mode) */}
            {chatMode === 'text' && (
              <ModelSelector
                currentModelId={chatBackend === 'openai' ? 'gpt-4o' : currentModelId}
                recommendedModelId={hardware?.recommendedModelId || null}
                onSelectModel={handleModelSwitch}
                disabled={engineState.status === 'loading' || engineState.status === 'switching'}
                isLoading={engineState.status === 'loading' || engineState.status === 'switching'}
                webGpuSupported={hardware?.webgpuSupported ?? false}
              />
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-600/90 flex items-center justify-center text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Loading Progress (when loading model) */}
        {engineState.status === 'loading' && (
          <div className="p-4">
            <ModelLoadingProgress
              progress={engineState.progress}
              modelName={AVAILABLE_MODELS.find(m => m.id === currentModelId)?.name}
            />
          </div>
        )}

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
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            h1: (props) => <h1 className="text-lg font-bold mb-3 mt-2" {...props} />,
                            h2: (props) => <h2 className="text-base font-bold mb-2 mt-3" {...props} />,
                            h3: (props) => <h3 className="text-sm font-semibold mb-2 mt-2" {...props} />,
                            ul: (props) => <ul className="list-disc list-inside space-y-1 mb-3 ml-2" {...props} />,
                            ol: (props) => <ol className="list-decimal list-inside space-y-1 mb-3 ml-2" {...props} />,
                            li: (props) => <li className="ml-2" {...props} />,
                            p: (props) => <p className="mb-2 last:mb-0" {...props} />,
                            strong: (props) => <strong className="font-semibold" {...props} />,
                            em: (props) => <em className="italic" {...props} />,
                            code: (props) => <code className="bg-black/20 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                            pre: (props) => <pre className="bg-black/20 p-2 rounded mt-2 mb-2 text-xs font-mono overflow-x-auto" {...props} />,
                            a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline" />,
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

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
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
                  className="text-xs bg-white/10 hover:bg-white/20 text-white/90 px-3 py-1 rounded-full transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="w-full bg-white/10 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 placeholder-white/60 resize-none overflow-hidden"
                style={{ minHeight: '40px', '--tw-ring-color': userColor + '90' } as React.CSSProperties}
                disabled={isTyping || engineState.status === 'loading'}
                rows={1}
              />
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping || engineState.status === 'loading'}
              className="disabled:bg-white/20 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              style={{ backgroundColor: !inputText.trim() || isTyping ? undefined : userColor }}
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
          style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
        />
      </motion.div>
    </div>
  );
};

export default ChatInterface;
