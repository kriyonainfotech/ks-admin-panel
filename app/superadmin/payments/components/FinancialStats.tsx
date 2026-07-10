"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet, Building2, User, Banknote, AlertOctagon, ArrowDownToLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialStatsProps {
    type: string; // "sales" | "collections" | "expenses"
    stats: any;
}

const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

export function FinancialStats({ type, stats }: FinancialStatsProps) {
    if (!stats) return <div className="h-32 bg-white animate-pulse rounded-xl border border-slate-200" />;

    // 1. SALES VIEW
    if (type === "sales") {
        return (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">

                <StatCard
                    icon={TrendingUp}
                    label="Total Sales"
                    amount={stats.totalSalesValue}
                    borderStyle="border-l-slate-900"
                    iconColor="text-slate-900"
                    iconBg="bg-slate-100"
                />

                <Card className="border-none shadow-sm bg-white border-l-4 border-l-emerald-500 h-[68px] md:h-[72px]">
                    <CardContent className="p-0 flex items-center h-full px-3 md:px-4 gap-2 md:gap-3">
                        <div className="flex flex-col justify-center flex-1">
                            <div className="flex justify-between items-center mb-0.5">
                                <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-tight">Collection</p>
                            </div>
                            <div className="text-lg md:text-xl font-black text-slate-900 leading-none mt-0.5">
                                {formatCurrency(stats.totalSalesCollected || 0)}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <StatCard
                    icon={AlertOctagon}
                    label="Outstanding"
                    amount={stats.totalPending}
                    borderStyle="border-l-red-600"
                    iconColor="text-red-600"
                    iconBg="bg-white/50"
                    cardBg="bg-red-50"
                    labelColor="text-red-800/60"
                    amountColor="text-red-700"
                />

                <StatCard
                    icon={ArrowDownToLine}
                    label="Loss"
                    amount={stats.totalSalesLoss || 0}
                    borderStyle="border-l-amber-500"
                    iconColor="text-amber-600"
                    iconBg="bg-amber-100/50"
                    cardBg="bg-amber-50/50"
                    labelColor="text-amber-800/70"
                    amountColor="text-amber-700"
                />
            </div>
        );
    }

    // 2. COLLECTIONS VIEW
    if (type === "collections") {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                    icon={Wallet}
                    label="Net Collection"
                    amount={stats.totalCollected}
                    borderStyle="border-l-emerald-600"
                    iconColor="text-emerald-600"
                    iconBg="bg-white/50"
                    cardBg="bg-emerald-50"
                    labelColor="text-emerald-800/60"
                    amountColor="text-emerald-700"
                />

                {/* <AccountCard icon={ArrowDownToLine} label="Direct Coll." amount={stats.totalDirectCollection || 0} color="text-amber-600" bg="bg-amber-50" /> */}
                <AccountCard icon={Building2} label="Company Acc" amount={stats.byAccount.company} color="text-blue-600" bg="bg-blue-50" />
                <AccountCard icon={User} label="Personal Acc" amount={stats.byAccount.personal} color="text-purple-600" bg="bg-purple-50" />
                <AccountCard icon={Banknote} label="Cash" amount={stats.byAccount.cash} color="text-emerald-600" bg="bg-emerald-50" />
            </div>
        );
    }

    // 3. EXPENSES VIEW
    if (type === "expenses") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <StatCard
                    icon={TrendingUp}
                    label="Total Outflow"
                    amount={stats.totalExpense}
                    borderStyle="border-l-red-600"
                    iconColor="text-red-600"
                    iconBg="bg-red-50"
                    amountColor="text-red-700"
                    iconClass="rotate-180"
                    shadow="shadow-md"
                />

                <Card className="border-none shadow-sm bg-white h-[68px] md:h-[72px] border-l-4 border-l-slate-400">
                    <CardContent className="p-0 flex items-center h-full px-3 md:px-4 gap-3 md:gap-4">
                        <div className="flex-1 flex flex-col justify-center">
                            <p className="text-[8px] md:text-[9px] text-muted-foreground font-bold uppercase tracking-[0.1em] leading-tight mb-1">Operational</p>
                            <div className="text-sm md:text-base font-black text-slate-900 leading-none">{formatCurrency(stats.totalOperational || 0)}</div>
                        </div>
                        <div className="h-8 w-px bg-slate-100" />
                        <div className="flex-1 flex flex-col justify-center">
                            <p className="text-[8px] md:text-[9px] text-muted-foreground font-bold uppercase tracking-[0.1em] leading-tight mb-1">Salary / Payout</p>
                            <div className="text-sm md:text-base font-black text-slate-900 leading-none">{formatCurrency(stats.totalSalary || 0)}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return null;
}

// Reusable Stat Card Component for consistency
function StatCard({ icon: Icon, label, amount, borderStyle, iconColor, iconBg, cardBg = "bg-white", labelColor = "text-muted-foreground", amountColor = "text-slate-900", iconClass = "", shadow = "shadow-sm" }: any) {
    return (
        <Card className={cn("border-none h-[68px] md:h-[72px] border-l-4 relative overflow-hidden", borderStyle, cardBg, shadow)}>
            <CardContent className="p-0 flex items-center h-full px-3 md:px-4 gap-2 md:gap-3">
                <div className={cn("flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg shrink-0", iconBg)}>
                    <Icon className={cn("h-4 w-4 md:h-5 md:w-5", iconColor, iconClass)} />
                </div>
                <div className="flex flex-col justify-center">
                    <p className={cn("text-[9px] md:text-[10px] font-bold uppercase tracking-wider leading-tight", labelColor)}>{label}</p>
                    <div className={cn("text-lg md:text-xl font-black leading-none mt-0.5", amountColor)}>{formatCurrency(amount)}</div>
                </div>
            </CardContent>
        </Card>
    );
}

// Compact Card for Collection Breakdown
function AccountCard({ icon: Icon, label, amount, color, bg }: any) {
    return (
        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow h-[68px] md:h-[72px]">
            <CardContent className="p-0 flex items-center h-full px-3 md:px-4 gap-2 md:gap-3">
                <div className={cn("flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg shrink-0", bg)}>
                    <Icon className={cn("h-4 w-4 md:h-5 md:w-5", color)} />
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-tight">{label}</p>
                    <div className="text-lg md:text-xl font-black text-slate-900 leading-none mt-0.5">{formatCurrency(amount)}</div>
                </div>
            </CardContent>
        </Card>
    );
}