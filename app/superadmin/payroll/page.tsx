"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import {
    fetchPayrollStats,
    fetchPayrollList,
    setSelectedDate
} from "@/src/redux/slices/salarySlice";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RootState } from "@/src/redux/store";
import { PayrollHeader } from "./components/PayrollHeader";
import { SummaryCards } from "./components/SummaryCards";
import { TeamList } from "./components/TeamList";
import { PaySalaryDialog } from "./components/PaySalaryDialog";
import { AttendanceLogsDrawer } from "./components/AttendanceLogsDrawer";
import { toast } from "sonner";

export default function PayrollPage() {
    const dispatch = useAppDispatch();
    const {
        stats,
        payrollList,
        isLoading,
        error,
        selectedMonth,
        selectedYear
    } = useAppSelector((state: RootState) => state.salary);

    const [activeTab, setActiveTab] = useState("All");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
    const [isLogsOpen, setIsLogsOpen] = useState(false);

    useEffect(() => {
        const params = { month: selectedMonth, year: selectedYear };
        dispatch(fetchPayrollStats(params));
        dispatch(fetchPayrollList({ ...params, tab: activeTab }));
    }, [dispatch, selectedMonth, selectedYear, activeTab]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handlePaySalary = (user: any) => {
        setSelectedUser(user);
        setIsPayDialogOpen(true);
    };

    const handleViewLogs = (user: any) => {
        setSelectedUser(user);
        setIsLogsOpen(true);
    };

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const isPreviousMonth = selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth);

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-2rem)]">
            <PayrollHeader
                month={selectedMonth}
                year={selectedYear}
                onDateChange={(m, y) => dispatch(setSelectedDate({ month: m, year: y }))}
            />

            <div className="flex-1 flex flex-col gap-6 overflow-hidden pr-1">
                <SummaryCards stats={stats} isLoading={isLoading} />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full max-w-[500px] grid-cols-4 mb-4 shrink-0">
                        <TabsTrigger value="All">All</TabsTrigger>
                        <TabsTrigger value="Superadmins">Superadmins</TabsTrigger>
                        <TabsTrigger value="Admins">Admins</TabsTrigger>
                        <TabsTrigger value="Team">Team</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto min-h-0">
                        <TabsContent value="All" className="mt-0 outline-none">
                            <TeamList
                                data={payrollList}
                                isLoading={isLoading}
                                onPay={handlePaySalary}
                                onViewLogs={handleViewLogs}
                                isReadOnly={isPreviousMonth}
                            />
                        </TabsContent>
                        <TabsContent value="Team" className="mt-0 outline-none">
                            <TeamList
                                data={payrollList}
                                isLoading={isLoading}
                                onPay={handlePaySalary}
                                onViewLogs={handleViewLogs}
                                isReadOnly={isPreviousMonth}
                            />
                        </TabsContent>
                        <TabsContent value="Admins" className="mt-0 outline-none">
                            <TeamList
                                data={payrollList}
                                isLoading={isLoading}
                                onPay={handlePaySalary}
                                onViewLogs={handleViewLogs}
                                isReadOnly={isPreviousMonth}
                            />
                        </TabsContent>
                        <TabsContent value="Superadmins" className="mt-0 outline-none">
                            <TeamList
                                data={payrollList}
                                isLoading={isLoading}
                                onPay={handlePaySalary}
                                onViewLogs={handleViewLogs}
                                isReadOnly={isPreviousMonth}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            <PaySalaryDialog
                open={isPayDialogOpen}
                onOpenChange={setIsPayDialogOpen}
                user={selectedUser}
                month={selectedMonth}
                year={selectedYear}
            />

            <AttendanceLogsDrawer
                open={isLogsOpen}
                onOpenChange={setIsLogsOpen}
                user={selectedUser}
                month={selectedMonth}
                year={selectedYear}
            />
        </div>
    );
}
