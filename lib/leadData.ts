export interface Lead {
    id: string;
    date: string; // ISO Date "2025-12-07"
    name: string; // User/Client Name
    businessName: string;
    phone: string;
    city: string;
    purpose: string;
    status: string; // Dynamic String (e.g. "Interested", "Fake", "Call Not Picked")
    notes: string;
    company?: string; // Optional company ID
}

// Initial Default Statuses (User can add more)
export const defaultStatuses = [
    // "Call Not Received",
    // "Interested",
    // "Follow Up Done",
    // "Converted",
    // "Fake/Junk"
];

export const initialLeadData: Lead[] = [
    {
        id: "ld_1",
        date: "2025-12-01",
        name: "Amit Shah",
        businessName: "Shah Textiles",
        phone: "9876543210",
        city: "Surat",
        purpose: "Social Media",
        status: "Interested",
        notes: "Wants to start from next month. Budget 15k.",
    },
    {
        id: "ld_2",
        date: "2025-12-02",
        name: "Riya Patel",
        businessName: "Riya Salon",
        phone: "9123456789",
        city: "Ahmedabad",
        purpose: "Marketing",
        status: "Call Not Received",
        notes: "Tried calling twice.",
    },
];