"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import { Loader2, Eye, EyeOff, Mail } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { robotoSlab } from "@/lib/fonts";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);

export default function LoginPage() {
  const [forgotStep, setForgotStep] = useState<"email" | "otp">("email");
  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showSecretModal, setShowSecretModal] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent, isSecretSubmission = false) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const payload: any = { email, password };
      if (isSecretSubmission) {
        payload.secretKey = secretKey;
      }

      const { data } = await axios.post(`${API_URL}/api/auth/panel-login`, payload);

      console.log(data);

      if (data.requireSecretKey) {
        setShowSecretModal(true);
        setIsLoading(false);
        return;
      }

      // Save token + user in global auth provider
      login(data.token, data.user);

      // Redirect based on role
      if (data.user.role === "Superadmin") {
        router.push("/superadmin");
      } else if (data.user.role === "Team") {
        router.push("/team");
      } else {
        alert("You do not have permission to access this panel.");
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
        {/* Main Brand Blobs */}
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[400px] rounded-full bg-primary/25 blur-[120px] animate-floating" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-floating-reverse" />

        {/* Decorative Floating Patches */}
        <div className="absolute top-[20%] right-[15%] h-[300px] w-[300px] rounded-full bg-primary/15 blur-[100px] animate-floating-slow" />
        <div className="absolute bottom-[30%] left-[10%] h-[250px] w-[250px] rounded-full bg-primary/10 blur-[80px] animate-floating" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[150px] animate-floating-reverse" />
        <div className="absolute top-[10%] left-1/2 h-[200px] w-[200px] rounded-full bg-primary/20 blur-[90px] animate-floating-slow" />

        {/* Subtle Contrast patches */}
        <div className="absolute bottom-[20%] right-[40%] h-[150px] w-[150px] rounded-full bg-blue-500/5 blur-[80px] animate-floating" />
      </div>

      {/* --- Login Card --- */}
      <Card className="relative z-10 w-full max-w-[420px]">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Image
                src="/logo.svg"
                alt="Kriyona Studio Logo"
                fill
                className="object-contain p-3"
              />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className={`text-3xl font-bold tracking-tight text-foreground font-nunito`}>
              Kriyona Studio
            </CardTitle>
            <CardDescription className="text-muted-foreground/80 font-medium tracking-wide">
              Access your dashboard to manage your studio
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
                  placeholder="name@kriyona.com"
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
                    autoComplete="current-password"
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

      {/* --- Secret Key Modal --- */}
      <Dialog open={showSecretModal} onOpenChange={setShowSecretModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Secret Key Required</DialogTitle>
            <DialogDescription>
              Please enter the 6-digit secret key to verify your Superadmin access.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                // placeholder="DDHHMM"
                maxLength={6}
                autoComplete="off"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin(null as any, true);
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSecretModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleLogin(null as any, true)}
              disabled={isLoading || secretKey.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying
                </>
              ) : (
                "Verify & Login"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="absolute bottom-6 z-10 text-center text-xs font-medium tracking-widest text-muted-foreground/50 uppercase">
        © 2025 Kriyona Studio • Designed for Creativity
      </div>
    </div>
  );
}
