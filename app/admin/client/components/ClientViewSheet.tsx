"use client";

import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, Phone, Mail, MapPin, Globe, CreditCard, Building2, User } from "lucide-react";
import { Team } from "@/lib/teamdata";
import { Client } from "@/lib/clientdata";

interface ClientViewSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: Client | null;
    teamMembers: Team[]; 
}

export function ClientViewSheet({ open, onOpenChange, client, teamMembers }: ClientViewSheetProps) {
    if (!client) return null;

    const assignedTeam = teamMembers.filter(m => client.assignedTeamIds?.includes(m._id));
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

                    <Section title="Business Information" icon={<Building2 size={16} />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                            <InfoItem label="Business Name" value={client.businessName} />
                            <InfoItem label="Industry" value={client.industry} />
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

                    <Section title={`Production Team (${assignedTeam.length})`} icon={<User size={16} />}>
                        {assignedTeam.length > 0 ? (
                            <div className="flex flex-wrap gap-2.5">
                                {assignedTeam.map((member) => (
                                    <div 
                                        key={member._id} 
                                        className="flex items-center gap-2.5 p-1.5 pr-4 rounded-full bg-muted/40 border border-border group hover:bg-muted transition-all cursor-default"
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
                                <User size={20} className="text-muted-foreground/50" />
                                <p className="text-xs text-muted-foreground italic font-medium">No production team assigned.</p>
                            </div>
                        )}
                    </Section>
                </div>
            </SheetContent>
        </Sheet>
    );
}

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

function InfoItem({ label, value, placeholder = "-" }: { label: string, value?: string, placeholder?: string }) {
    return (
        <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">{value || placeholder}</p>
        </div>
    );
}
