export interface DeliverableItem {
    serviceId: string;
    name: string;
    serviceName?: string; // Backend uses serviceName
    serviceCategory?: string; // Backend field
    basePrice: number; // Frontend used this
    price?: number; // Backend field
    unitPrice?: number; // Backend field
    quantity: number;
    assignedTo?: string; // Team Member ID
    scheduleConfig?: {
        assignToRole?: string;
    };
}