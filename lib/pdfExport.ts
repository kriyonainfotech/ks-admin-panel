import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable: { finalY: number };
}

const GST_RATE = 0.18;
const PRIMARY_COLOR: [number, number, number] = [31, 41, 55];
const ACCENT_COLOR: [number, number, number] = [37, 99, 235];

const formatCurrency = (amount: number) => {
    return `Rs. ${Math.round(amount).toLocaleString("en-IN")}`;
};

const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
};

export const downloadGSTBill = (sale: any) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const clientName = sale.isGuest ? sale.guestName : sale.client?.businessName || "N/A";
    const totalAmount: number = sale.totalAmount;
    const baseAmount = Math.round(totalAmount / (1 + GST_RATE));
    const gstAmount = totalAmount - baseAmount;

    // 1. Header & Brand
    doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.rect(0, 0, 210, 40, "F"); // Top Bar
    
    doc.setFontSize(24);
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.text("TAX INVOICE", 20, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${sale._id.slice(-6).toUpperCase()}`, 190, 25, { align: "right" });

    // 2. Info Section
    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    
    // Left: Client Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO", 20, 55);
    doc.setFontSize(12);
    doc.text(clientName, 20, 62);
    
    // Right: Sale Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DATE", 140, 55);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(sale.saleDate), 140, 62);
    
    doc.setFont("helvetica", "bold");
    doc.text("STATUS", 140, 72);
    doc.setFont("helvetica", "normal");
    doc.text(sale.status.toUpperCase(), 140, 79);

    // 3. Items Table
    autoTable(doc, {
        startY: 90,
        head: [["Description", "Base Price", "GST (18%)", "Total"]],
        body: [[
            sale.title,
            formatCurrency(baseAmount),
            formatCurrency(gstAmount),
            formatCurrency(totalAmount),
        ]],
        theme: "striped",
        headStyles: { fillColor: ACCENT_COLOR, textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 6 },
        columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right' },
            3: { halign: 'right' },
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 120;

    // 4. Calculation Summary (Right Aligned)
    const summaryX = 130;
    doc.setFontSize(10);
    doc.setTextColor(100);
    
    doc.text("Base Amount:", summaryX, finalY + 15);
    doc.text(formatCurrency(baseAmount), 190, finalY + 15, { align: "right" });

    doc.text("GST (18%):", summaryX, finalY + 22);
    doc.text(formatCurrency(gstAmount), 190, finalY + 22, { align: "right" });

    // Line separator
    doc.setDrawColor(200);
    doc.line(summaryX, finalY + 26, 190, finalY + 26);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
    doc.text("Total Payable:", summaryX, finalY + 34);
    doc.text(formatCurrency(totalAmount), 190, finalY + 34, { align: "right" });

    // Payment Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Collected:", summaryX, finalY + 44);
    doc.text(formatCurrency(totalAmount - sale.remainingAmount), 190, finalY + 44, { align: "right" });
    
    doc.setFont("helvetica", "bold");
    const balanceColor: [number, number, number] = sale.remainingAmount > 0 ? [220, 38, 38] : [16, 185, 129];
    doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
    doc.text("Balance Due:", summaryX, finalY + 52);
    doc.text(formatCurrency(sale.remainingAmount), 190, finalY + 52, { align: "right" });

    // 5. Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont("helvetica", "italic");
    doc.text("This is an electronically generated GST bill. No signature required.", 105, 285, { align: "center" });

    doc.save(`GST_Bill_${clientName.replace(/\s+/g, "_")}.pdf`);
};

export const downloadInvoice = (sale: any) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const clientName = sale.isGuest ? sale.guestName : sale.client?.businessName || "N/A";

    // Header bar
    doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.rect(0, 0, 210, 40, "F");

    doc.setFontSize(24);
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${sale._id.slice(-6).toUpperCase()}`, 190, 25, { align: "right" });

    // Client & sale info
    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO", 20, 55);
    doc.setFontSize(12);
    doc.text(clientName, 20, 62);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DATE", 140, 55);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(sale.saleDate), 140, 62);

    doc.setFont("helvetica", "bold");
    doc.text("STATUS", 140, 72);
    doc.setFont("helvetica", "normal");
    doc.text(sale.status.toUpperCase(), 140, 79);

    // Items table
    autoTable(doc, {
        startY: 90,
        head: [["Description", "Amount"]],
        body: [[sale.title, formatCurrency(sale.totalAmount)]],
        theme: "striped",
        headStyles: { fillColor: ACCENT_COLOR, textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 6 },
        columnStyles: { 1: { halign: "right" } },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 120;

    const summaryX = 130;
    doc.setDrawColor(200);
    doc.line(summaryX, finalY + 10, 190, finalY + 10);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
    doc.text("Total Payable:", summaryX, finalY + 18);
    doc.text(formatCurrency(sale.totalAmount), 190, finalY + 18, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Collected:", summaryX, finalY + 28);
    doc.text(formatCurrency(sale.totalAmount - sale.remainingAmount), 190, finalY + 28, { align: "right" });

    doc.setFont("helvetica", "bold");
    const balanceColor: [number, number, number] = sale.remainingAmount > 0 ? [220, 38, 38] : [16, 185, 129];
    doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
    doc.text("Balance Due:", summaryX, finalY + 36);
    doc.text(formatCurrency(sale.remainingAmount), 190, finalY + 36, { align: "right" });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont("helvetica", "italic");
    doc.text("This is an electronically generated invoice. No signature required.", 105, 285, { align: "center" });

    doc.save(`Invoice_${clientName.replace(/\s+/g, "_")}.pdf`);
};

export const downloadSaleInvoice = downloadInvoice;

export const downloadPaymentReceipt = (payment: any) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.rect(0, 0, 210, 40, "F");

    doc.setFontSize(24);
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT RECEIPT", 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Receipt #: ${payment._id.slice(-6).toUpperCase()}`, 190, 25, { align: "right" });

    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RECEIVED FROM", 20, 55);
    doc.setFontSize(12);
    doc.text(payment.payerName, 20, 62);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DATE", 140, 55);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(payment.collectionDate), 140, 62);
    doc.setFont("helvetica", "bold");
    doc.text("ACCOUNT", 140, 72);
    doc.setFont("helvetica", "normal");
    doc.text(payment.destinationAccount || "N/A", 140, 79);

    autoTable(doc, {
        startY: 90,
        head: [["Purpose", "Amount Received"]],
        body: [[payment.title || payment.purpose || "Payment Received", formatCurrency(payment.amountCollected)]],
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129] as [number, number, number], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 6 },
        columnStyles: { 1: { halign: "right" } },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 120;

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text(`Amount Received: ${formatCurrency(payment.amountCollected)}`, 105, finalY + 20, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for your business!", 105, 285, { align: "center" });

    doc.save(`Receipt_${payment.payerName.replace(/\s+/g, "_")}.pdf`);
};

export const downloadMonthlySalesReport = (sales: any[], company: string, month: string, year: number) => {
    const doc = new jsPDF("l", "mm", "a4") as jsPDFWithAutoTable;

    doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.rect(0, 0, 297, 35, "F");

    doc.setFontSize(20);
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.text(`SALES REPORT — ${company.toUpperCase()}`, 148, 18, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`${month} ${year}`, 148, 27, { align: "center" });

    const tableData = sales.map((s, i) => [
        i + 1,
        formatDate(s.saleDate),
        s.isGuest ? s.guestName : s.client?.businessName || "N/A",
        s.title,
        formatCurrency(s.totalAmount),
        formatCurrency(s.totalAmount - s.remainingAmount),
        formatCurrency(s.remainingAmount),
        s.status,
    ]);

    autoTable(doc, {
        startY: 42,
        head: [["#", "Date", "Client", "Work", "Total", "Collected", "Balance", "Status"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: ACCENT_COLOR, textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 247, 250] as [number, number, number] },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 4: { halign: "right" }, 5: { halign: "right" }, 6: { halign: "right" } },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 50;

    const totalSales = sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const totalCollected = sales.reduce((acc, s) => acc + (s.totalAmount - s.remainingAmount || 0), 0);
    const totalBalance = sales.reduce((acc, s) => acc + (s.remainingAmount || 0), 0);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.text(`Total Sales: ${formatCurrency(totalSales)}`, 20, finalY + 12);
    doc.text(`Total Collected: ${formatCurrency(totalCollected)}`, 110, finalY + 12);
    doc.text(`Total Balance: ${formatCurrency(totalBalance)}`, 200, finalY + 12);

    doc.save(`Sales_Report_${company}_${month}_${year}.pdf`);
};

export const downloadMonthlyCollectionsReport = (collections: any[], company: string, month: string, year: number) => {
    const doc = new jsPDF("l", "mm", "a4") as jsPDFWithAutoTable;

    // Header bar
    doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.rect(0, 0, 297, 35, "F");

    doc.setFontSize(20);
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.text(`COLLECTIONS REPORT — ${company.toUpperCase()}`, 148, 18, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`${month} ${year}`, 148, 27, { align: "center" });

    const tableData = collections.map((c, i) => [
        i + 1,
        formatDate(c.collectionDate || c.createdAt),
        c.payerName || "N/A",
        c.title || c.purpose || "Payment Received",
        c.destinationAccount || "N/A",
        formatCurrency(c.amountCollected),
    ]);

    autoTable(doc, {
        startY: 42,
        head: [["#", "Date", "Payer", "Purpose", "Account", "Amount"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129] as [number, number, number], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 247, 250] as [number, number, number] },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 5: { halign: "right" } },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 50;

    const totalCollected = collections.reduce((acc, c) => acc + (c.amountCollected || 0), 0);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.text(`Total Collected: ${formatCurrency(totalCollected)}`, 20, finalY + 12);

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont("helvetica", "italic");
    doc.text("This is an electronically generated collections report.", 148, 200, { align: "center" });

    doc.save(`Collections_Report_${company}_${month}_${year}.pdf`);
};

export const downloadMonthlyExpensesReport = (expenses: any[], company: string, month: string, year: number) => {
    const doc = new jsPDF("l", "mm", "a4") as jsPDFWithAutoTable;

    const EXPENSE_COLOR: [number, number, number] = [220, 38, 38];

    doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.rect(0, 0, 297, 35, "F");

    doc.setFontSize(20);
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.text(`EXPENSE REPORT — ${company.toUpperCase()}`, 148, 18, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`${month} ${year}`, 148, 27, { align: "center" });

    const tableData = expenses.map((e, i) => [
        i + 1,
        formatDate(e.collectionDate || e.createdAt),
        e.payerName || "N/A",
        e.title || e.purpose || "Expense",
        e.destinationAccount || "N/A",
        formatCurrency(e.amountCollected),
    ]);

    autoTable(doc, {
        startY: 42,
        head: [["#", "Date", "Paid To", "Description", "Account", "Amount"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: EXPENSE_COLOR, textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 247, 250] as [number, number, number] },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 5: { halign: "right" } },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 50;

    const totalExpenses = expenses.reduce((acc, e) => acc + (e.amountCollected || 0), 0);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(EXPENSE_COLOR[0], EXPENSE_COLOR[1], EXPENSE_COLOR[2]);
    doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, 20, finalY + 12);

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont("helvetica", "italic");
    doc.text("This is an electronically generated expense report.", 148, 200, { align: "center" });

    doc.save(`Expense_Report_${company}_${month}_${year}.pdf`);
};
