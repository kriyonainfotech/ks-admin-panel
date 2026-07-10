"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchCompanies, createCompany, updateCompany, deleteCompany } from "@/src/redux/slices/companySlice";
import { fetchSuperAdmins, fetchAdmins } from "@/src/redux/slices/adminSlice"; // To assign owners and admins
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Pencil, Trash2, Building2, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export default function CompaniesPage() {
    const dispatch = useAppDispatch();
    const { companies, isLoading } = useAppSelector((state) => state.companies);
    const { superadmins, admins } = useAppSelector((state) => state.admin); // For Owner dropdown and Admins list

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<any | null>(null);
    const [formData, setFormData] = useState({ name: "", ownerId: "", adminIds: [] as string[] });

    const allPotentialAdmins = [...superadmins, ...admins];

    useEffect(() => {
        dispatch(fetchCompanies());
        dispatch(fetchSuperAdmins());
        dispatch(fetchAdmins());
    }, [dispatch]);

    const handleOpenDialog = (company?: any) => {
        if (company) {
            setEditingCompany(company);
            setFormData({ 
                name: company.name, 
                ownerId: company.owner?._id || "",
                adminIds: company.admins?.map((a: any) => a._id || a) || []
            });
        } else {
            setEditingCompany(null);
            setFormData({ name: "", ownerId: "", adminIds: [] });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name) return;

        if (editingCompany) {
            await dispatch(updateCompany({ id: editingCompany._id, data: formData }));
        } else {
            await dispatch(createCompany(formData));
        }
        setIsDialogOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this company?")) {
            await dispatch(deleteCompany(id));
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Companies</h1>
                    <p className="text-slate-500 mt-1">Manage all registered companies and their owners.</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Company
                </Button>
            </div>

            {/* COMPANIES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full h-40 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : companies.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No companies found</h3>
                        <p className="text-slate-500">Get started by creating a new company.</p>
                    </div>
                ) : (
                    companies.map((company) => (
                        <div key={company._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{company.name}</h3>
                                        <span className="text-xs text-slate-500">Created {format(new Date(company.createdAt), "MMM d, yyyy")}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => handleOpenDialog(company)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(company._id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-4">
                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Primary Owner</h4>
                                    {company.owner ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                <User className="h-3 w-3 text-slate-500" />
                                            </div>
                                            <div className="text-sm font-medium text-slate-700">
                                                {company.owner.name}
                                                <span className="text-xs text-slate-400 font-normal ml-1">({company.owner.email})</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <Badge variant="outline" className="text-slate-400 font-normal">No Owner Assigned</Badge>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Admins ({company.admins?.length || 0})</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {company.admins && company.admins.length > 0 ? (
                                            company.admins.map((admin: any) => (
                                                <Badge key={admin._id || admin} variant="secondary" className="text-[10px] py-0 px-2 h-5 font-normal">
                                                    {admin.name || "Admin"}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">No additional admins</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* DIALOG */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCompany ? "Edit Company" : "Add New Company"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Company Name</Label>
                            <Input
                                placeholder="Ex: Kriyona Studio"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Assign Owner (Superadmin)</Label>
                            <Select
                                value={formData.ownerId}
                                onValueChange={(val) => setFormData({ ...formData, ownerId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Superadmin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {superadmins.map((admin) => (
                                        <SelectItem key={admin._id} value={admin._id}>
                                            {admin.name} ({admin.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Manage Admins (Access Control)</Label>
                            <ScrollArea className="h-[150px] w-full border rounded-md p-2">
                                <div className="space-y-2">
                                    {allPotentialAdmins.map((admin) => (
                                        <div key={admin._id} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`admin-${admin._id}`} 
                                                checked={formData.adminIds.includes(admin._id)}
                                                onCheckedChange={(checked) => {
                                                    const newAdminIds = checked 
                                                        ? [...formData.adminIds, admin._id]
                                                        : formData.adminIds.filter(id => id !== admin._id);
                                                    setFormData({ ...formData, adminIds: newAdminIds });
                                                }}
                                            />
                                            <label 
                                                htmlFor={`admin-${admin._id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {admin.name} <span className="text-xs text-slate-400">({admin.email})</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>{editingCompany ? "Update" : "Create"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
