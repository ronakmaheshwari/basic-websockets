import axios, { AxiosError } from "axios";
import {
  Contact,
  MessageCircleMore,
  UserRoundPlus,
  PlusCircle,
  LogIn,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";

type Mode = "create" | "join";
const baseURL = "http://localhost:3000/api/v1"

function Dashboard() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("create");
  const [title, setTitle] = useState<string>("");
  const [max, setMax] = useState<number>(2);
  const [roomCode, setRoomCode] = useState<string>("");
  const token = localStorage.getItem("token");

  const handleCreate = async () => {
    if (!title || max < 2) {
      toast.error("Please enter valid room details");
      return;
    }

    try {
      const { data } = await axios.post(
        `${baseURL}/room/create`,
        { title, max },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem("roomToken", data.token);
      toast.success("Room created successfully");
      navigate("/chat");
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to create room");
    }
  };

  const handleJoin = async () => {
    if (!roomCode) {
      toast.error("Room code is required");
      return;
    }

    try {
      const { data } = await axios.post(
        `${baseURL}/room/join`,
        { roomCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem("roomToken", data.token);
      toast.success("Joined room successfully");
      navigate("/chat");
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to join room");
    }
  };

  return (
    <div className="min-h-dvh w-full bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl min-h-150 bg-white rounded-2xl shadow-xl border border-neutral-200 flex flex-col items-center p-6 gap-6">
        
        <Toaster position="top-center" richColors />
        <div className="w-full max-w-3xl h-16 rounded-xl bg-neutral-100 flex items-center justify-center gap-3 shadow-sm">
          <div className="h-9 w-9 rounded-full bg-purple-600 flex items-center justify-center">
            <MessageCircleMore className="h-5 w-5 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Ping<span className="text-purple-600">Room</span>
          </h1>
        </div>

        <div className="w-full max-w-3xl flex-1 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex flex-col gap-6">
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-neutral-900">
                {mode === "create" ? "Create a Room" : "Join a Room"}
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Start or join a conversation instantly
              </p>
            </div>

            {mode === "create" ? (
              <>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Contact className="h-4 w-4 text-neutral-600" />
                    <label className="text-sm font-medium text-neutral-700">
                      Room Name
                    </label>
                  </div>
                  <input
                    type="text"
                    minLength={5}
                    placeholder="Ronak Testing Room"
                    value={title}
                    onChange={(e) => {setTitle(e.target.value)}}
                    className="h-11 px-4 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <UserRoundPlus className="h-4 w-4 text-neutral-600" />
                    <label className="text-sm font-medium text-neutral-700">
                      Maximum Participants
                    </label>
                  </div>
                  <input
                    type="number"
                    min={2}
                    placeholder="5"
                    value={max}
                    onChange={(e) => {setMax(parseInt(e.target.value))}}
                    className="h-11 px-4 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition outline-none"
                  />
                  <span className="text-xs text-neutral-500">
                    Minimum 2 participants required
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Contact className="h-4 w-4 text-neutral-600" />
                  <label className="text-sm font-medium text-neutral-700">
                    Room Code
                  </label>
                </div>
                <input
                  type="text"
                  minLength={5}
                  placeholder="RONAKO"
                  value={roomCode}
                  onChange={(e) => {setRoomCode(e.target.value)}}
                  className="h-11 px-4 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition outline-none"
                />
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              {mode === "create" ? (
                <>
                  <button onClick={handleCreate} className="h-11 w-full rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Create Room
                  </button>

                  <button
                    onClick={() => setMode("join")}
                    className="h-11 w-full rounded-lg border border-purple-600 text-purple-600 font-medium hover:bg-purple-50 transition flex items-center justify-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Join Instead
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleJoin} className="h-11 w-full rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Join Room
                  </button>

                  <button
                    onClick={() => setMode("create")}
                    className="h-11 w-full rounded-lg border border-purple-600 text-purple-600 font-medium hover:bg-purple-50 transition"
                  >
                    Create Instead
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;