"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptionSetManager } from "./components/OptionSetManager";
import { Settings, PenTool } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-0  pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
            </div>
            <Tabs defaultValue="options" className="space-y-4">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="options" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Option Sets
                    </TabsTrigger>
                    <TabsTrigger value="tools" className="flex items-center gap-2">
                        <PenTool className="h-4 w-4" /> Other Tools
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="options" className="space-y-4">
                    <OptionSetManager />
                </TabsContent>
                <TabsContent value="tools" className="space-y-4">
                    <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
                        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                            <PenTool className="h-10 w-10 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">Additional tools coming soon</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                You will be able to manage more system configurations here.
                            </p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
