"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, AlertCircle, Building2, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils"; // Assuming you have this, or use Intl.NumberFormat

interface PaymentStatsProps {
    stats: {
        totalSalesValue: number;
        totalCollected: number;
        totalIncome: number;
        totalExpense: number;
        totalPending: number;
        byAccount: { personal: number; company: number };
    } | null;
    isLoading: boolean;
}

export function PaymentStats({ stats, isLoading }: PaymentStatsProps) {
    if (isLoading || !stats) {
        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="h-40 bg-muted rounded-xl"></div>
            <div className="h-40 bg-muted rounded-xl"></div>
            <div className="h-40 bg-muted rounded-xl"></div>
        </div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Sales Pipeline (The "Books") */}
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                        SALES PIPELINE
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(stats.totalSalesValue)}</div>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Total value of invoices generated</p>

                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-red-500">Pending Collection</span>
                            <span className="text-sm font-bold text-red-700">{formatCurrency(stats.totalPending)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Net Collection (Cash In Hand - Expenses) */}
            <Card className="border-l-4 border-l-emerald-500 shadow-sm relative overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                        NET COLLECTION
                        <Wallet className="h-4 w-4 text-emerald-500" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-emerald-700">{formatCurrency(stats.totalCollected)}</div>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Actual balance (Income - Expense)</p>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border">
                            <User className="h-3 w-3 text-slate-500" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase">Personal</span>
                                <span className={"text-xs font-bold " + (stats.byAccount.personal >= 0 ? "text-slate-900" : "text-red-600")}>
                                    {formatCurrency(stats.byAccount.personal)}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border">
                            <Building2 className="h-3 w-3 text-slate-500" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase">Company</span>
                                <span className={"text-xs font-bold " + (stats.byAccount.company >= 0 ? "text-slate-900" : "text-red-600")}>
                                    {formatCurrency(stats.byAccount.company)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 3: Income & Expense Breakdown */}
            <Card className="border-l-4 border-l-slate-400 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        BREAKDOWN
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-emerald-600">Total Income</span>
                            <div className="text-xl font-bold text-emerald-700">{formatCurrency(stats.totalIncome)}</div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-red-500">Total Expense</span>
                            <div className="text-xl font-bold text-red-700">-{formatCurrency(stats.totalExpense)}</div>
                        </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${(stats.totalIncome / (stats.totalIncome + stats.totalExpense || 1)) * 100}%` }}
                        />
                        <div
                            className="h-full bg-red-500"
                            style={{ width: `${(stats.totalExpense / (stats.totalIncome + stats.totalExpense || 1)) * 100}%` }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}