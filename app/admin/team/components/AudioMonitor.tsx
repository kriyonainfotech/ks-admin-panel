"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Download, Play, Pause, RefreshCw } from "lucide-react";
import { useSocket } from "@/src/context/SocketContext";
import { toast } from "sonner";
import axiosInstance from "@/src/utils/axiosInstance";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AudioRecord {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    fileName: string;
    filePath: string;
}

export default function AudioMonitor({ userId, userName }: { userId: string, userName: string }) {
    const { socket } = useSocket();
    const [records, setRecords] = useState<AudioRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [currentAudio, setCurrentAudio] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await axiosInstance.get(`/activity/audio-records?userId=${userId}&date=${today}`);
            if (response.data.success) {
                setRecords(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch audio records:", error);
            toast.error("Failed to fetch audio records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchRecords();
        }
    }, [userId]);

    const requestLiveAudio = () => {
        if (!socket) {
            toast.error("Socket not connected");
            return;
        }
        setRequesting(true);
        socket.emit("request_audio", userId);
        toast.info("Requested live audio from agent. It will be uploaded shortly.");
        
        // Auto refresh after 15 seconds to check for new upload
        setTimeout(() => {
            fetchRecords();
            setRequesting(false);
        }, 15000);
    };

    const handlePlay = (filePath: string) => {
        const fullUrl = `https://api.kriyonastudio.com${filePath}`; // Assuming prod or use NEXT_PUBLIC_API_URL
        if (currentAudio === fullUrl && isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
        } else if (currentAudio === fullUrl && !isPlaying) {
            audioRef.current?.play();
            setIsPlaying(true);
        } else {
            setCurrentAudio(fullUrl);
            setIsPlaying(true);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">Audio Monitor</CardTitle>
                    <CardDescription>Listen to {userName}'s recorded microphone audio for today</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchRecords} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Button variant="default" size="sm" onClick={requestLiveAudio} disabled={requesting}>
                        <Mic className="h-4 w-4 mr-2" /> {requesting ? "Requesting..." : "Fetch Live Audio"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {currentAudio && (
                    <div className="mb-4 p-3 bg-muted/30 rounded-lg flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => handlePlay(currentAudio)}>
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <audio 
                            ref={audioRef} 
                            src={currentAudio} 
                            autoPlay 
                            controls 
                            className="w-full h-10"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                        />
                    </div>
                )}
                
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    {records.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Mic className="h-8 w-8 mb-2 opacity-20" />
                            <p>No audio records found for today.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {records.map((record, i) => (
                                <React.Fragment key={record._id}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">
                                                {format(new Date(record.startTime), "hh:mm a")} - {format(new Date(record.endTime), "hh:mm a")}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate w-48">
                                                {record.fileName}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant={currentAudio?.includes(record.filePath) ? "default" : "outline"} 
                                                size="sm" 
                                                onClick={() => handlePlay(record.filePath)}
                                            >
                                                {currentAudio?.includes(record.filePath) && isPlaying ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />} 
                                                Play
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild>
                                                <a href={`https://api.kriyonastudio.com${record.filePath}`} download target="_blank" rel="noreferrer">
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                    {i < records.length - 1 && <Separator />}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
