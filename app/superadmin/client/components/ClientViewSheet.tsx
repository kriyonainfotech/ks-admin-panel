

import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, Phone, Mail, MapPin, Globe, Calendar, User, CreditCard, Building2 } from "lucide-react";
import { Team } from "@/lib/teamdata";
import { Client } from "@/lib/clientdata";

interface ClientViewSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: Client | null;
    teamMembers: Team[]; // To resolve IDs
    admins: any[]; // To resolve Admin ID
}

export function ClientViewSheet({ open, onOpenChange, client, teamMembers, admins }: ClientViewSheetProps) {
    if (!client) return null;

    // Resolve Assigned Team Members
    const assignedTeam = teamMembers.filter(m => client.assignedTeamIds?.includes(m._id));

    // Resolve Assigned Admin
    const assignedAdmin = admins.find(a => a._id === client.assignedAdminId);

    // Resolve Active Subscription
    const activeSub = client.subscriptions?.find(sub => sub.status === "Active");

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[540px] overflow-y-auto sm:max-w-md">
                <SheetHeader className="pb-4 border-b">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2">
                        <div>
                            <SheetTitle className="text-xl">Client Profile</SheetTitle>
                            <SheetDescription>Detailed information for {client.businessName}</SheetDescription>
                        </div>
                        <Badge variant={client.status === "Active" ? "default" : "secondary"}>
                            {client.status}
                        </Badge>
                    </div>
                </SheetHeader>

                <div className="py-6 space-y-6 px-6">
                    {/* 1. Profile Header */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/10">
                            <AvatarImage src={client.avatarUrl} />
                            <AvatarFallback className="text-xl bg-primary/5 text-primary">
                                {client.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg leading-none">{client.name}</h3>
                            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-2"><Mail size={13} /> {client.email}</span>
                                <span className="flex items-center gap-2"><Phone size={13} /> {client.phone || "No phone"}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Business Details Grid */}
                    <Section title="Business Information" icon={<Building2 size={16} />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                            <InfoItem label="Business Name" value={client.businessName} />
                            <InfoItem label="Industry" value={client.industry} />
                            <InfoItem label="Business Email" value={client.businessEmail} />
                            <InfoItem label="Business Phone" value={client.businessPhone} />
                            <div className="col-span-2 space-y-1.5">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Globe size={12} /> Website
                                </span>
                                {client.website ? (
                                    <a href={client.website} target="_blank" rel="noreferrer" className="block text-blue-600 hover:underline truncate">
                                        {client.website}
                                    </a>
                                ) : <span className="text-muted-foreground">-</span>}
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin size={12} /> Address
                                </span>
                                <p className="text-foreground">
                                    {[client.businessAddress, client.city, client.state, client.country].filter(Boolean).join(", ") || "No address provided"}
                                </p>
                            </div>
                        </div>
                    </Section>

                    {/* 3. Subscription & Meta */}
                    <Section title="Subscription & Status" icon={<CreditCard size={16} />}>
                        {!activeSub ? (
                            <p className="text-sm text-muted-foreground">No active subscription</p>
                        ) : (
                            <div className="space-y-4 text-sm">

                                {/* Basic subscription info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InfoItem
                                        label="Current Package"
                                        value={activeSub.packageName}
                                        placeholder="None"
                                    />

                                    <InfoItem
                                        label="Subscription Status"
                                        value={activeSub.status}
                                        badge
                                    />

                                    <InfoItem
                                        label="Start Date"
                                        value={new Date(activeSub.startDate).toLocaleDateString()}
                                    />

                                    <InfoItem
                                        label="End Date"
                                        value={new Date(activeSub.endDate).toLocaleDateString()}
                                    />

                                    <InfoItem
                                        label="Total Services"
                                        value={activeSub.deliverables?.length?.toString()}
                                    />
                                </div>

                                {/* Deliverables list */}
                                <div className="space-y-2">
                                    <p className="font-medium text-sm">Deliverables</p>

                                    <div className="space-y-2">
                                        {activeSub.deliverables.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center border rounded-md px-3 py-2"
                                            >
                                                <div>
                                                    <p className="font-medium">{item.serviceName}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        Category: {item.serviceCategory}
                                                    </p>
                                                </div>

                                                <span className="text-sm font-semibold">
                                                    × {item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Section>

                    {/* 4. Social Credentials */}
                    <Section title="Social Credentials" icon={<Globe size={16} />}>
                        <div className="space-y-3">
                            {/* Facebook */}
                            <div className="bg-blue-50/50 border border-blue-100 rounded-md p-3">
                                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                                    <Facebook size={16} /> Facebook
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                    <InfoItem label="Facebook Id" value={client.socials?.facebookId} />
                                    <InfoItem label="Facebook Password" value={client.socials?.facebookPassword} />
                                </div>
                            </div>

                            {/* Instagram */}
                            <div className="bg-pink-50/50 border border-pink-100 rounded-md p-3">
                                <div className="flex items-center gap-2 text-pink-700 font-medium mb-2">
                                    <Instagram size={16} /> Instagram
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                    <InfoItem label="Instagram Id" value={client.socials?.instagramId} />
                                    <InfoItem label="Instagram Password" value={client.socials?.instagramPassword} />
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* 5. Assigned Admin & Team */}
                    <div className="space-y-6">
                        <Section title="Account Manager" icon={<User size={16} />}>
                            {assignedAdmin ? (
                                <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
                                    <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-base font-bold">
                                            {assignedAdmin.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold text-foreground truncate">{assignedAdmin.name}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Primary Account Manager</span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Mail size={10} className="text-primary/70" />
                                            <span className="text-[11px] text-primary font-medium truncate">{assignedAdmin.email}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 flex flex-col items-center justify-center text-center gap-1">
                                    <User size={20} className="text-muted-foreground/50" />
                                    <p className="text-xs text-muted-foreground italic font-medium">No account manager assigned.</p>
                                </div>
                            )}
                        </Section>

                        <Section title={`Production Team (${assignedTeam.length})`} icon={<TeamIcon size={16} />}>
                            {assignedTeam.length > 0 ? (
                                <div className="flex flex-wrap gap-2.5">
                                    {assignedTeam.map((member) => (
                                        <div 
                                            key={member._id} 
                                            className="flex items-center gap-2.5 p-1.5 pr-4 rounded-full bg-muted/40 border border-border group hover:bg-muted/80 hover:border-primary/20 transition-all cursor-default shadow-sm"
                                            title={`${member.name} (${member.role})`}
                                        >
                                            <Avatar className="h-7 w-7 border border-background shadow-inner">
                                                <AvatarFallback className="text-[10px] bg-background text-foreground font-bold">
                                                    {member.name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-semibold text-foreground leading-tight">{member.name}</span>
                                                <span className="text-[9px] text-muted-foreground uppercase tracking-tight">{member.role}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 flex flex-col items-center justify-center text-center gap-1">
                                    <TeamIcon size={20} />
                                    <p className="text-xs text-muted-foreground italic font-medium">No production team assigned.</p>
                                </div>
                            )}
                        </Section>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// Helper Components for Cleaner Code
function Section({ title, icon, children }: { title: string, icon?: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground/80 border-b pb-2">
                {icon} {title}
            </h4>
            {children}
        </div>
    );
}

function InfoItem({ label, value, placeholder = "-", badge, className }: { label: string, value?: string, placeholder?: string, badge?: boolean, className?: string }) {
    return (
        <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            {badge && value ? (
                <Badge variant="outline" className="font-normal text-xs">{value}</Badge>
            ) : (
                <p className={`text-sm font-medium text-foreground ${className}`}>{value || placeholder}</p>
            )}
        </div>
    );
}

function TeamIcon({ size }: { size?: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    )
}
