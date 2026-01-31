"use client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const ExportReportButton = ({ data }: { data: any[] }) => {
  const downloadCSV = () => {
    const headers = ["Order Number,Customer,Product,Total,Date\n"];
    const rows = data.map(item => 
      `${item.order.orderNumber},${item.order.customer.firstName},${item.product.name},${item.totalPrice},${item.createdAt.toLocaleDateString()}`
    );
    
    const blob = new Blob([headers + rows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leaseo-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Button variant="outline" size="sm" onClick={downloadCSV}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
};