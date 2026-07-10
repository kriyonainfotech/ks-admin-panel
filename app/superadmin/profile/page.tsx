"use client";

import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { updateUserProfile, removeProfilePic } from "@/src/redux/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Camera, Mail, Pencil, Save, X, Loader2, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                email: user.email,
                phone: user.phone,
            });
        }
    }, [user, reset]);

    // Clear preview when user data changes (after successful upload/remove)
    useEffect(() => {
        setPreviewUrl(null);
    }, [user?.profilePic]);

    // --- Profile form save ---
    const onSaveProfile = async (data: any) => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("phone", data.phone);

            await dispatch(updateUserProfile(formData)).unwrap();
            toast.success("Profile updated successfully");
            setIsEditing(false);
        } catch (error: any) {
            toast.error(error || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        reset({
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
        });
        setIsEditing(false);
    };

    // --- Avatar upload ---
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side file size check (5MB max)
        const MAX_SIZE_MB = 5;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
        if (file.size > MAX_SIZE_BYTES) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
            toast.error(`File is too large (${fileSizeMB}MB). Maximum allowed size is ${MAX_SIZE_MB}MB.`);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        // Show local preview immediately
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("profilePic", file);
            await dispatch(updateUserProfile(formData)).unwrap();
            toast.success("Profile picture updated");
        } catch (error: any) {
            toast.error(error || "Failed to upload image");
            setPreviewUrl(null);
        } finally {
            setIsUploading(false);
            URL.revokeObjectURL(localUrl);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // --- Remove profile pic ---
    const handleRemovePhoto = async () => {
        setIsRemoving(true);
        try {
            await dispatch(removeProfilePic()).unwrap();
            toast.success("Profile picture removed");
            setPreviewUrl(null);
        } catch (error: any) {
            toast.error(error || "Failed to remove profile picture");
        } finally {
            setIsRemoving(false);
        }
    };

    if (!user) return <div className="p-10 text-center">Loading profile...</div>;

    const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase();
    const avatarSrc = previewUrl || user.profilePic?.url || "";
    const hasProfilePic = !!(previewUrl || user.profilePic?.url);

    return (
        <div className="flex flex-col gap-6 p-6 max-w-full">
            <div>
                <h1 className="text-2xl font-bold">Profile Settings</h1>
                <p className="text-muted-foreground text-sm">Manage your personal information and profile picture.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* LEFT COLUMN: IDENTITY CARD */}
                <Card className="md:col-span-1 h-fit">
                    <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                        <div className="relative group">
                            <Avatar role={user.role as any} className="h-28 w-28 border-4 border-muted/50">
                                <AvatarImage src={avatarSrc || undefined} />
                                <AvatarFallback className="text-3xl bg-primary/10 text-primary">{initials}</AvatarFallback>
                            </Avatar>

                            {/* Overlay on avatar hover */}
                            <div
                                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={handleAvatarClick}
                            >
                                {isUploading ? (
                                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                                ) : (
                                    <Camera className="h-6 w-6 text-white" />
                                )}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Upload / Remove Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-xs"
                                onClick={handleAvatarClick}
                                disabled={isUploading || isRemoving}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-3.5 w-3.5" />
                                        Upload Photo
                                    </>
                                )}
                            </Button>

                            {hasProfilePic && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={handleRemovePhoto}
                                    disabled={isUploading || isRemoving}
                                >
                                    {isRemoving ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                    Remove
                                </Button>
                            )}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">{user.name}</h2>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200 shadow-none">
                                    {user.role}
                                </Badge>
                            </div>
                        </div>

                        <div className="w-full space-y-2 text-sm text-muted-foreground pt-2">
                            <div className="flex items-center gap-2">
                                <Mail size={14} /> {user.email}
                            </div>
                        </div>
                        <Separator />
                    </CardContent>
                </Card>

                {/* RIGHT COLUMN: GENERAL FORM */}
                <div className="md:col-span-3">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>
                                        {isEditing ? "Edit your details and click Save." : "Click Edit to modify your details."}
                                    </CardDescription>
                                </div>
                                {!isEditing && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form id="profile-form" onSubmit={handleSubmit(onSaveProfile)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        {...register("name")}
                                        disabled={!isEditing}
                                        className={!isEditing ? "bg-muted/50" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input {...register("email")} disabled className="bg-muted/50" />
                                    <p className="text-[10px] text-muted-foreground">Email cannot be changed manually.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input
                                        {...register("phone", {
                                            required: "Phone number is required",
                                            pattern: {
                                                value: /^[0-9]{10}$/,
                                                message: "Please enter exactly 10 digits"
                                            }
                                        })}
                                        type="tel"
                                        maxLength={10}
                                        placeholder="9876543210"
                                        disabled={!isEditing}
                                        className={!isEditing ? "bg-muted/50" : ""}
                                    />
                                    {errors.phone && <p className="text-[10px] text-red-500 font-medium">{errors.phone.message as string}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Designation</Label>
                                    <Input value="Superadmin" disabled className="bg-muted/50" />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <Label>Bio / Notes</Label>
                                    <Textarea
                                        placeholder="A brief about yourself..."
                                        className={`resize-none ${!isEditing ? "bg-muted/50" : ""}`}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </form>
                        </CardContent>
                        {isEditing && (
                            <CardFooter className="justify-end gap-3 border-t pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    disabled={isSaving}
                                    className="gap-2"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    form="profile-form"
                                    disabled={isSaving}
                                    className="gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-3.5 w-3.5" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}