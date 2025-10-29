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
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { PurchaseDialog } from "./purchase-dialog";
import { DeletePurchaseDialog } from "./delete-purchase-dialog";
import { format } from "date-fns";

export function PurchasesTable({ purchases }) {
  const { profile } = useAuth();
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const isAdmin = profile?.role === "admin";

  const handleEdit = (purchase) => {
    setSelectedPurchase(purchase);
    setIsEditOpen(true);
  };

  const handleDelete = (purchase) => {
    setSelectedPurchase(purchase);
    setIsDeleteOpen(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "default";
      case "partial":
        return "secondary";
      case "pending":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (purchases.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No purchases found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Purchase #</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="font-medium">
                  {purchase.purchase_number}
                  {purchase.supplier_invoice_number && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Inv: {purchase.supplier_invoice_number}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {purchase.supplier?.name || "Unknown Supplier"}
                </TableCell>
                <TableCell>
                  {format(new Date(purchase.purchase_date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {purchase.purchase_items?.length || 0} item(s)
                  </div>
                  {purchase.purchase_items &&
                    purchase.purchase_items.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {purchase.purchase_items
                          .slice(0, 2)
                          .map((item) => item.product?.name)
                          .join(", ")}
                        {purchase.purchase_items.length > 2 && "..."}
                      </div>
                    )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(purchase.total_amount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    purchase.total_amount - purchase.balance_amount
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {purchase.balance_amount > 0 ? (
                    <span className="text-orange-600 font-medium">
                      {formatCurrency(purchase.balance_amount)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getPaymentStatusColor(purchase.payment_status)}
                  >
                    {purchase.payment_status}
                  </Badge>
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
                          <DropdownMenuItem
                            onClick={() => handleEdit(purchase)}
                          >
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(purchase)}
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
      <PurchaseDialog
        purchase={selectedPurchase}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      {/* Delete Dialog */}
      <DeletePurchaseDialog
        purchase={selectedPurchase}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
