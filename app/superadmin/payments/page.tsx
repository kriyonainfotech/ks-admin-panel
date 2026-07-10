"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import {
    fetchPaymentStats,
    fetchSales,
    fetchCollections,
    createSale,
    collectPayment,
    recordExpense,
    createDirectCollection,
    updateDirectCollection,
    updateSale,
    deleteSale,
    updateExpense,
    deleteExpense,
    deleteCollection,
    updateCollectionAccount,
    setSelectedCompany,
    setSelectedDate
} from "@/src/redux/slices/paymentSlice";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Filter, Building2, Lock, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from "@/components/ui/alert-dialog";

import { FinancialStats } from "./components/FinancialStats";
import { CreateSaleDialog } from "./components/CreateSaleDialog";
import { CollectPaymentDialog } from "./components/CollectPaymentDialog";
import { CreateDirectCollectionDialog } from "./components/CreateDirectCollectionDialog";
import { saleColumns, historyColumns } from "./components/columns";
import { RecordExpenseDialog } from "./components/RecordExpenseDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { downloadSaleInvoice, downloadPaymentReceipt, downloadMonthlySalesReport, downloadMonthlyCollectionsReport, downloadMonthlyExpensesReport } from "@/lib/pdfExport";
import { RootState } from "@/src/redux/store";

