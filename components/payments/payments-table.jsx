"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
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
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { PaymentDialog } from "./payment-dialog";
import { DeletePaymentDialog } from "./delete-payment-dialog";
import { format } from "date-fns";

export function PaymentsTable({ payments }) {
  const { profile } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const isAdmin = profile?.role === "admin";

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setIsEditOpen(true);
  };

  const handleDelete = (payment) => {
    setSelectedPayment(payment);
    setIsDeleteOpen(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cash: "Cash",
      bank_transfer: "Bank Transfer",
      cheque: "Cheque",
      card: "Card",
    };
    return methods[method] || method;
  };

  if (payments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No payments found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Party</TableHead>
              <TableHead>Transaction #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  {payment.payment_number}
                </TableCell>
                <TableCell>
                  {payment.payment_type === "sale_payment" ? (
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft className="size-4 text-green-600" />
                      <span className="text-sm">Received</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="size-4 text-orange-600" />
                      <span className="text-sm">Paid Out</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {payment.party_name || "Unknown"}
                  <p className="text-xs text-muted-foreground mt-1">
                    {payment.payment_type === "sale_payment"
                      ? "Customer"
                      : "Supplier"}
                  </p>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {payment.transaction_number || "-"}
                </TableCell>
                <TableCell>
                  {format(new Date(payment.payment_date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getPaymentMethodLabel(payment.payment_method)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {payment.reference_number ? (
                    <span className="text-xs font-mono">
                      {payment.reference_number}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
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
                      {isAdmin ? (
                        <>
                          <DropdownMenuItem onClick={() => handleEdit(payment)}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(payment)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <DropdownMenuItem disabled>
                          <Eye className="mr-2 size-4" />
                          View Only
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <PaymentDialog
        payment={selectedPayment}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      {/* Delete Dialog */}
      <DeletePaymentDialog
        payment={selectedPayment}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
