import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Smile } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [showEmoji, setShowEmoji] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const endMessageRef = useRef<HTMLDivElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)

  /* ---------------- SEND MESSAGE ---------------- */
  function sendMessage() {
    if (!message.trim()) return
    if (!socket || socket.readyState !== WebSocket.OPEN) return

    socket.send(message)
    setMessage('')
  }

  /* ---------------- ENTER KEY ---------------- */
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  /* ---------------- WEBSOCKET ---------------- */
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000')
    setSocket(ws)

    ws.onmessage = (e) => {
      setMessages(prev => [...prev, e.data])
    }

    return () => ws.close()
  }, [])

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    endMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* ---------------- ESC TO CLOSE EMOJI ---------------- */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowEmoji(false)
        inputRef.current?.focus()
      }
    }

    if (showEmoji) {
      document.addEventListener('keydown', handleKey)
    }

    return () => {
      document.removeEventListener('keydown', handleKey)
    }
  }, [showEmoji])

  /* ---------------- CLICK OUTSIDE ---------------- */
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false)
      }
    }

    if (showEmoji) {
      document.addEventListener('mousedown', handleOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutside)
    }
  }, [showEmoji])

  return (
    <div className="min-h-dvh w-full bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col gap-2 max-w-xl w-full h-150 bg-white rounded-lg border p-3">

        {/* HEADER */}
        <div className="h-12 flex items-center justify-between bg-zinc-200 rounded-md px-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-lg">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-mono font-semibold">Ping Room</h1>
          </div>
        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto bg-zinc-200 rounded-xl p-2 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className="bg-white px-3 py-2 rounded-lg text-sm w-fit max-w-[80%]">
              {msg}
            </div>
          ))}
          <div ref={endMessageRef} />
        </div>

        {/* FOOTER */}
        <div className="relative h-14 flex items-center gap-2 px-2 border border-zinc-300  rounded-xl">

          <button
            onClick={() => setShowEmoji(v => !v)}
            className="text-xl"
          >
            <Smile />
          </button>

          {showEmoji && (
            <div ref={emojiRef} className="absolute bottom-16 left-2 z-50">
              <EmojiPicker
                lazyLoadEmojis
                onEmojiClick={(e) => {
                  setMessage(prev => prev + e.emoji)
                  requestAnimationFrame(() => inputRef.current?.focus())
                }}
              />
            </div>
          )}

          <input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-10 px-3 rounded-lg border border-zinc-300 outline-none"
            placeholder="Type a message"
            autoFocus
          />

          <button
            onClick={sendMessage}
            className="px-4 h-10 bg-green-400 rounded-lg font-medium"
          >
            Send
          </button>

        </div>
      </div>
    </div>
  )
}

export default App