"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Calendar, Info, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface WalletCardProps {
    data: {
        earnedSalary: number;
        baseSalary: number;
        dailyRate: number;
        totalWorkingDaysCount: number;
        attendanceSummary: {
            present: number;
            halfDay: number;
            leave: number;
        };
    };
    isLoading?: boolean;
}

export function WalletCard({ data, isLoading }: WalletCardProps) {
    if (isLoading) {
        return (
            <Card className="shadow-sm border-slate-200 bg-white animate-pulse">
                <div className="h-32 bg-slate-50" />
            </Card>
        );
    }

    const progress = data.baseSalary > 0 ? (data.earnedSalary / data.baseSalary) * 100 : 0;
    const daysWorked = data.attendanceSummary.present + (data.attendanceSummary.halfDay * 0.5);

    return (
        <Card className="shadow-sm border-slate-200 bg-white overflow-hidden h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-50 rounded-md">
                        <Wallet className="h-4 w-4 text-emerald-600" />
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-800">
                        Monthly Wallet
                    </CardTitle>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Salary</span>
                    {/* <span className="text-xs font-bold text-slate-900">₹{data.dailyRate.toLocaleString()}</span> */}
                </div>
            </CardHeader>
            <CardContent className="px-5 flex-1 flex flex-col justify-between gap-4">
                {/* Earned Amount */}
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-black text-slate-900 leading-none">
                            ₹{data.earnedSalary.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Earned
                        </span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500 mt-2 flex items-center gap-1">
                        {/* <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> */}
                        Target: <span className="font-bold text-slate-700">₹{data.baseSalary.toLocaleString()}</span> this month
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400 uppercase tracking-tight">Month Progress</span>
                        <span className="text-emerald-600 bg-emerald-50 px-1.5 rounded">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Attendance Mini Stats */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="bg-slate-50/50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100/50">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 mb-1" />
                        <span className="text-xs font-bold text-slate-900 leading-none">{data.attendanceSummary.present}</span>
                        <span className="text-[8px] text-slate-400 uppercase font-black mt-1">Full</span>
                    </div>
                    <div className="bg-slate-50/50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100/50">
                        <Clock className="h-3 w-3 text-amber-500 mb-1" />
                        <span className="text-xs font-bold text-slate-900 leading-none">{data.attendanceSummary.halfDay}</span>
                        <span className="text-[8px] text-slate-400 uppercase font-black mt-1">Half</span>
                    </div>
                    <div className="bg-slate-50/50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100/50">
                        <AlertCircle className="h-3 w-3 text-rose-400 mb-1" />
                        <span className="text-xs font-bold text-slate-900 leading-none">{data.attendanceSummary.leave}</span>
                        <span className="text-[8px] text-slate-400 uppercase font-black mt-1">Leave</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
