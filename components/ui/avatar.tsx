"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  role?: "Superadmin" | "Admin" | "Team" | "Client" | "User";
}

const ROLE_COLORS = {
  Superadmin: "#EF4444", // Red
  Admin: "#F97316",      // Orange
  Team: "#3B82F6",       // Blue
  Client: "#10B981",     // Green (Extra)
  User: "#64748B",       // Slate (Extra)
};

function Avatar({
  className,
  role,
  ...props
}: AvatarProps) {
  const ringColor = role ? ROLE_COLORS[role] : null;

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        ringColor ? "border-[3px]" : "",
        className
      )}
      style={ringColor ? { borderColor: ringColor, borderStyle: 'solid' } : {}}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
