import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CircleUserRound,
  MessageCircle,
  Smile,
  Timer,
  UserRound
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const baseURL = "http://localhost:3000/api/v1";

interface Participant {
  user: { name: string };
}

interface RoomDetails {
  title: string;
  maxUsers: number;
  roomAdmin: string;
  roomCode: string;
  expiresAt: any;
  participants: Participant[];
  countUsers: number;
}

interface RoomDetailsResponse {
  message: string;
  data: RoomDetails;
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  roomId: string;
  createdAt: string;
}

function getUserIdFromToken(token: string | null) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch {
    return null;
  }
}

function ChatPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("roomToken");
  const myUserId = getUserIdFromToken(token);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [details, setDetails] = useState<RoomDetails | null>(null);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openParticipantMenu, setOpenParticipantMenu] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const endMessageRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const participantMenuRef = useRef<HTMLDivElement>(null);

  async function getDetails() {
    try {
      const response = await axios.get<RoomDetailsResponse>(
        `${baseURL}/room/details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data.data);
      setDetails(response.data.data);
    } catch {
      toast.error("Failed to fetch room details");
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  useEffect(() => {
    if (!details?.expiresAt) return;
    const expiresAt = new Date(details.expiresAt).getTime();

    function updateTime() {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(diff);
    }

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [details?.expiresAt]);

  useEffect(() => {
    if (timeLeft === 0 && details) {
      toast.info("Room expired");
      navigate("/dashboard");
    }
  }, [timeLeft]);

  useEffect(() => {
    if (!token) {
      toast.error("No token found");
      navigate("/dashboard");
      return;
    }

    getDetails();

    const ws = new WebSocket('ws://localhost:3001');
    setSocket(ws);

    setInterval(() =>{
      getDetails()
    }, 5000)

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "AUTH", token }));
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "AUTH_OK") {
          setIsAuthed(true);
          return;
        }
        if (data.content && data.senderId) {
          setMessages(prev => [...prev, data]);
        }
      } catch {}
    };

    ws.onclose = () => setIsAuthed(false);
    return () => ws.close();
  }, [token, navigate]);

  useEffect(() => {
    endMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;

      if (showEmoji && emojiRef.current && !emojiRef.current.contains(target)) {
        setShowEmoji(false);
      }

      if (openUserMenu && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setOpenUserMenu(false);
        setOpenParticipantMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmoji, openUserMenu]);

  function sendMessage() {
    if (!isAuthed || !socket || socket.readyState !== WebSocket.OPEN) return;
    if (!message.trim()) return;

    socket.send(JSON.stringify({ type: "MESSAGE", content: message }));
    setMessage('');
    setShowEmoji(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  }

  async function leaveRoom() {
    try {
      await axios.get(
        `${baseURL}/room/${details?.roomCode}/leave`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("You left the room");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to leave room");
      navigate("/dashboard");
    }
  }

  if (!details) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading chat...
      </div>
    );
  }

  const timerDanger = timeLeft <= 60;

  return (
    <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center p-4">
      <div className="flex flex-col gap-3 max-w-xl w-full h-[90vh] bg-white rounded-xl border shadow">

        <div className="flex items-center justify-between px-4 py-2 border-b bg-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-zinc-900 rounded-lg">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight">{details.title}</h1>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="font-mono">{details.roomCode}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
              ${timerDanger ? "bg-red-100 text-red-700" : "bg-zinc-200 text-zinc-700"}`}
            >
              <Timer className="w-3.5 h-3.5" />
              {formatTime(timeLeft)}
            </div>

            <div className="relative">
              <button
                onClick={() => setOpenUserMenu(v => !v)}
                className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-zinc-200"
              >
                <UserRound className="w-4 h-4" />
              </button>

              {openUserMenu && (
                <div
                  ref={userMenuRef}
                  className="absolute right-0 top-10 w-52 bg-white border rounded-lg shadow-lg z-50"
                >
                  <button
                    onClick={() => setOpenParticipantMenu(v => !v)}
                    className="w-full px-4 py-2 text-sm flex justify-between hover:bg-zinc-100"
                  >
                    Participants
                    {openParticipantMenu ? <ChevronUp /> : <ChevronDown />}
                  </button>

                  {openParticipantMenu && (
                    <div ref={participantMenuRef} className="border-t">
                      {details.participants.map((p, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 text-sm flex gap-2 items-center text-zinc-700"
                        >
                          <CircleUserRound className="w-4 h-4" />
                          {p.user.name}
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={leaveRoom}
                    className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                  >
                    Leave Room
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

       <div className="flex-1 overflow-y-auto bg-zinc-50 px-3 py-2 space-y-2">
          {messages.map(msg => {
            const isMe = msg.senderId === myUserId;

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                  <div
                    className={`px-3 py-2 rounded-lg text-sm
                    ${isMe ? "bg-black text-white" : "bg-white border"}`}
                  >
                    {msg.content}
                  </div>

                  <span className="mt-1 text-[10px] text-zinc-500">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={endMessageRef} />
        </div>
        <div className="relative flex items-center gap-2 px-3 py-2 border-t">
          <button
            onClick={() => setShowEmoji(v => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-zinc-100"
          >
            <Smile />
          </button>

          {showEmoji && (
            <div ref={emojiRef} className="absolute bottom-14 left-2 z-50">
              <EmojiPicker onEmojiClick={(e) => setMessage(p => p + e.emoji)} />
            </div>
          )}

          <input
            ref={inputRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="flex-1 h-10 px-3 rounded-lg border outline-none text-sm"
          />

          <button
            onClick={sendMessage}
            className="px-4 h-10 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-800"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;