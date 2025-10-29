"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CreditCard, AlertTriangle } from "lucide-react";
import { QuickPaymentDialog } from "./quick-payment-dialog";
import { format } from "date-fns";

export function DueInvoicesTable({ invoices }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleQuickPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentOpen(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getAgingBadge = (agingCategory, daysOverdue) => {
    if (agingCategory === "current") {
      return <Badge variant="outline">Current</Badge>;
    } else if (agingCategory === "0-30") {
      return <Badge variant="secondary">0-30 days</Badge>;
    } else if (agingCategory === "30-60") {
      return (
        <Badge variant="default" className="bg-orange-500">
          30-60 days
        </Badge>
      );
    } else if (agingCategory === "60-90") {
      return (
        <Badge variant="default" className="bg-orange-600">
          60-90 days
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="size-3" />
          90+ days
        </Badge>
      );
    }
  };

  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No due invoices found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Party</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Aging</TableHead>
              <TableHead>Days</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={`${invoice.type}-${invoice.id}`}>
                <TableCell>
                  <Badge
                    variant={invoice.type === "sale" ? "default" : "secondary"}
                  >
                    {invoice.type === "sale" ? "Receivable" : "Payable"}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {invoice.type === "sale"
                    ? invoice.invoice_number
                    : invoice.purchase_number}
                </TableCell>
                <TableCell>
                  <div>
                    {invoice.type === "sale"
                      ? invoice.customer?.name
                      : invoice.supplier?.name}
                    {invoice.type === "sale" &&
                      invoice.customer?.business_name && (
                        <p className="text-xs text-muted-foreground">
                          {invoice.customer.business_name}
                        </p>
                      )}
                  </div>
                </TableCell>
                <TableCell>
                  {format(
                    new Date(
                      invoice.type === "sale"
                        ? invoice.sale_date
                        : invoice.purchase_date
                    ),
                    "MMM dd, yyyy"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(invoice.total_amount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(invoice.paid_amount)}
                </TableCell>
                <TableCell className="text-right font-semibold text-orange-600">
                  {formatCurrency(invoice.balance_amount)}
                </TableCell>
                <TableCell>
                  {getAgingBadge(invoice.aging_category, invoice.days_overdue)}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      invoice.days_overdue > 60
                        ? "text-red-600 font-medium"
                        : invoice.days_overdue > 30
                        ? "text-orange-600 font-medium"
                        : ""
                    }
                  >
                    {invoice.days_overdue}{" "}
                    {invoice.days_overdue === 1 ? "day" : "days"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="size-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleQuickPayment(invoice)}
                      >
                        <CreditCard className="mr-2 size-4" />
                        Record Payment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Quick Payment Dialog */}
      <QuickPaymentDialog
        invoice={selectedInvoice}
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
      />
    </>
  );
}
