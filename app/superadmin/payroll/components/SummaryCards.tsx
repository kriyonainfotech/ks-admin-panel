"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, CheckCircle2, Calendar } from "lucide-react";

interface SummaryCardsProps {
    stats: {
        totalPayroll: number;
        accruedTillDate: number;
        disbursed: number;
        workingDaysCount: number;
    } | null;
    isLoading: boolean;
}

export function SummaryCards({ stats, isLoading }: SummaryCardsProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    const cards = [
        {
            title: "Total Payroll",
            value: stats?.totalPayroll || 0,
            isCurrency: true,
            icon: Wallet,
            color: "text-blue-600",
            bg: "bg-blue-50",
            description: "Fixed monthly commitment"
        },
        {
            title: "Working Days",
            value: stats?.workingDaysCount || 0,
            isCurrency: false,
            icon: Calendar,
            color: "text-purple-600",
            bg: "bg-purple-50",
            description: "Excluding Sundays"
        },
        {
            title: "Accrued Till Date",
            value: stats?.accruedTillDate || 0,
            isCurrency: true,
            icon: TrendingUp,
            color: "text-amber-600",
            bg: "bg-amber-50",
            description: "Live balance earned by team"
        },
        {
            title: "Total Paid",
            value: stats?.disbursed || 0,
            isCurrency: true,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            description: "Salary disbursed via expenses"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card, i) => (
                <Card key={i} className="rounded-xl border bg-card py-0 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center gap-4">
                            <div className="space-y-0.5">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{card.title}</p>
                                {isLoading ? (
                                    <div className="h-7 w-24 bg-muted animate-pulse rounded" />
                                ) : (
                                    <h2 className={`text-xl font-black ${card.color}`}>
                                        {card.isCurrency ? formatCurrency(card.value as number) : card.value}
                                        {!card.isCurrency && <span className="text-xs ml-1 font-bold text-muted-foreground">Days</span>}
                                    </h2>
                                )}
                                <p className="text-[10px] text-muted-foreground font-medium italic opacity-70">{card.description}</p>
                            </div>
                            <div className={`shrink-0 p-2 rounded-lg ${card.bg} ${card.color}`}>
                                <card.icon className="h-4 w-4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
