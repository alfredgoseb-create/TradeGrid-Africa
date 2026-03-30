"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      router.push("/")
    }
  }

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Check your email for confirmation")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Login</h1>

      <input
        type="email"
        placeholder="Email"
        className="border p-2 w-64"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-64"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 w-64"
      >
        Login
      </button>

      <button
        onClick={handleSignup}
        className="bg-green-500 text-white px-4 py-2 w-64"
      >
        Sign Up
      </button>
    </div>
  )
}