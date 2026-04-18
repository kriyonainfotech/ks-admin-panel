// 1. Service Item (The Ingredient)
export enum ServiceCategory {
    Design = "design",
    Video = "video",
    Marketing = "marketing",
    Branding = "branding",
    Web = "web"
}

export enum ServiceStatus {
    Active = "active",
    Archived = "archived"
}

export interface ServiceItem {
    _id: string; // Mongoose ID
    name: string;
    category: ServiceCategory;
    unitPrice: number; // Renamed from basePrice to match backend
    unitName: string;  // Renamed from unit to match backend
    status: ServiceStatus;
    createdAt?: string;
}

// 2. Package Template (The Menu Item)
export interface PackageTemplate {
    _id: string; // Mongoose ID
    packageName: string; // Renamed from name
    description?: string;

    // The Recipe
    lineItems: {
        item: ServiceItem | string; // Populated Object or ID
        quantity: number;
    }[];
    sellingPrice: number;
    isArchived: boolean;
    createdAt?: string;
}

// UI Friendly format for Package Listing (if different)
export type Package = PackageTemplate;

// Default initial state for Redux (Empty)
export const initialServices: ServiceItem[] = [];
export const initialPackages: PackageTemplate[] = [];