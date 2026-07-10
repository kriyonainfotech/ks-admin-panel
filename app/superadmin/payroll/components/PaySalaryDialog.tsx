"use client";

import { useForm } from "react-hook-form";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { RootState } from "@/src/redux/store";
import { recordSalaryPayment } from "@/src/redux/slices/salarySlice";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";
import { Loader2, Coins, Building2, UserCircle } from "lucide-react";

interface PaySalaryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any;
    month: number;
    year: number;
}

export function PaySalaryDialog({ open, onOpenChange, user, month, year }: PaySalaryDialogProps) {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector((state: RootState) => state.auth.user);
    
    // Ownership Mapping (Synchronized with RecordExpenseDialog)
    const ownerMap: Record<string, string> = {
        "nayanbhisara@kriyonastudio.com": "Kriyona Studio",
        "prarthanavaghani@kriyonastudio.com": "PrimeAdwork",
        "kirtannarola@kriyonastudio.com": "Kriyona Infotech",
    };

    const userCompany = useMemo(() => {
        return ownerMap[currentUser?.email || ""] || null;
    }, [currentUser]);

    const isGlobalAdmin = useMemo(() => {
        return currentUser?.role === "Superadmin";
    }, [currentUser]);

    const { register, handleSubmit, setValue, watch, reset } = useForm({
        defaultValues: {
            amount: 0,
            paymentSource: "Company Bank",
            company: "Kriyona Studio",
            notes: "",
            salaryMonth: month,
            salaryYear: year
        }
    });

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        if (user) {
            const balance = user.earnedBalance - user.paidAmount;
            setValue("amount", Math.max(0, balance));
            setValue("notes", `Salary for ${monthNames[month - 1]} ${year}`);
            
            // Set company based on permissions
            if (isGlobalAdmin) {
                // Global admin uses the user's assigned company or fallback
                setValue("company", user.company || "Kriyona Studio");
            } else if (userCompany) {
                // If standard admin, use their mapped company
                setValue("company", userCompany);
            } else {
                // Fallback for others
                setValue("company", currentUser?.businessName || "Kriyona Studio");
            }

            setValue("salaryMonth", month);
            setValue("salaryYear", year);
        }
    }, [user, month, year, setValue, isGlobalAdmin, userCompany, currentUser]);

    const onSubmit = async (data: any) => {
        try {
            const payload = {
                ...data,
                userId: user._id,
                userName: user.name,
                date: new Date(data.salaryYear, data.salaryMonth - 1, new Date().getDate()),
                salaryMonth: data.salaryMonth,
                salaryYear: data.salaryYear
            };
            
            await dispatch(recordSalaryPayment(payload)).unwrap();
            toast.success(`Salary payment of ₹${data.amount} recorded for ${user.name}`);
            onOpenChange(false);
            reset();
        } catch (error: any) {
            toast.error(error || "Failed to record payment");
        }
    };

    if (!user) return null;

    const companyValue = watch("company");
    const selectedSalaryMonth = watch("salaryMonth");
    const selectedSalaryYear = watch("salaryYear");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px] rounded-lg p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-md">
                            <Coins className="h-5 w-5 text-primary" />
                        </div>
                        Process Salary
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="bg-muted/30 p-3 rounded-md flex items-center gap-3 border border-border mb-1">
                        <UserCircle className="h-9 w-9 text-muted-foreground/50" />
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1">Paying To</p>
                            <p className="text-base font-bold text-foreground tracking-tight leading-none">{user.name}</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">Payment Amount (INR)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">₹</span>
                                <Input 
                                    type="number" 
                                    {...register("amount", { required: true, min: 1 })}
                                    className="pl-7 h-10 rounded-md border-input focus:ring-primary focus:border-primary font-bold text-base"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">Source Account</Label>
                                <Select 
                                    defaultValue="Company Bank" 
                                    onValueChange={(val) => setValue("paymentSource", val)}
                                >
                                    <SelectTrigger className="h-10 rounded-md border-input font-medium text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Company Bank">Company Bank</SelectItem>
                                        <SelectItem value="Personal Bank">Personal Bank</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">Company</Label>
                                <Select 
                                    value={companyValue}
                                    onValueChange={(val) => !(!isGlobalAdmin) && setValue("company", val)}
                                    disabled={!isGlobalAdmin}
                                >
                                    <SelectTrigger className={`h-10 rounded-md border-input font-medium text-sm ${!isGlobalAdmin ? 'bg-muted opacity-80 cursor-not-allowed' : ''}`}>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                            <SelectValue placeholder="Select Company" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isGlobalAdmin ? (
                                            <>
                                                <SelectItem value="Kriyona Studio">Kriyona Studio</SelectItem>
                                                <SelectItem value="PrimeAdwork">PrimeAdwork</SelectItem>
                                                <SelectItem value="Kriyona Infotech">Kriyona Infotech</SelectItem>
                                            </>
                                        ) : (
                                            <SelectItem value={companyValue}>{companyValue}</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">Salary For Month</Label>
                                <Select 
                                    value={selectedSalaryMonth?.toString()} 
                                    onValueChange={(val) => {
                                        setValue("salaryMonth", parseInt(val));
                                        setValue("notes", `Salary for ${monthNames[parseInt(val) - 1]} ${selectedSalaryYear}`);
                                    }}
                                >
                                    <SelectTrigger className="h-10 rounded-md border-input font-medium text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {monthNames.map((m, i) => (
                                            <SelectItem key={m} value={(i + 1).toString()}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">Salary For Year</Label>
                                <Select 
                                    value={selectedSalaryYear?.toString()} 
                                    onValueChange={(val) => {
                                        setValue("salaryYear", parseInt(val));
                                        setValue("notes", `Salary for ${monthNames[selectedSalaryMonth - 1]} ${val}`);
                                    }}
                                >
                                    <SelectTrigger className="h-10 rounded-md border-input font-medium text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[year - 1, year, year + 1].map(y => (
                                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">Notes / Description</Label>
                            <Input 
                                {...register("notes")}
                                placeholder="Add a note..."
                                className="h-10 rounded-md border-input text-sm"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => onOpenChange(false)}
                            className="rounded-md font-semibold text-muted-foreground"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            className="bg-primary hover:bg-primary/90 rounded-md px-6 font-bold uppercase tracking-wider text-[10px] h-10"
                        >
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
