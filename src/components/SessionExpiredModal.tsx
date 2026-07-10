"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut, AlertCircle } from "lucide-react";
import Cookies from "js-cookie";

export function SessionExpiredModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleSessionExpired = () => {
            setOpen(true);
        };

        window.addEventListener("session-expired", handleSessionExpired);
        return () => window.removeEventListener("session-expired", handleSessionExpired);
    }, []);

    const handleLoginAgain = () => {
        // Clear session data
        localStorage.removeItem("token");
        localStorage.removeItem("kriyona_user");
        Cookies.remove("token");

        // Use window.location.href to ensure a full reload and clear any cached states
        window.location.href = "/login";
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent
                className="sm:max-w-[425px] border-amber-200 outline-none"
                onInteractOutside={(e) => e.preventDefault()}
                showCloseButton={false}
            >
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                    </div>
                    <DialogTitle className="text-center text-xl font-bold">Session Expired</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        Your security session has timed out for your safety. Please sign in again to continue your work.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center mt-4">
                    <Button
                        type="button"
                        onClick={handleLoginAgain}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-xl flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign In Again
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
