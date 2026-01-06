import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ChevronDown, CircleChevronDown, MessageCircle, Smile, UserRound } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const baseURL = "http://localhost:3000/api/v1";

interface Participant {
  user: {
    name: string;
  };
}

interface RoomDetails {
  title: string;
  maxUsers: number;
  roomAdmin: string;
  roomCode: string;
  participants: Participant[];
  countUsers: number;
}

interface RoomDetailsResponse {
  message: string;
  data: RoomDetails;
}

function ChatPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [showEmoji, setShowEmoji] = useState(false);
  const [details, setDetails] = useState<RoomDetails | null>(null);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openParticipantMenu, setopenParticipantMenu] = useState(false);
  const token = localStorage.getItem("roomToken");

  const inputRef = useRef<HTMLInputElement>(null)
  const endMessageRef = useRef<HTMLDivElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)

  async function leaveRoom() {
    try {
      const response = await axios.get(`${baseURL}/room/${details?.roomCode}/leave`,{headers:{Authorization: `Bearer ${localStorage.getItem("roomToken")}`}});
      if(response.status === 200){
        toast.success("User has left the chat");
        navigate("/dashboard");
      }else{
        toast.error("Couldn't handle the request ",response.data.error);
        navigate("/dashboard")
      }
    } catch (error) {
      console.log(error);
      toast.error(`Server is on load: ${error}`)
    }
  }

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

  async function getDetails() {
    const response = await axios.get<RoomDetailsResponse>(`${baseURL}/room/details`,{headers: {
      Authorization:`Bearer ${token}`
    }});

    setDetails(response.data.data);
  }

  /* ---------------- WEBSOCKET ---------------- */
  useEffect(() => {
    getDetails();
    const ws = new WebSocket('ws://localhost:3001');
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

        <div className="h-12 flex items-center justify-around bg-zinc-200 rounded-md px-3">
          <div className="flex w-full items-center justify-between p-1">

            <div className="h-full gap-2 flex items-center justify-center shrink-0">
              <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-lg">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>

              <h1 className="text-lg font-mono font-semibold whitespace-nowrap">
                Ping Room
              </h1>
            </div>

            <div className='flex justify-end items-center gap-2'>
              <div className="w-43 h-full flex justify-center items-center bg-gray-800 text-zinc-50 rounded pl-5 pr-5">
                <span className="text-md whitespace-nowrap">
                  Room Code: <span className="font-bold">{details?.roomCode}</span>
                </span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setOpenUserMenu(v => !v)}
                  className="shrink-0 w-10 h-6 rounded-md flex justify-center items-center hover:bg-black hover:text-white transition"
                >
                  <UserRound className="w-5 h-5" />
                </button>

                {openUserMenu && (
                  <div className="absolute right-0 top-8 w-48 rounded-md bg-white border shadow-md z-50">

                    <button
                      onClick={() => setopenParticipantMenu(v => !v)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 flex justify-between items-center"
                    >
                      Participants 
                      <span className="text-xs">{details?.participants.length}</span>
                      <ChevronDown className='w-6 h-6 flex justify-center items-center bg-neutral-100 rounded-sm' />
                    </button>

                    {openParticipantMenu && (
                      <div className="border-t">
                        {details?.participants.map((x, i) => (
                          <div
                            key={i}
                            className="px-4 py-2 text-sm hover:bg-zinc-100 whitespace-nowrap"
                          >
                            {x.user.name}
                          </div>
                        ))}
                      </div>
                    )}

                    <button onClick={leaveRoom} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-zinc-100">
                      Leave Room
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-zinc-200 rounded-xl p-2 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className="bg-white px-3 py-2 rounded-lg text-sm w-fit max-w-[80%]">
              {msg}
            </div>
          ))}
          <div ref={endMessageRef} />
        </div>

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

export default ChatPage;