import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Building2, MapPin, Phone, Shield, User, Mail, ShieldCheck } from "lucide-react";

interface AdminViewSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    admin: any | null;
}

const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100/80 group">
        <div className="p-2 rounded-md bg-white border border-slate-200 text-slate-500 group-hover:text-primary group-hover:border-primary/30 shadow-sm transition-colors">
            <Icon size={16} />
        </div>
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                {label}
            </span>
            <span className="text-sm font-semibold text-slate-700 leading-tight">
                {value || "Not provided"}
            </span>
        </div>
    </div>
);

export function AdminViewSheet({ open, onOpenChange, admin }: AdminViewSheetProps) {
    if (!admin) return null;

    const isSuperAdmin = admin.role === "Superadmin";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l-0 shadow-2xl p-0 scrollbar-hide">
                <div className="relative">
                    {/* Top Decorative Banner */}
                    <div className="h-30 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent flex items-end px-6 pb-4">
                        <div className="relative translate-y-12">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-2xl">
                                <AvatarImage src={admin.profilePic?.url} />
                                <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-bold">
                                    {admin.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            {isSuperAdmin && (
                                <div className="absolute bottom-1 right-1 p-1 bg-primary rounded-full border-2 border-background shadow-lg">
                                    <ShieldCheck size={16} className="text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className="px-6 pt-16 pb-12 space-y-8">
                        {/* Header Info */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                    {admin.name}
                                </h2>
                                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    {admin.email}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="px-3 py-1 bg-primary/5 border-primary/20 text-primary font-semibold flex gap-1.5 items-center">
                                    <User size={12} /> {admin.role}
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className={`px-3 py-1 border font-semibold flex gap-1.5 items-center ${admin.status === "Active"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-red-50 text-red-700 border-red-200"
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${admin.status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
                                    {admin.status}
                                </Badge>
                            </div>
                        </div>

                        <Separator className="opacity-50" />

                        {/* Sections Grid */}
                        <div className="grid gap-8">
                            {/* Core Contact Section */}
                            <section className="space-y-4">
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Mail size={14} className="text-slate-400" />
                                    Identity & Communication
                                </h4>
                                <div className="grid gap-3">
                                    <InfoItem label="Legal Name" value={admin.name} icon={User} />
                                    <InfoItem label="Official Email" value={admin.email} icon={Mail} />
                                    <InfoItem label="Phone Connection" value={admin.phone} icon={Phone} />
                                </div>
                            </section>

                            {!isSuperAdmin && (
                                <>
                                    <Separator className="opacity-50" />

                                    {/* Workplace Section - Only for Admins */}
                                    <section className="space-y-4">
                                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Clock size={14} className="text-slate-400" />
                                            Professional Timing
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <InfoItem label="Shift Start" value={admin.profile?.timing?.start || "9:00 AM"} icon={Clock} />
                                            <InfoItem label="Shift End" value={admin.profile?.timing?.end || "7:00 PM"} icon={Clock} />
                                        </div>
                                        <InfoItem label="Specialization" value={admin.profile?.specialization} icon={Building2} />
                                    </section>

                                    <Separator className="opacity-50" />

                                    {/* Financial Section - Only for Admins */}
                                    <section className="space-y-4">
                                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Shield size={14} className="text-slate-400" />
                                            Financial & Banking
                                        </h4>
                                        <div className="grid gap-3">
                                            <InfoItem label="Bank Account Name" value={admin.profile?.bankInfo?.bankName} icon={Building2} />
                                            <div className="grid grid-cols-2 gap-3">
                                                <InfoItem label="Account No." value={admin.profile?.bankInfo?.accountNumber} icon={Shield} />
                                                <InfoItem label="IFSC Code" value={admin.profile?.bankInfo?.ifscCode} icon={ShieldCheck} />
                                            </div>
                                        </div>
                                    </section>

                                    <Separator className="opacity-50" />

                                    {/* Address Section - Only for Admins */}
                                    <section className="space-y-4 pb-4">
                                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <MapPin size={14} className="text-slate-400" />
                                            Physical Address
                                        </h4>
                                        <InfoItem
                                            label="Live Location"
                                            value={`${admin.profile?.address?.street || ""}, ${admin.profile?.address?.city || ""}, ${admin.profile?.address?.state || ""}`}
                                            icon={MapPin}
                                        />
                                    </section>
                                </>
                            )}

                            {isSuperAdmin && (
                                <div className="p-5 rounded-2xl bg-primary/[0.03] border border-primary/10 flex flex-col items-center text-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <ShieldCheck className="w-5 h-5 text-primary" />
                                    </div>
                                    <p className="text-xs leading-relaxed text-slate-500 font-medium max-w-[240px]">
                                        This account holds Superadmin privileges. Specialized profile data like banking or shifts are restricted for security.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}