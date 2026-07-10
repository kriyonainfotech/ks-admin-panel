// lib/subscriptionData.ts
import { DeliverableItem } from "@/src/types/subscription";

export interface AssignPackagePayload {
    clientId: string;
    startDate: string;
    endDate?: string;
    billingCycle: "Monthly" | "Yearly";
    packageData: {
        templateId: string | null;
        name: string;
        items: DeliverableItem[];
    };
}

export interface Subscription {
    _id: string;
    client: string;
    packageName?: string;
    packageTemplate?: string | null;
    startDate: string;
    endDate: string;
    deliverables: DeliverableItem[];
    status: "Active" | "Completed" | "Cancelled";
    createdAt: string;
    updatedAt: string;
}

export interface AssignPackageResponse {
    success: boolean;
    message: string;
    data: Subscription;
}

export interface GetSubscriptionsResponse {
    success: boolean;
    data: Subscription[];
}

export interface UpdateSubscriptionPayload {
    id: string;
    packageName?: string;
    deliverables?: DeliverableItem[];
    startDate?: string;
    endDate?: string;
}
