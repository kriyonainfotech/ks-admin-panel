"use client";

import { useEffect, useRef, useState } from 'react';
import OneSignal from 'react-onesignal';
import { useAuth } from '@/src/context/AuthContext';
import { toast } from "sonner";

export function OneSignalSetup() {
    const { user } = useAuth();
    const initialized = useRef(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const runOneSignal = async () => {
            try {
                await OneSignal.init({
                    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "PLACEHOLDER_APP_ID",
                    allowLocalhostAsSecureOrigin: true,
                });

                // Add listener for foreground notifications
                OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
                    const notification = event.notification;
                    console.log("[OneSignal] Received notification in foreground:", notification);

                    toast(notification.title || "New Notification", {
                        description: notification.body,
                        action: {
                            label: "View",
                            onClick: () => console.log("Notification clicked"), // Can redirect if needed
                        },
                    });
                });

                console.log("[OneSignal] Initialized successfully");
                setIsInitialized(true);

            } catch (error) {
                console.error("[OneSignal] Initialization Error:", error);
            }
        };

        runOneSignal();
    }, []);

    // Handle User Login/Logout separately
    useEffect(() => {
        if (!isInitialized) return;

        if (user?._id) {
            OneSignal.login(user._id);
            console.log("[OneSignal] User logged in:", user._id);
        } else {
            OneSignal.logout();
            console.log("[OneSignal] User logged out");
        }
    }, [user?._id, isInitialized]);

    return null;
}
