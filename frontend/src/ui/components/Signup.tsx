import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { MessageCircleMore } from "lucide-react";

const baseURL = "http://localhost:3000/api/v1"

interface SignupProp {
  type: "signup" | "signin";
}

function SignupComponent({ type }: SignupProp) {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function handleSubmit() {
    try {
      const response = await axios.post(
        `${baseURL}/user/signup`,
        { name, email, password }
      );
      const token = response.data.token;
      localStorage.setItem("token", token);
      toast.success("User successfully created");
      setTimeout(() =>{
        navigate("/dashboard");
      }, 2000)
    } catch (error) {
      console.log(error);
      toast.error(`${error}`);
    }
  }

  async function handleSignin() {
    try {
      const response = await axios.post(
        `${baseURL}/user/login`,
        { email, password }
      );
      const token = response.data.token;
      localStorage.setItem("token", token);
      toast.success("User successfully logged in");
      setTimeout(() =>{
        navigate("/dashboard");
      }, 2000)
    } catch (error) {
      console.log(error);
      toast.error(`${error}`);
    }
  }

  return (
    <div className="min-h-dvh w-full bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl rounded-3xl bg-white flex overflow-hidden shadow-2xl">
        <Toaster position="top-center" richColors />

        <div className="hidden md:block md:w-1/2 bg-neutral-100">
          <img
            src="/signup.jpeg"
            alt="Authentication illustration"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center px-10 py-12">
          <div className="mb-4 text-center">
            <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-purple-600 to-purple-500 text-white shadow-md">
                <MessageCircleMore className="h-5 w-5" />
                </div>
                <span className="text-2xl font-semibold text-gray-900">
                Ping<span className="text-purple-600">Room</span>
                </span>
            </div>
            </div>

            <h3 className="text-2xl font-semibold tracking-wide text-gray-900">
              {type === "signup"
                ? "Create your account"
                : "Welcome back"}
            </h3>

            <p className="mt-1 text-lg text-gray-500 ">
              {type === "signup"
                ? "Get started in less than a minute."
                : "Log in to continue to Ping Room."}
            </p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            type === "signup" ? handleSubmit() : handleSignin();
          }} className="space-y-2">
            {type === "signup" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <input
                  type="text"
                  placeholder="Ronak Maheshwari"
                  autoFocus
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-600/20 transition"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                placeholder="ronak@gmail.com"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-600/20 transition"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-600/20 transition"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              onClick={() =>
                type === "signup" ? handleSubmit() : handleSignin()
              }
              className="mt-2 w-full rounded-xl bg-purple-600 py-3 text-base font-semibold text-white hover:bg-purple-700 transition"
            >
              {type === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            {type === "signup"
              ? "Already have an account? "
              : "Don’t have an account? "}
            <button
              className="font-semibold text-purple-600 hover:text-purple-700 transition"
              onClick={() =>
                type === "signup"
                  ? navigate("/login")
                  : navigate("/signup")
              }
            >
              {type === "signup" ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupComponent;