import { useEffect, useRef, useState } from 'react';
import { ChevronDown, MessageCircle, Smile, UserRound } from 'lucide-react';
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
  participants: Participant[];
  countUsers: number;
}

interface RoomDetailsResponse {
  message: string;
  data: RoomDetails;
}

function ChatPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [details, setDetails] = useState<RoomDetails | null>(null);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openParticipantMenu, setOpenParticipantMenu] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  const token = localStorage.getItem("roomToken");

  const inputRef = useRef<HTMLInputElement>(null);
  const endMessageRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  /* ------------------ FETCH ROOM DETAILS ------------------ */
  async function getDetails() {
    try {
      const response = await axios.get<RoomDetailsResponse>(`${baseURL}/room/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDetails(response.data.data);
    } catch (err) {
      toast.error("Failed to fetch room details.");
    }
  }

  /* ------------------ WEBSOCKET ------------------ */
  useEffect(() => {
    if (!token) {
      toast.error("No token found. Redirecting...");
      navigate("/dashboard");
      return;
    }

    getDetails();

    const ws = new WebSocket('ws://localhost:3001');
    setSocket(ws);

    ws.onopen = () => {
      // Send AUTH payload on connection
      ws.send(JSON.stringify({ type: "AUTH", token }));
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        // Auth success
        if (data.type === "AUTH_OK") {
          toast.success("Connected to chat server!");
          setIsAuthed(true);
          return;
        }

        // Message history from DB
        if (data.replay && data.content) {
          setMessages(prev => [data.content, ...prev]);
          return;
        }

        // New incoming messages
        if (data.content) {
          setMessages(prev => [...prev, data.content]);
        }

      } catch (err) {
        console.error("Failed to parse WS message", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WS error", err);
    };

    ws.onclose = () => {
      console.log("WS closed");
      setIsAuthed(false);
    };

    return () => ws.close();
  }, [token, navigate]);

  /* ------------------ AUTO SCROLL ------------------ */
  useEffect(() => {
    endMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ------------------ ESC TO CLOSE EMOJI ------------------ */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowEmoji(false);
        inputRef.current?.focus();
      }
    }
    if (showEmoji) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showEmoji]);

  /* ------------------ CLICK OUTSIDE EMOJI ------------------ */
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    }
    if (showEmoji) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showEmoji]);

  /* ------------------ SEND MESSAGE ------------------ */
  function sendMessage() {
    if (!isAuthed) {
      toast.error("Still connecting to server...");
      return;
    }

    if (!message.trim() || !socket || socket.readyState !== WebSocket.OPEN) return;

    const payload = {
      type: "MESSAGE",
      content: message
    };

    socket.send(JSON.stringify(payload));
    setMessage('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  }

  /* ------------------ LEAVE ROOM ------------------ */
  async function leaveRoom() {
    try {
      const response = await axios.get(`${baseURL}/room/${details?.roomCode}/leave`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 200) {
        toast.success("You left the chat");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("Failed to leave room");
      navigate("/dashboard");
    }
  }

  /* ------------------ LOADING STATE ------------------ */
  if (!details) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading chat...
      </div>
    );
  }

  /* ------------------ RENDER ------------------ */
  return (
    <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center p-3">
      <div className="flex flex-col gap-3 max-w-xl w-full h-[90vh] bg-white rounded-lg border p-4">

        {/* ------------------ ROOM HEADER ------------------ */}
        <div className="h-12 flex items-center justify-between bg-zinc-200 rounded-md px-4">
          {/* Left: Icon + Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-lg">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-mono font-semibold whitespace-nowrap">
              {details.title || "Ping Room"}
            </h1>
          </div>

          {/* Right: Room Code + User Menu */}
          <div className="flex items-center gap-3">

            {/* Room Code */}
            <div className="flex items-center justify-center bg-gray-800 text-zinc-50 rounded px-5 py-1 whitespace-nowrap">
              Room Code: <span className="font-bold">{details.roomCode}</span>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenUserMenu(v => !v)}
                className="w-10 h-6 rounded-md flex justify-center items-center hover:bg-black hover:text-white transition"
              >
                <UserRound className="w-5 h-5" />
              </button>

              {openUserMenu && (
                <div className="absolute right-0 top-8 w-48 rounded-md bg-white border shadow-md z-50">

                  {/* Participants toggle */}
                  <button
                    onClick={() => setOpenParticipantMenu(v => !v)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 flex justify-between items-center"
                  >
                    Participants
                    <span className="text-xs">{details.participants?.length ?? 0}</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>

                  {/* Participants list */}
                  {openParticipantMenu && details.participants && details.participants.length > 0 && (
                    <div className="border-t">
                      {details.participants.map((p, i) => (
                        <div key={i} className="px-4 py-2 text-sm hover:bg-zinc-100 whitespace-nowrap">
                          {p.user.name}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Leave Room */}
                  <button
                    onClick={leaveRoom}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-zinc-100"
                  >
                    Leave Room
                  </button>

                </div>
              )}
            </div>

          </div>
        </div>

        {/* ------------------ CHAT MESSAGES ------------------ */}
        <div className="flex-1 overflow-y-auto bg-zinc-200 rounded-xl p-3 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className="bg-white px-3 py-2 rounded-lg text-sm w-fit max-w-[80%]">
              {msg}
            </div>
          ))}
          <div ref={endMessageRef} />
        </div>

        {/* ------------------ INPUT BAR ------------------ */}
        <div className="relative flex items-center gap-2 px-2 py-1 border border-zinc-300 rounded-xl h-14">

          {/* Emoji Button */}
          <button onClick={() => setShowEmoji(v => !v)} className="text-xl">
            <Smile />
          </button>

          {showEmoji && (
            <div ref={emojiRef} className="absolute bottom-16 left-2 z-50">
              <EmojiPicker
                lazyLoadEmojis
                onEmojiClick={(e) => {
                  setMessage(prev => prev + e.emoji);
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
              />
            </div>
          )}

          {/* Input */}
          <input
            ref={inputRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="flex-1 h-10 px-3 rounded-lg border border-zinc-300 outline-none"
            autoFocus
          />

          {/* Send Button */}
          <button
            onClick={sendMessage}
            className="px-4 h-10 bg-green-400 rounded-lg font-medium hover:bg-green-500 transition"
          >
            Send
          </button>

        </div>
      </div>
    </div>
  );
}

export default ChatPage;