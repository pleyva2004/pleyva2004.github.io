# Realtime API Migration

## Problem
Vercel serverless functions don't support WebSockets. The `ws` library crashed with `TypeError: b.mask is not a function`.

## Solution
Moved WebSocket connection from server to browser.

## Architecture

```
Browser                         Server (Vercel)
   │                                 │
   ├─── POST /api/realtime ──────────┤  (get ephemeral token)
   │                                 │
   ├─── wss://api.openai.com ────────X  (direct connection)
   │                                 │
   └─── POST /api/tools ─────────────┤  (execute Cal.com tools)
```

## Files Changed

| File | Change |
|------|--------|
| `src/app/api/realtime/route.ts` | Now returns ephemeral session token only |
| `src/app/api/tools/route.ts` | New route for server-side tool execution |
| `src/components/ChatInterface.tsx` | Connects to OpenAI directly via browser WebSocket |
| `src/lib/realtime/types.ts` | Added `arguments` field to `RealtimeEventItem` |

## Connection Waiting Logic

Added `waitForConnection()` helper in `ChatInterface.tsx`:
- Polls `wsRef.current?.readyState` every 100ms
- Resolves when `WebSocket.OPEN`
- Rejects after 5s timeout

**UX Flow:**
1. User sends message
2. If not connected → show "Connecting..." in bot placeholder
3. Wait up to 5s for connection
4. Connected → send message and stream response
5. Timeout → show disconnection error

## Key Features
- Connection waits up to 5s before showing error
- Tools (calendar booking) still execute server-side with secrets
- Streaming responses work in browser
- Removed `isConnected` state; now uses `wsRef.current?.readyState` directly
