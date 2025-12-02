"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Mic, MicOff, RefreshCw } from "lucide-react";
import { buildSessionConfig } from "@/lib/realtime/session-config";

type VoiceStatus = "connecting" | "idle" | "listening" | "speaking" | "error";

interface VoiceChatInterfaceProps {
  onClose: () => void;
}

interface PendingToolCall {
  id: string;
  name: string;
  argumentsJson: string;
  callId?: string;
}

const VoiceChatInterface: React.FC<VoiceChatInterfaceProps> = ({ onClose }) => {
  const [status, setStatus] = useState<VoiceStatus>("connecting");
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingToolCallRef = useRef<PendingToolCall | null>(null);
  const isListeningRef = useRef(false);

  const cleanupConnection = useCallback(() => {
    dataChannelRef.current?.close();
    dataChannelRef.current = null;

    pcRef.current?.close();
    pcRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    pendingToolCallRef.current = null;
    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  const executePendingToolCall = useCallback(async () => {
    const pendingCall = pendingToolCallRef.current;
    if (!pendingCall?.callId) return;

    try {
      const response = await fetch("/api/tools/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pendingCall.id,
          name: pendingCall.name,
          arguments: pendingCall.argumentsJson
        })
      });

      if (!response.ok) {
        console.error("[VoiceChat] Tool execution failed:", await response.text());
        return;
      }

      const data = await response.json();
      const outputPayload = data.result ?? data;

      dataChannelRef.current?.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: pendingCall.callId,
            output: JSON.stringify(outputPayload)
          }
        })
      );

      dataChannelRef.current?.send(JSON.stringify({ type: "response.create" }));
    } catch (error) {
      console.error("[VoiceChat] Tool execution error:", error);
    } finally {
      pendingToolCallRef.current = null;
    }
  }, []);

  const handleDataChannelMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "error") {
          console.error("[VoiceChat] Realtime error:", message);
          setStatus("error");
          setErrorMessage(message.error?.message ?? "Realtime API error");
        }

        if (message.type === "response.audio.delta") {
          setStatus("speaking");
        }

        if (message.type === "response.audio.completed") {
          setStatus(isListeningRef.current ? "listening" : "idle");
        }

        if (message.type === "response.function_call_arguments.delta") {
          if (!pendingToolCallRef.current) {
            pendingToolCallRef.current = {
              id: message.item_id || message.call_id || crypto.randomUUID(),
              name: message.name || "",
              argumentsJson: ""
            };
          }
          pendingToolCallRef.current.argumentsJson += message.delta ?? "";
        }

        if (message.type === "response.output_item.done") {
          if (
            message.item?.type === "function_call" &&
            pendingToolCallRef.current
          ) {
            pendingToolCallRef.current.callId =
              message.item.call_id || pendingToolCallRef.current.id;
            void executePendingToolCall();
          }
        }

        if (message.type === "response.done" && !isListeningRef.current) {
          setStatus("idle");
        }
      } catch (error) {
        console.error("[VoiceChat] Failed to parse message:", error);
      }
    },
    [executePendingToolCall]
  );

  const connectToRealtime = useCallback(async () => {
    setStatus("connecting");
    setErrorMessage(null);
    cleanupConnection();

    try {
      const sessionResponse = await fetch("/api/session", { method: "POST" });
      if (!sessionResponse.ok) {
        throw new Error("Failed to initialize voice session.");
      }

      const sessionData = await sessionResponse.json();
      const clientSecret = sessionData.clientSecret;

      if (!clientSecret) {
        throw new Error("Missing OpenAI client secret.");
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      pcRef.current = pc;

      const dataChannel = pc.createDataChannel("oai-events");
      dataChannelRef.current = dataChannel;

      dataChannel.onmessage = handleDataChannelMessage;
      dataChannel.onopen = () => {
        setStatus("idle");
        const sessionConfig = buildSessionConfig({ mode: "voice" });
        dataChannel.send(
          JSON.stringify({
            type: "session.update",
            session: sessionConfig
          })
        );
      };
      dataChannel.onclose = () => {
        if (status !== "error") {
          setStatus("idle");
        }
      };

      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = stream;
        }
        event.track.onunmute = () => setStatus("speaking");
        event.track.onended = () =>
          setStatus(isListeningRef.current ? "listening" : "idle");
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          setStatus("error");
          setErrorMessage("Connection lost. Please try again.");
        }
      };

      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      localStreamRef.current = localStream;

      localStream.getAudioTracks().forEach((track) => {
        track.enabled = false;
        pc.addTrack(track, localStream);
      });

      pc.addTransceiver("audio", { direction: "recvonly" });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${clientSecret}`,
            "Content-Type": "application/sdp",
            "OpenAI-Beta": "realtime=v1"
          },
          body: offer.sdp ?? ""
        }
      );

      if (!sdpResponse.ok) {
        throw new Error("OpenAI rejected the WebRTC offer.");
      }

      const answer = await sdpResponse.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answer });
    } catch (error) {
      console.error("[VoiceChat] Connection error:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to connect to OpenAI."
      );
    }
  }, [cleanupConnection, handleDataChannelMessage, status]);

  useEffect(() => {
    void connectToRealtime();
    return () => {
      cleanupConnection();
    };
  }, [cleanupConnection, connectToRealtime]);

  const toggleListening = () => {
    if (!localStreamRef.current || status === "connecting" || status === "error") {
      return;
    }

    const shouldEnable = !isListeningRef.current;

    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = shouldEnable;
    });

    isListeningRef.current = shouldEnable;
    setIsListening(shouldEnable);
    setStatus(shouldEnable ? "listening" : "idle");

    if (!shouldEnable) {
      dataChannelRef.current?.send(JSON.stringify({ type: "response.create" }));
    }
  };

  const handleClose = () => {
    cleanupConnection();
    onClose();
  };

  const handleRetry = () => {
    void connectToRealtime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <motion.div
        layoutId="chat-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-black/80 border border-white/10 rounded-2xl p-8 shadow-2xl w-full max-w-md mx-4 relative overflow-hidden"
      >
        <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          aria-label="Close voice assistant"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center justify-center space-y-8 py-12">
          <div className="relative">
            {status === "listening" && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border border-white/20"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border border-white/20"
                  animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
                />
              </>
            )}

            <button
              onClick={toggleListening}
              disabled={status === "connecting" || status === "error"}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                  : "bg-white/10 hover:bg-white/20"
              } ${status === "error" ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isListening ? (
                <Mic size={40} className="text-white" />
              ) : (
                <MicOff size={40} className="text-white/50" />
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-xl font-medium text-white">
              {status === "connecting" && "Connecting..."}
              {status === "idle" && "Tap to speak"}
              {status === "listening" && "Listening..."}
              {status === "speaking" && "Pablo AI is speaking..."}
              {status === "error" && "Connection issue"}
            </h3>
            <p className="text-sm text-white/50">Voice Mode (Beta)</p>
            {errorMessage && (
              <div className="flex flex-col items-center space-y-2 mt-2">
                <p className="text-xs text-red-300">{errorMessage}</p>
                <button
                  onClick={handleRetry}
                  className="flex items-center space-x-2 text-xs text-white/80 bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <RefreshCw size={14} />
                  <span>Retry</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceChatInterface;

