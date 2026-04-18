import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { getAttendanceStatus, getQRLink, clearError } from "@/src/redux/slices/attendanceSlice";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";

interface AttendanceQRProps {
    mode?: "dialog" | "embedded";
}

export default function AttendanceQR({ mode = "dialog" }: AttendanceQRProps) {
    const dispatch = useAppDispatch();
    const { status, error } = useAppSelector((state) => state.attendance);
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // 1. Fetch QR Link on Mount (or when dialog opens)
    const fetchQR = () => {
        dispatch(getQRLink()).unwrap()
            .then((res: any) => {
                if (res.alreadyCheckedIn) {
                    // Update global status if backend says we are done
                    // You might want to dispatch an action to update state.attendance.status.checkedIn = true
                    // But for now, let's just trigger a status fetch
                    dispatch(getAttendanceStatus());
                } else if (res.url) {
                    setQrUrl(res.url);
                } else {
                    toast.error("Failed to generate QR Code");
                }
            })
            .catch((err: any) => {
                // console.error(err);
                toast.error("Error fetching QR: " + (typeof err === "string" ? err : err.message || "Unknown error"));
            });
    };

    useEffect(() => {
        if (mode === "embedded" || isOpen) {
            fetchQR();
        }
    }, [mode, isOpen, dispatch]);

    // 2. Poll for Status (Check if mobile scanned it) using interval
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if ((mode === "embedded" || isOpen) && !status.checkedIn) {
            interval = setInterval(() => {
                dispatch(getAttendanceStatus());
            }, 3000); // Poll every 3 seconds
        }
        return () => clearInterval(interval);
    }, [mode, isOpen, status.checkedIn, dispatch]);

    // 3. Handle Errors
    useEffect(() => {
        if (error) {
            dispatch(clearError());
        }
    }, [error, dispatch]);


    if (status.checkedIn) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 w-fit">
                <CheckCircle2 className="h-5 w-5" />
                <div className="flex flex-col">
                    <span className="text-sm font-bold">Checked In</span>
                    {status.data?.startTime && (
                        <span className="text-[10px] opacity-80">
                            at {status.data.startTime}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    const QRContent = () => (
        <div className="flex flex-col items-center justify-center p-4 w-full">
            {!qrUrl ? (
                <div className="h-64 w-full flex flex-col items-center justify-center bg-slate-50 rounded-lg">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-2" />
                    <p className="text-sm text-slate-500">Generating QR...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
                        <QRCode
                            value={qrUrl}
                            size={200}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                    <p className="text-xs text-slate-500 text-center max-w-[250px]">
                        Scan this QR code with your mobile camera to mark your attendance.
                    </p>
                    <Button variant="ghost" size="sm" onClick={fetchQR} className="text-xs text-slate-400">
                        <RefreshCw className="h-3 w-3 mr-1" /> Refresh Code
                    </Button>
                </div>
            )}
        </div>
    );

    if (mode === "embedded") {
        return <QRContent />;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm">
                    <QrCode className="h-4 w-4" />
                    Check In
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Mark Attendance</DialogTitle>
                    <DialogDescription>
                        Please scan this QR code with your mobile device.
                    </DialogDescription>
                </DialogHeader>
                <QRContent />
            </DialogContent>
        </Dialog>
    );
}
