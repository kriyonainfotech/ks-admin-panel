export interface PaymentSale {
    id: string;
    title: string;
    totalAmount: number;
    collectedAmount: number;
    lossAmount: number;
    remainingAmount: number;
    status: "Pending" | "Partial" | "Cleared" | "Written Off";
    saleDate: string;
    isGuest: boolean;
    guestName?: string;
    guestPhone?: string;
    client?: {
        id: string;
        businessName: string;
    };
}

export interface PaymentCollection {
    id: string;
    saleId?: string;
    payerName: string;
    amountCollected: number;
    amountLoss: number;
    paymentMode: "Cash" | "Online" | "Cheque" | "UPI" | "Bank Transfer";
    destinationAccount: "Personal" | "Company";
    collectionDate: string;
    notes?: string;
    transactionType: "Income" | "Expense";
}

export const dummyTransactions: PaymentCollection[] = [
    {
        id: "1",
        payerName: "Kirtan (Self)",
        amountCollected: 100,
        amountLoss: 0,
        paymentMode: "Cash",
        destinationAccount: "Personal",
        collectionDate: new Date().toISOString(),
        notes: "Notebook for office",
        transactionType: "Expense"
    },
    {
        id: "2",
        payerName: "Nayan (Self)",
        amountCollected: 500,
        amountLoss: 0,
        paymentMode: "Online",
        destinationAccount: "Personal",
        collectionDate: new Date().toISOString(),
        notes: "Petrol filling",
        transactionType: "Expense"
    }
];