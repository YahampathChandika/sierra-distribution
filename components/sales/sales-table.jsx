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
import { SaleDialog } from "./sale-dialog";
import { DeleteSaleDialog } from "./delete-sale-dialog";
import { format } from "date-fns";

export function SalesTable({ sales }) {
  const { profile } = useAuth();
  const [selectedSale, setSelectedSale] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const isAdmin = profile?.role === "admin";

  const handleEdit = (sale) => {
    setSelectedSale(sale);
    setIsEditOpen(true);
  };

  const handleDelete = (sale) => {
    setSelectedSale(sale);
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

  if (sales.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No sales found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              {isAdmin && <TableHead className="text-right">Profit</TableHead>}
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">
                  {sale.invoice_number}
                </TableCell>
                <TableCell>
                  <div>
                    {sale.customer?.name || "Unknown Customer"}
                    {sale.customer?.business_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {sale.customer.business_name}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(sale.sale_date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {sale.sale_items?.length || 0} item(s)
                  </div>
                  {sale.sale_items && sale.sale_items.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {sale.sale_items
                        .slice(0, 2)
                        .map((item) => item.product?.name)
                        .join(", ")}
                      {sale.sale_items.length > 2 && "..."}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(sale.total_amount)}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <span className="text-green-600 font-medium">
                      {formatCurrency(sale.total_profit || 0)}
                    </span>
                  </TableCell>
                )}
                <TableCell className="text-right">
                  {formatCurrency(sale.total_amount - sale.balance_amount)}
                </TableCell>
                <TableCell className="text-right">
                  {sale.balance_amount > 0 ? (
                    <span className="text-orange-600 font-medium">
                      {formatCurrency(sale.balance_amount)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getPaymentStatusColor(sale.payment_status)}>
                    {sale.payment_status}
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
                          <DropdownMenuItem onClick={() => handleEdit(sale)}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(sale)}
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
      <SaleDialog
        sale={selectedSale}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      {/* Delete Dialog */}
      <DeleteSaleDialog
        sale={selectedSale}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
