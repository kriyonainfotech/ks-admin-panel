"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/panel-login`, { email, password });
      try {
        login(data.token, data.user);
      } catch (authErr) {
        console.error("❌ Error in AuthContext.login:", authErr);
      }

      // Redirect to admin dashboard
      if (data.user?.role === "Admin" || data.user?.role === "Superadmin") {
        window.location.href = "/admin";
      } else if (data.user?.role === "Team") {
        window.location.href = "/team";
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* --- Aesthetic Background Elements --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[400px] rounded-full bg-primary/25 blur-[120px] animate-floating" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-floating-reverse" />
        <div className="absolute top-[20%] right-[15%] h-[300px] w-[300px] rounded-full bg-primary/15 blur-[100px] animate-floating-slow" />
      </div>

      {/* --- Login Card --- */}
      <Card className="relative z-10 w-full max-w-[420px]">
        <CardHeader className="space-y-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-primary/10 ring-1 ring-primary/20 shadow-inner transition-transform hover:scale-105 duration-300">
              <Image
                src="/logo.svg"
                width={100}
                height={100}
                alt="Kriyona Studio Logo"
                className="object-contain p-4"
                priority
              />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground font-nunito bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
              Kriyona Studio
            </CardTitle>
            <CardDescription className="text-muted-foreground/80 font-medium tracking-wide">
              Sign in to manage your Admin Panel
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="admin@example.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full font-semibold rounded-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="absolute bottom-6 z-10 text-center text-xs font-medium tracking-widest text-muted-foreground/50 uppercase">
        © 2025 Admin Panel • Secure Access
      </div>
    </div>
  );
}
