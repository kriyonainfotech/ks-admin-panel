"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { restoreSession } from "@/src/redux/slices/authSlice";

import { User } from "@/lib/userData";

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
    isLoading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
    const [token, setToken] = useState<string | null>(null);

    // ⚡ REHYDRATION LOGIC
    useEffect(() => {
        const checkAuth = () => {
            const storedToken = Cookies.get("token");
            const storedUser = localStorage.getItem("kriyona_user");

            if (storedToken) {
                setToken(storedToken);
            }

            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    // Restore Redux state
                    dispatch(restoreSession(parsedUser));
                } catch (error) {
                    console.error("Auth Error", error);
                    dispatch(restoreSession(null));
                }
            } else {
                // No user found, stop loading
                dispatch(restoreSession(null));
            }
        };

        checkAuth();
    }, [dispatch]);

    const login = (newToken: string, newUser: User) => {
        // 1. Update Cookies / LocalStorage
        Cookies.set("token", newToken, { expires: 7 });
        localStorage.setItem("token", newToken);
        localStorage.setItem("kriyona_user", JSON.stringify(newUser));

        // 2. Update Redux
        dispatch(restoreSession(newUser));
        setToken(newToken);
    };

    const logout = () => {
        // 1. Clear Cookies / LocalStorage
        Cookies.remove("token");
        localStorage.removeItem("token");
        localStorage.removeItem("kriyona_user");
        localStorage.removeItem("active_company_id");

        // 2. Clear Redux
        dispatch(restoreSession(null));
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
