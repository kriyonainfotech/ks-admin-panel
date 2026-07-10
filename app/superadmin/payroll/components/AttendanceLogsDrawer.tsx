"use client";

import { useEffect } from "react";
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle 
} from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchAttendanceLogs } from "@/src/redux/slices/salarySlice";
import { RootState } from "@/src/redux/store";
import { format } from "date-fns";
import { 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Loader2,
    CalendarDays
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";

interface AttendanceLogsDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any;
    month: number;
    year: number;
}

export function AttendanceLogsDrawer({ open, onOpenChange, user, month, year }: AttendanceLogsDrawerProps) {
    const dispatch = useAppDispatch();
    const { attendanceLogs, isLoading } = useAppSelector((state: RootState) => state.salary);

    useEffect(() => {
        if (open && user) {
            dispatch(fetchAttendanceLogs({ 
                userId: user._id, 
                params: { month, year } 
            }));
        }
    }, [open, user, month, year, dispatch]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Full Day":
                return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case "Half Day":
                return <Clock className="h-4 w-4 text-amber-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-red-500" />;
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md p-0 flex flex-col border-l shadow-2xl">
                <div className="bg-card border-b p-6">
                    <SheetHeader>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-primary/10 p-2.5 rounded-md">
                                <CalendarDays className="h-5 w-5 text-primary" />
                            </div>
                            <SheetTitle className="text-xl font-bold text-foreground">
                                Attendance Logs
                            </SheetTitle>
                        </div>
                    </SheetHeader>
                    {user && (
                        <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-md border border-border">
                            <div className="flex flex-col">
                                <span className="text-base font-bold text-foreground">{user.name}</span>
                                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                    {format(new Date(year, month - 1), "MMMM yyyy")}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 transition-colors">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3">
                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                            <p className="text-muted-foreground text-sm font-medium">Fetching logs...</p>
                        </div>
                    ) : attendanceLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <AlertCircle className="h-12 w-12 text-slate-200 mb-4" />
                            <p className="text-slate-400 font-medium">No attendance records found for this period.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-10">
                            {attendanceLogs.map((log: any) => (
                                <div 
                                    key={log._id} 
                                    className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/30 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-center w-10 flex flex-col items-center">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">
                                                {format(new Date(log.date), "EEE")}
                                            </span>
                                            <span className="text-lg font-bold text-foreground leading-none">
                                                {format(new Date(log.date), "dd")}
                                            </span>
                                        </div>
                                        <div className="w-[1px] h-8 bg-border" />
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(log.status)}
                                                <span className="font-semibold text-foreground text-sm">{log.status}</span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-medium mt-0.5 ml-6">
                                                {log.startTime && log.endTime ? `${log.startTime} - ${log.endTime}` : "No time logged"}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-muted text-muted-foreground font-semibold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        {log.totalHours ? `${log.totalHours}h` : "-"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
