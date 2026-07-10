"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/redux/store";
import { fetchClients } from "@/src/redux/slices/clientSlice";
import { fetchSchedulesByClient, fetchScheduleAnalytics, fetchScheduleSummary, deleteChutakItem } from "@/src/redux/slices/scheduleSlice";
import { fetchTeam } from "@/src/redux/slices/teamSlice";
import { fetchAdmins } from "@/src/redux/slices/adminSlice";
import { createTask, updateTask, deleteTask } from "@/src/redux/slices/taskSlice";

import { TaskDialog } from "../tasks/components/TaskDialog";
import { toast } from "sonner";

// New Components
import { StatsSection } from "./components/StatsSection";
import { ClientColumn } from "./components/ClientColumn";
import { TaskColumn } from "./components/TaskColumn";
import { EditScheduleItemDialog } from "./components/EditScheduleItemDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function ScheduleManagementPage() {
    const dispatch = useDispatch<AppDispatch>();

    // State
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [selectedQuotaItem, setSelectedQuotaItem] = useState<any>(null);
    const [editingTask, setEditingTask] = useState<any>(null);

    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [renamingItem, setRenamingItem] = useState<any>(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

    // Redux Data
    const { clients } = useSelector((state: RootState) => state.clients);
    const { items: scheduleItems, analytics, summary, isLoading } = useSelector((state: RootState) => state.schedule);
    const { members: teamMembers } = useSelector((state: RootState) => state.team);
    const { admins } = useSelector((state: RootState) => state.superadmin);

    const [dismissedClientIds, setDismissedClientIds] = useState<string[]>(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("dismissed_clients");
            return stored ? JSON.parse(stored) : [];
        }
        return [];
    });

    const handleDismissClient = (clientId: string) => {
        setDismissedClientIds(prev => {
            const updated = [...prev, clientId];
            localStorage.setItem("dismissed_clients", JSON.stringify(updated));
            return updated;
        });
    };

    // Automatically undismiss a client if they are no longer fully completed
    useEffect(() => {
        if (dismissedClientIds.length > 0 && summary.length > 0) {
            const stillCompletedIds = dismissedClientIds.filter(id => {
                const clientSummary = summary.find(s => s._id === id);
                if (!clientSummary) return false;
                // Completed means total > 0, unscheduled === 0, scheduled === 0
                const isCompleted = clientSummary.total > 0 && clientSummary.unscheduled === 0 && clientSummary.scheduled === 0;
                return isCompleted;
            });
            if (stillCompletedIds.length !== dismissedClientIds.length) {
                setDismissedClientIds(stillCompletedIds);
                localStorage.setItem("dismissed_clients", JSON.stringify(stillCompletedIds));
            }
        }
    }, [summary, dismissedClientIds]);

    useEffect(() => {
        dispatch(fetchClients());
        dispatch(fetchScheduleAnalytics());
        dispatch(fetchScheduleSummary());
        dispatch(fetchTeam());
        dispatch(fetchAdmins());
    }, [dispatch]);

    useEffect(() => {
        if (selectedClientId) {
            dispatch(fetchSchedulesByClient(selectedClientId));
        }
    }, [dispatch, selectedClientId]);

    // Derived Data
    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const hasActivePackage = client.subscriptions?.some(s => s.status === "Active");
            const clientSummary = summary.find(s => s._id === client.id || s._id === (client as any)._id);

            // If no items at all and no active package, hide
            if (!hasActivePackage && (!clientSummary || clientSummary.total === 0)) return false;

            if (!clientSummary) return hasActivePackage; // Show if they have a package but no summary yet

            // Hide if manually dismissed
            if (dismissedClientIds.includes(client.id)) return false;

            return true;
        });
    }, [clients, summary, dismissedClientIds]);

    // Set default client if none selected or if selected client is no longer in filtered clients
    useEffect(() => {
        const isSelectedClientVisible = filteredClients.some(c => c.id === selectedClientId);
        if (filteredClients.length > 0 && (!selectedClientId || !isSelectedClientVisible)) {
            setSelectedClientId(filteredClients[0].id);
        }
    }, [filteredClients, selectedClientId]);

    // Derived Data with Natural Sorting
    const backlogItems = useMemo(() => {
        return [...scheduleItems]
            .filter(i => i.status === "Unscheduled")
            .sort((a, b) => (a.content || "").localeCompare(b.content || "", undefined, { numeric: true, sensitivity: 'base' }));
    }, [scheduleItems]);

    const activeItems = useMemo(() => {
        return [...scheduleItems]
            .filter(i => i.status !== "Unscheduled") // Keep Completed items shown as well
            .sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateA - dateB;
            });
    }, [scheduleItems]);

    console.log(activeItems, "activeItems");

    const handleScheduleClick = (item: any) => {
        setEditingTask(null);
        setSelectedQuotaItem(item);
        setIsTaskDialogOpen(true);
    };

    const handleEditClick = (item: any) => {
        if (item.status === "Completed") {
            toast.info("You cannot edit a completed task");
            return;
        }

        if (item.linkedTask) {
            setEditingTask(item.linkedTask);
            setSelectedQuotaItem(item);
        } else {
            // Unscheduled item, just use it as base for a new task or edit quota?
            // Usually editing a task implies it has one. 
            // If it's unscheduled, "Edit" is same as "Schedule" (Action).
            setEditingTask(null);
            setSelectedQuotaItem(item);
        }
        setIsTaskDialogOpen(true);
    };

    const handleRenameClick = (item: any) => {
        if (item.status === "Completed") return;
        setRenamingItem(item);
        setIsRenameDialogOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeletingItemId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingItemId) return;
        try {
            await dispatch(deleteChutakItem(deletingItemId) as any).unwrap();
            dispatch(fetchScheduleAnalytics());
            dispatch(fetchScheduleSummary());
            toast.success("Schedule item deleted successfully");
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete item");
        } finally {
            setIsDeleteDialogOpen(false);
            setDeletingItemId(null);
        }
    };

    const handleTaskSubmit = async (data: any) => {
        try {
            if (editingTask) {
                // UPDATE LOGIC
                // Check if date and assignee are cleared
                const isUnscheduling = !data.dueDate && (!data.assignedTo || data.assignedTo === "none");

                if (isUnscheduling) {
                    await dispatch(deleteTask(editingTask._id)).unwrap();
                    toast.success("Task unscheduled (removed)");
                } else {
                    await dispatch(updateTask({ _id: editingTask._id, data })).unwrap();
                    toast.success("Task updated successfully!");
                }
            } else {
                // CREATE LOGIC
                const payload = {
                    ...data,
                    scheduleItem: selectedQuotaItem._id,
                    client: selectedClientId,
                    type: "Team"
                };

                await dispatch(createTask(payload)).unwrap();
                toast.success("Task scheduled successfully!");
            }

            setIsTaskDialogOpen(false);
            setEditingTask(null);

            // Refresh data
            dispatch(fetchSchedulesByClient(selectedClientId));
            dispatch(fetchScheduleAnalytics());
            dispatch(fetchScheduleSummary());
        } catch (error: any) {
            toast.error(error?.message || error || "Failed to process task");
        }
    };

    const totalTasks = (analytics?.totalPending || 0) + (analytics?.totalScheduled || 0) + (analytics?.totalCompleted || 0);

    return (
        <div className="space-y-8 p-1">
            {/* Top Section: Header, Stats & Calendar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-muted border-gray-100 pb-3 mb-0">

                <div className="w-full flex justify-center lg:justify-end">
                    <StatsSection
                        totalClients={filteredClients.length}
                        totalTasks={totalTasks}
                        unscheduledTasks={analytics?.totalPending || 0}
                        scheduledTasks={analytics?.totalScheduled || 0}
                        completedTasks={analytics?.totalCompleted || 0}
                    />
                </div>
            </div>

            {/* Bottom Section: 3-Column Layout with Vertical Borders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 pb-10 pt-4 border-t border-gray-100/50">
                {/* 1st Column: Client List */}
                <div className="lg:pr-6 lg:border-r border-gray-100 pb-8 lg:pb-0">
                    <ClientColumn
                        clients={filteredClients}
                        summary={summary}
                        selectedClientId={selectedClientId}
                        onSelectClient={setSelectedClientId}
                        onDismissClient={handleDismissClient}
                        isLoading={isLoading}
                    />
                </div>

                {/* 2nd Column: Unscheduled Tasks */}
                <div className="lg:px-6 lg:border-r border-gray-100 pb-8 lg:pb-0">
                    <TaskColumn
                        title="Unscheduled Content"
                        count={backlogItems.length}
                        items={backlogItems}
                        type="unscheduled"
                        onAction={handleScheduleClick}
                        onEdit={handleEditClick}
                        onRename={handleRenameClick}
                        onDelete={handleDeleteClick}
                        isLoading={isLoading && scheduleItems.length === 0}
                    />
                </div>

                {/* 3rd Column: Scheduled Tasks */}
                <div className="lg:pl-6">
                    <TaskColumn
                        title="Scheduled Work"
                        count={activeItems.length}
                        items={activeItems}
                        type="scheduled"
                        onEdit={handleEditClick}
                        onRename={handleRenameClick}
                        onDelete={handleDeleteClick}
                        isLoading={isLoading && scheduleItems.length === 0}
                    />
                </div>
            </div>

            {/* Task Dialog Integration */}
            <TaskDialog
                open={isTaskDialogOpen}
                onOpenChange={(val) => {
                    setIsTaskDialogOpen(val);
                    if (!val) setEditingTask(null);
                }}
                onSubmit={handleTaskSubmit}
                defaultType="Team"
                lockType={true}
                teamMembers={teamMembers}
                clients={clients}
                admins={admins}
                initialData={editingTask ? {
                    ...editingTask,
                    // Ensure the structure matches TaskDialog expectation
                    client: typeof editingTask.client === 'object' ? editingTask.client?._id : editingTask.client
                } : {
                    title: selectedQuotaItem?.content || "",
                    client: selectedClientId,
                    type: "Team"
                } as any}
            />

            <EditScheduleItemDialog
                open={isRenameDialogOpen}
                onOpenChange={setIsRenameDialogOpen}
                item={renamingItem}
                clientId={selectedClientId}
            />

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Delete Schedule Item"
                description="Are you sure you want to delete this schedule item? This action cannot be undone."
            />
        </div>
    );
}
