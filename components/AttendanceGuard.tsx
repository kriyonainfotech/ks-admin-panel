"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { getAttendanceStatus } from "@/src/redux/slices/attendanceSlice";
import { useAuth } from "@/src/context/AuthContext";

export function AttendanceGuard() {
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const { status: attendanceStatus } = useAppSelector(state => state.attendance);
    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
        if (user && !hasFetched) {
            dispatch(getAttendanceStatus());
            setHasFetched(true);
        }
    }, [user, dispatch, hasFetched]);

    useEffect(() => {
        const isClockedIn = attendanceStatus?.data?.startTime && !attendanceStatus?.data?.endTime;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isClockedIn) {
                e.preventDefault();
                e.returnValue = "You have not clocked out. Are you sure you want to leave?";
                return "You have not clocked out. Are you sure you want to leave?";
            }
        };

        if (isClockedIn) {
            window.addEventListener("beforeunload", handleBeforeUnload);
        }

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [attendanceStatus]);

    return null;
}
