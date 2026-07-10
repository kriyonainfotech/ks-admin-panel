import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Mail,
    Phone,
    Calendar,
    Briefcase,
    IndianRupee,
    MapPin,
    Shield,
    Clock,
    AppWindow,
    FileText,
    Building2
} from "lucide-react";
import { Team } from "@/lib/teamdata";

interface TeamSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Team | null;
}

export function TeamSheet({ open, onOpenChange, member }: TeamSheetProps) {
    if (!member) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatCurrency = (amount?: number, currency?: string) => {
        if (!amount) return "N/A";
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader className="mb-0 mt-6 space-y-1">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-xl">Team Member Details</SheetTitle>
                        <Badge variant={member.isActive ? "default" : "destructive"}>
                            {member.isActive ? "Active Account" : "Inactive Account"}
                        </Badge>
                    </div>
                    <SheetDescription>
                        Complete profile information for {member.name}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mb-2">
                    {/* Header Section */}
                    <div className="flex items-start gap-4 p-4 rounded-xl border bg-card/50">
                        <Avatar className="h-15 w-15 border-2 border-primary/10">
                            {/* <AvatarImage src={member.avatarUrl} /> */}
                            <AvatarFallback className="text-2xl bg-primary/5 text-primary font-semibold">
                                {member.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 space-y-1">
                            <h2 className="text-xl font-bold truncate">{member.name}</h2>
                            <p className="text-sm font-medium text-primary bg-primary/5 inline-block border-1 border-primary/20 rounded-full px-2 py-0.5">
                                {(() => {
                                    const role = member.profile.specialization;
                                    if (role === 'design') return 'Designer';
                                    if (role === 'video') return 'Video Editor';
                                    if (role === 'marketing') return 'Marketing';
                                    if (role === 'web') return 'Web Developer';
                                    return role;
                                })()}
                            </p>
                        </div>
                    </div>

                    {/* Contact & Personal Info */}
                    <div className="grid gap-1 px-6">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <UserCardIcon className="h-4 w-4" /> Personal & Contact
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <InfoItem icon={Mail} label="Email" value={member.email} />
                            <InfoItem icon={Phone} label="Phone" value={member.phone} />
                            <InfoItem
                                icon={MapPin}
                                label="Address"
                                value={member.profile.address ? (
                                    <>
                                        {member.profile.address.street}<br />
                                        {member.profile.address.city}, {member.profile.address.state}<br />
                                        {member.profile.address.country}
                                    </>
                                ) : undefined}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Professional Details */}
                    <div className="grid gap-1 px-6">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Professional Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <InfoItem icon={Briefcase} label="Experience" value={member.profile.experience} />
                            <InfoItem
                                icon={IndianRupee}
                                label="Salary"
                                value={formatCurrency(member.profile.salary?.amount, member.profile.salary?.currency)}
                            />
                            <InfoItem
                                icon={Calendar}
                                label="Joined Date"
                                value={formatDate(member.profile.joinedDate)}
                            />
                            {/* <InfoItem
                                icon={Shield}
                                label="Role Permissions"
                                value={
                                    member.customPermissions && member.customPermissions.length > 0 ? (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {member.customPermissions.map(perm => (
                                                <Badge key={perm} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                                    {perm}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : "Standard Access"
                                }
                            /> */}
                        </div>
                    </div>

                    <Separator />

                    {/* Timing & Bank Details */}
                    <div className="grid gap-1 px-6">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Timing & Bank Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <InfoItem icon={Clock} label="Shift Hours" value={`${member.profile.timing?.start || "9:00 AM"} - ${member.profile.timing?.end || "7:00 PM"}`} />
                            <InfoItem icon={Building2} label="Bank Name" value={member.profile.bankInfo?.bankName || "N/A"} />
                            <InfoItem icon={FileText} label="Account Number" value={member.profile.bankInfo?.accountNumber || "N/A"} />
                            <InfoItem icon={Shield} label="IFSC Code" value={member.profile.bankInfo?.ifscCode || "N/A"} />
                        </div>
                    </div>

                    <Separator />

                    {/* Emergency Contacts */}
                    <div className="grid gap-1 px-6">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Phone className="h-4 w-4" /> Emergency Contacts
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground font-medium uppercase">Primary Contact</span>
                                <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                    <p className="font-medium">{member.profile.emergencyContact1?.name || "N/A"}</p>
                                    <p className="text-muted-foreground">{member.profile.emergencyContact1?.phone || "N/A"}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground font-medium uppercase">Secondary Contact</span>
                                <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                    <p className="font-medium">{member.profile.emergencyContact2?.name || "N/A"}</p>
                                    <p className="text-muted-foreground">{member.profile.emergencyContact2?.phone || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Skills & Notes */}
                    <div className="grid gap-4 sm:grid-cols-2 px-6">
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <AppWindow className="h-4 w-4" /> Skills
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {member.profile.skills && member.profile.skills.length > 0 ? (
                                    member.profile.skills.map((skill, index) => (
                                        <Badge key={index} variant="outline" className="font-normal text-xs bg-background">
                                            {skill}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground text-sm italic">No skills listed</span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Notes
                            </h3>
                            <div className="p-3 rounded-md bg-muted/30 text-sm min-h-[80px]">
                                {/* Accessing type as per interface, slightly unsafe if runtime differs */}
                                {member.profile.notes && (member.profile.notes as any).type
                                    ? (member.profile.notes as any).type
                                    : "No notes available"}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* System Info */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground py-3 px-6">
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            <span>Created: {formatDate(member.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            <span>Updated: {formatDate(member.updatedAt)}</span>
                        </div>
                    </div>

                    <Separator />
                </div>
            </SheetContent>
        </Sheet>
    );
}

// Helper component for consistent grid items
function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 rounded-md bg-primary/5 text-primary shrink-0">
                <Icon className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground uppercase">{label}</p>
                <div className="text-sm font-medium leading-normal">{value || "N/A"}</div>
            </div>
        </div>
    );
}

function UserCardIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
