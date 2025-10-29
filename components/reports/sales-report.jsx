"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Printer } from "lucide-react";
import { format } from "date-fns";
import { exportToCSV, printReport } from "@/lib/utils/export";

export function SalesReport({ reportData }) {
  const { data, summary } = reportData;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleExport = () => {
    const exportData = data.map((sale) => ({
      "Invoice Number": sale.invoice_number,
      Customer: sale.customer?.name || "Unknown",
      Date: format(new Date(sale.sale_date), "yyyy-MM-dd"),
      "Total Amount": sale.total_amount,
      "Paid Amount": sale.paid_amount,
      Balance: sale.balance_amount,
      Profit: sale.total_profit || 0,
      Status: sale.payment_status,
    }));

    exportToCSV(
      exportData,
      `sales-report-${new Date().toISOString().split("T")[0]}`
    );
  };

  const handlePrint = () => {
    printReport("sales-report-content");
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_sales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.total_revenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.total_profit)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Sale Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.avg_sale_value)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 size-4" />
          Export CSV
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="mr-2 size-4" />
          Print
        </Button>
      </div>

      {/* Report Content */}
      <div id="sales-report-content">
        <h2 className="text-xl font-bold mb-4">Sales Report</h2>

        <div className="summary mb-4">
          <div className="summary-item">
            <strong>Total Sales:</strong> {summary.total_sales}
          </div>
          <div className="summary-item">
            <strong>Total Revenue:</strong>{" "}
            {formatCurrency(summary.total_revenue)}
          </div>
          <div className="summary-item">
            <strong>Total Profit:</strong>{" "}
            {formatCurrency(summary.total_profit)}
          </div>
          <div className="summary-item">
            <strong>Total Due:</strong> {formatCurrency(summary.total_due)}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-sm">
                    {sale.invoice_number}
                  </TableCell>
                  <TableCell>{sale.customer?.name || "Unknown"}</TableCell>
                  <TableCell>
                    {format(new Date(sale.sale_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(sale.total_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(sale.paid_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(sale.balance_amount)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(sale.total_profit || 0)}
                  </TableCell>
                  <TableCell className="capitalize">
                    {sale.payment_status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