export default function PaymentsPage() {
    const dispatch = useAppDispatch();
    const { stats, sales, collections, isLoading, selectedCompany, selectedMonth, selectedYear } = useAppSelector((state: RootState) => state.payment);
    const { user, activeCompany } = useAppSelector((state: RootState) => state.auth);

    const [activeTab, setActiveTab] = useState("sales");

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const isGlobalAdmin = user?.role === "Superadmin";

    // --- REFINEMENT: Get all available companies for this user ---
    const availableCompanies = useMemo(() => {
        if (isGlobalAdmin || user?.role === "Superadmin") {
            return ["Kriyona Studio", "PrimeAdwork", "Kriyona Infotech"];
        }
        const list: string[] = [];
        if (user?.company) {
            list.push(typeof user.company === 'string' ? user.company : user.company.name);
        }
        if (user?.accessibleCompanies) {
            user.accessibleCompanies.forEach((c: any) => {
                if (!list.includes(c.name)) list.push(c.name);
            });
        }
        return list;
    }, [user, isGlobalAdmin]);

    const userCompany = useMemo(() => {
        if (!user?.company) return null;
        return typeof user.company === 'string' ? user.company : user.company.name;
    }, [user]);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDirectCollectionOpen, setIsDirectCollectionOpen] = useState(false);
    const [isCollectOpen, setIsCollectOpen] = useState(false);
    const [isExpenseOpen, setIsExpenseOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [selectedExpense, setSelectedExpense] = useState<any>(null);
    const [selectedDirectCollection, setSelectedDirectCollection] = useState<any>(null);
    const [saleToDelete, setSaleToDelete] = useState<any>(null);
    const [expenseToDelete, setExpenseToDelete] = useState<any>(null);
    const [collectionToDelete, setCollectionToDelete] = useState<any>(null);
    const [pendingData, setPendingData] = useState<any>(null);
    const [isConfirmExpenseDeleteOpen, setIsConfirmExpenseDeleteOpen] = useState(false);
    const [isConfirmCollectionDeleteOpen, setIsConfirmCollectionDeleteOpen] = useState(false);
    const [editAccountItem, setEditAccountItem] = useState<any>(null);
    const [editAccountValue, setEditAccountValue] = useState<string>("");

    // --- REFINEMENT: Sync local page state with Global Company Context ---
    useEffect(() => {
        if (activeCompany && selectedCompany !== activeCompany.name) {
            dispatch(setSelectedCompany(activeCompany.name));
        }
    }, [activeCompany, dispatch]);

    useEffect(() => {
        // Fallback: If no company is selected yet, use global active company or first available
        const company = selectedCompany || activeCompany?.name;
        if (!company) return;

        const params = { company, month: selectedMonth, year: selectedYear };
        dispatch(fetchPaymentStats(params));
        dispatch(fetchSales(params));
        dispatch(fetchCollections(params));
    }, [dispatch, selectedCompany, activeCompany, selectedMonth, selectedYear]);

    // --- DEBUG LOGS FOR SALES DATA ---
    useEffect(() => {
        if (sales && sales.length > 0) {
            console.log(`--- [FRONTEND DEBUG] SALES DATA FOR ${selectedCompany} ---`);
            console.table(sales.map((s: any) => ({
                Date: new Date(s.saleDate).toLocaleDateString(),
                ID: s._id,
                Client: s.guestName || s.client?.businessName || "Guest",
                Work: s.title,
                Total: s.totalAmount,
                Collected: s.collectedAmount,
                Remaining: s.remainingAmount,
                Status: s.status
            })));
        }
    }, [sales, selectedCompany]);

    useEffect(() => {
        if (stats) {
            console.log(`--- [FRONTEND DEBUG] STATS FOR ${selectedCompany} ---`, stats);
        }
    }, [stats, selectedCompany]);

    const handleCollectOpen = (sale: any) => {
        if (isReadOnly) {
            toast.error("Read-Only View: You cannot edit this company's records.");
            return;
        }
        setSelectedSale(sale);
        setIsCollectOpen(true);
    };

    const handleCreateSale = async (data: any) => {
        if (selectedSale) {
            setPendingData(data);
            setIsConfirmSaveOpen(true);
        } else {
            await dispatch(createSale(data)).unwrap();
            setIsCreateOpen(false);
        }
    };

    const handleConfirmSave = async () => {
        if (selectedSale && pendingData) {
            await dispatch(updateSale({ id: selectedSale._id || selectedSale.id, data: pendingData })).unwrap();
            setIsConfirmSaveOpen(false);
            setIsCreateOpen(false);
            setSelectedSale(null);
            setPendingData(null);
        }
    };

    const handleEditOpen = (sale: any) => {
        setSelectedSale(sale);
        setIsCreateOpen(true);
    };

    const handleDeleteClick = (sale: any) => {
        setSaleToDelete(sale);
        setIsConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (saleToDelete) {
            await dispatch(deleteSale(saleToDelete._id || saleToDelete.id)).unwrap();
            setIsConfirmDeleteOpen(false);
            setSaleToDelete(null);
        }
    };

    const handleCollectSubmit = async (data: any) => {
        await dispatch(collectPayment(data)).unwrap();
        setIsCollectOpen(false);
        setSelectedSale(null);
    };

    const handleRecordExpense = async (payload: any) => {
        if (payload.id) {
            await dispatch(updateExpense({ id: payload.id, data: payload.data })).unwrap();
        } else {
            await dispatch(recordExpense(payload)).unwrap();
        }
        setIsExpenseOpen(false);
        setSelectedExpense(null);
    };

    const handleCreateDirectCollection = async (payload: any) => {
        if (payload.id) {
            await dispatch(updateDirectCollection({ id: payload.id, data: payload.data })).unwrap();
        } else {
            await dispatch(createDirectCollection(payload)).unwrap();
        }
        setIsDirectCollectionOpen(false);
        setSelectedDirectCollection(null);
    };

    const handleDirectCollectionEditOpen = (collection: any) => {
        setSelectedDirectCollection(collection);
        setIsDirectCollectionOpen(true);
    };

    const handleExpenseEditOpen = (expense: any) => {
        setSelectedExpense(expense);
        setIsExpenseOpen(true);
    };

    const handleHistoryDeleteClick = (item: any) => {
        if (item.transactionType === "Expense") {
            setExpenseToDelete(item);
            setIsConfirmExpenseDeleteOpen(true);
        } else {
            // This handles both regular Collections and Direct Collections
            setCollectionToDelete(item);
            setIsConfirmCollectionDeleteOpen(true);
        }
    };

    const handleConfirmExpenseDelete = async () => {
        if (expenseToDelete) {
            await dispatch(deleteExpense(expenseToDelete._id)).unwrap();
            setIsConfirmExpenseDeleteOpen(false);
            setExpenseToDelete(null);
        }
    };

    const handleConfirmCollectionDelete = async () => {
        if (collectionToDelete) {
            await dispatch(deleteCollection(collectionToDelete._id)).unwrap();
            setIsConfirmCollectionDeleteOpen(false);
            setCollectionToDelete(null);
        }
    };

    const handleUpdateCollectionAccount = async (id: string, account: string) => {
        await dispatch(updateCollectionAccount({ id, destinationAccount: account })).unwrap();
    };

    const handleEditAccountOpen = (item: any) => {
        setEditAccountItem(item);
        setEditAccountValue(item.destinationAccount);
    };

    const handleConfirmAccountUpdate = async () => {
        if (editAccountItem && editAccountValue) {
            await handleUpdateCollectionAccount(editAccountItem._id, editAccountValue);
            setEditAccountItem(null);
            setEditAccountValue("");
        }
    };

    // Check if the current user has write access to the selected company
    const hasWriteAccess = isGlobalAdmin ||
        (user?.company && (typeof user.company === 'string' ? user.company : user.company.name) === selectedCompany) ||
        (user?.accessibleCompanies?.some((c: any) => c.name === selectedCompany));

    const isReadOnly: boolean = !hasWriteAccess;

    return (
        <div className="min-h-screen pb-20">
            {/* Header / Config Bar */}
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 my-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="mr-auto flex items-center gap-4">
                        <div className="bg-slate-100 p-2.5 rounded-lg text-slate-600 hidden md:block">
                            <Building2 size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-slate-900 font-bold uppercase tracking-wider leading-none">{selectedCompany}</span>
                            <div className="flex items-center gap-2 mt-1.5">
                                {isReadOnly && (
                                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                                        <Lock className="h-3 w-3" /> Read Only
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm px-2 gap-1">
                        <Select
                            value={selectedMonth.toString()}
                            onValueChange={(val) => dispatch(setSelectedDate({ month: parseInt(val), year: selectedYear }))}
                        >
                            <SelectTrigger className="w-[120px] sm:w-[140px] h-9 border-none bg-transparent shadow-none focus:ring-0">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {monthNames.map((name, i) => (
                                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                                        {name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="w-[1px] h-4 bg-slate-200" />
                        <Select
                            value={selectedYear.toString()}
                            onValueChange={(val) => dispatch(setSelectedDate({ month: selectedMonth, year: parseInt(val) }))}
                        >
                            <SelectTrigger className="w-[70px] sm:w-[90px] h-9 border-none bg-transparent shadow-none focus:ring-0">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {[2025, 2026].map(y => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Select
                        value={selectedCompany}
                        onValueChange={(val) => dispatch(setSelectedCompany(val))}
                    >
                        <SelectTrigger className={`w-full sm:w-[180px] h-9 border-slate-200 shadow-sm font-medium ${!isGlobalAdmin && selectedCompany !== userCompany && selectedCompany !== "All Companies" ? 'bg-slate-50' : 'bg-white'}`}>
                            <div className="flex items-center gap-2 text-slate-700">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {availableCompanies.map(company => (
                                <SelectItem key={company} value={company}>{company}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col gap-4">
                    <TabsList className="bg-slate-200/50 p-1 rounded-xl h-auto gap-0 w-full flex">
                        {["sales", "collections", "expenses"].map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="flex-1 py-2.5 rounded-lg text-slate-500 data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-md data-[state=active]:font-bold transition-all text-xs uppercase tracking-widest"
                            >
                                {tab === "sales" ? "Sales Book" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="space-y-3">
                        <FinancialStats type={activeTab} stats={stats} />
                    </div>

                    <TabsContent value="sales" className="mt-0 space-y-6 outline-none">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Recent Invoices</h3>
                                <p className="text-sm text-slate-500 font-medium">Manage deals and pending payments for {monthNames[selectedMonth - 1]}.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => downloadMonthlySalesReport(sales, selectedCompany, monthNames[selectedMonth - 1], selectedYear)}
                                    className="gap-2 border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200"
                                    disabled={sales.length === 0}
                                >
                                    <Download className="h-4 w-4" />
                                    Download Report
                                </Button>
                                <Button
                                    onClick={() => {
                                        setSelectedSale(null);
                                        setIsCreateOpen(true);
                                    }}
                                    disabled={isReadOnly}
                                    className={cn("gap-2", isReadOnly ? 'bg-slate-100 text-slate-400' : '')}
                                >
                                    {isReadOnly ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    New Sale
                                </Button>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <DataTable
                                columns={saleColumns(handleCollectOpen, handleEditOpen, handleDeleteClick, downloadSaleInvoice, isReadOnly)}
                                data={[...sales].sort((a, b) => new Date(b.saleDate || b.createdAt).getTime() - new Date(a.saleDate || a.createdAt).getTime())}
                                filterKey="title"
                                hidePagination={true}
                                isLoading={isLoading}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="collections" className="mt-0 space-y-6 outline-none">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Collection History</h3>
                                <p className="text-sm text-slate-500 font-medium">Audit trail of all incoming payments for {monthNames[selectedMonth - 1]}.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => downloadMonthlyCollectionsReport(
                                        collections.filter(c => c.transactionType === "Income"),
                                        selectedCompany,
                                        monthNames[selectedMonth - 1],
                                        selectedYear
                                    )}
                                    className="gap-2 border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200"
                                    disabled={collections.filter(c => c.transactionType === "Income").length === 0}
                                >
                                    <Download className="h-4 w-4" />
                                    Download Report
                                </Button>
                                <Button
                                    onClick={() => {
                                        setSelectedDirectCollection(null);
                                        setIsDirectCollectionOpen(true);
                                    }}
                                    disabled={isReadOnly}
                                    className={cn("gap-2 bg-emerald-600 hover:bg-emerald-700", isReadOnly ? 'bg-slate-100 text-slate-400' : '')}
                                >
                                    {isReadOnly ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    Direct Collection
                                </Button>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <DataTable
                                columns={historyColumns((item) => {
                                    if (item.isDirectCollection) {
                                        handleDirectCollectionEditOpen(item);
                                    } else {
                                        handleExpenseEditOpen(item);
                                    }
                                }, handleHistoryDeleteClick, downloadPaymentReceipt, isReadOnly, handleEditAccountOpen)}
                                data={collections
                                    .filter(c => c.transactionType === "Income")
                                    .sort((a, b) => new Date(b.collectionDate || b.createdAt).getTime() - new Date(a.collectionDate || a.createdAt).getTime())
                                }
                                filterKey="payerName"
                                hidePagination={true}
                                isLoading={isLoading}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="expenses" className="mt-0 space-y-6 outline-none">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Expense Journal</h3>
                                <p className="text-sm text-slate-500 font-medium">Track outflows and operational costs for {monthNames[selectedMonth - 1]}.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => downloadMonthlyExpensesReport(
                                        collections.filter(c => c.transactionType === "Expense"),
                                        selectedCompany,
                                        monthNames[selectedMonth - 1],
                                        selectedYear
                                    )}
                                    className="gap-2 border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200"
                                    disabled={collections.filter(c => c.transactionType === "Expense").length === 0}
                                >
                                    <Download className="h-4 w-4" />
                                    Download Report
                                </Button>
                                <Button
                                    onClick={() => {
                                        setSelectedExpense(null);
                                        setIsExpenseOpen(true);
                                    }}
                                    disabled={isReadOnly}
                                    variant="outline"
                                    className="gap-2 bg-red-500 text-white"
                                >
                                    {isReadOnly ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    Record Expense
                                </Button>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-2">
                            <DataTable
                                columns={historyColumns(handleExpenseEditOpen, handleHistoryDeleteClick, downloadPaymentReceipt, isReadOnly)}
                                data={collections
                                    .filter(c => c.transactionType === "Expense")
                                    .sort((a, b) => new Date(b.collectionDate || b.createdAt).getTime() - new Date(a.collectionDate || a.createdAt).getTime())
                                }
                                filterKey="payerName"
                                hidePagination={true}
                                isLoading={isLoading}
                            />
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            <CreateSaleDialog
                open={isCreateOpen}
                onOpenChange={(open) => {
                    setIsCreateOpen(open);
                    if (!open) setSelectedSale(null);
                }}
                onSubmit={handleCreateSale}
                isLoading={isLoading}
                sale={selectedSale}
            />

            <CollectPaymentDialog
                open={isCollectOpen}
                onOpenChange={(open) => {
                    setIsCollectOpen(open);
                    if (!open) setSelectedSale(null);
                }}
                onSubmit={handleCollectSubmit}
                isLoading={isLoading}
                sale={selectedSale}
            />

            <CreateDirectCollectionDialog
                open={isDirectCollectionOpen}
                onOpenChange={(open) => {
                    setIsDirectCollectionOpen(open);
                    if (!open) setSelectedDirectCollection(null);
                }}
                onSubmit={handleCreateDirectCollection}
                isLoading={isLoading}
                collection={selectedDirectCollection}
            />

            <RecordExpenseDialog
                open={isExpenseOpen}
                onOpenChange={(open) => {
                    setIsExpenseOpen(open);
                    if (!open) setSelectedExpense(null);
                }}
                onSubmit={handleRecordExpense}
                isLoading={isLoading}
                expense={selectedExpense}
            />

            <ConfirmDialog
                open={isConfirmDeleteOpen}
                onOpenChange={setIsConfirmDeleteOpen}
                onConfirm={handleConfirmDelete}
                isLoading={isLoading}
                title="Delete Sale Entry?"
                description="Are you sure you want to delete this sale? This action cannot be undone."
            />

            <ConfirmDialog
                open={isConfirmSaveOpen}
                onOpenChange={setIsConfirmSaveOpen}
                onConfirm={handleConfirmSave}
                isLoading={isLoading}
                title="Update Sale Entry?"
                description="Are you sure you want to update this sale?"
                variant="default"
                confirmText="Update Now"
            />

            <ConfirmDialog
                open={isConfirmExpenseDeleteOpen}
                onOpenChange={setIsConfirmExpenseDeleteOpen}
                onConfirm={handleConfirmExpenseDelete}
                isLoading={isLoading}
                title="Delete Expense?"
                description="Are you sure you want to delete this expense record?"
            />

            <ConfirmDialog
                open={isConfirmCollectionDeleteOpen}
                onOpenChange={setIsConfirmCollectionDeleteOpen}
                onConfirm={handleConfirmCollectionDelete}
                isLoading={isLoading}
                title="Delete Income Collection?"
                description="Are you sure you want to delete this collection record?"
            />

            {/* Edit Account Type Dialog */}
            <AlertDialog open={!!editAccountItem} onOpenChange={(open) => { if (!open) { setEditAccountItem(null); setEditAccountValue(""); } }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Account Type</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update the destination account for <span className="font-semibold text-slate-700">{editAccountItem?.payerName}</span>&apos;s collection.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid grid-cols-3 gap-3 py-4">
                        {["Company Bank", "Personal Bank", "Cash"].map((acc) => (
                            <Button
                                key={acc}
                                variant={editAccountValue === acc ? "default" : "outline"}
                                className={cn(
                                    "text-sm font-medium",
                                    editAccountValue === acc ? "" : "text-slate-600",
                                    acc === "Company Bank" && editAccountValue !== acc ? "hover:bg-blue-50 hover:text-blue-700" : "",
                                    acc === "Personal Bank" && editAccountValue !== acc ? "hover:bg-purple-50 hover:text-purple-700" : "",
                                    acc === "Cash" && editAccountValue !== acc ? "hover:bg-emerald-50 hover:text-emerald-700" : ""
                                )}
                                onClick={() => setEditAccountValue(acc)}
                                disabled={editAccountItem?.destinationAccount === acc}
                            >
                                {acc}
                            </Button>
                        ))}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmAccountUpdate}
                            disabled={!editAccountValue || editAccountValue === editAccountItem?.destinationAccount}
                        >
                            Update Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
