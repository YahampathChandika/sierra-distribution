"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { getPendingPurchases, getPendingSales } from "@/lib/queries/payments";

const paymentFormSchema = z.object({
  payment_type: z.enum(["purchase_payment", "sale_payment"], {
    required_error: "Payment type is required",
  }),
  reference_id: z.string().min(1, "Transaction is required"),
  payment_date: z.string().min(1, "Payment date is required"),
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  payment_method: z.enum(["cash", "bank_transfer", "cheque", "card"], {
    required_error: "Payment method is required",
  }),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

export function PaymentForm({ payment, onSubmit, isLoading }) {
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [pendingSales, setPendingSales] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const supabase = createClient();

  const form = useForm({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      payment_type: payment?.payment_type || "sale_payment",
      reference_id: payment?.reference_id || "",
      payment_date:
        payment?.payment_date || new Date().toISOString().split("T")[0],
      amount: payment?.amount?.toString() || "0",
      payment_method: payment?.payment_method || "cash",
      reference_number: payment?.reference_number || "",
      notes: payment?.notes || "",
    },
  });

  const paymentType = form.watch("payment_type");
  const referenceId = form.watch("reference_id");

  // Load pending transactions
  useEffect(() => {
    const loadData = async () => {
      const [purchases, sales] = await Promise.all([
        getPendingPurchases(supabase),
        getPendingSales(supabase),
      ]);
      setPendingPurchases(purchases);
      setPendingSales(sales);
    };
    loadData();
  }, []);

  // Update selected transaction info when reference changes
  useEffect(() => {
    if (referenceId) {
      if (paymentType === "purchase_payment") {
        const purchase = pendingPurchases.find((p) => p.id === referenceId);
        setSelectedTransaction(purchase);
      } else {
        const sale = pendingSales.find((s) => s.id === referenceId);
        setSelectedTransaction(sale);
      }
    } else {
      setSelectedTransaction(null);
    }
  }, [referenceId, paymentType, pendingPurchases, pendingSales]);

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const transactions =
    paymentType === "purchase_payment" ? pendingPurchases : pendingSales;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Payment Type */}
        <FormField
          control={form.control}
          name="payment_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Type *</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("reference_id", "");
                  setSelectedTransaction(null);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sale_payment">
                    Sale Payment (From Customer)
                  </SelectItem>
                  <SelectItem value="purchase_payment">
                    Purchase Payment (To Supplier)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {paymentType === "sale_payment"
                  ? "Recording payment received from customer"
                  : "Recording payment made to supplier"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Transaction Selection */}
        <FormField
          control={form.control}
          name="reference_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {paymentType === "purchase_payment" ? "Purchase" : "Invoice"} *
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Select ${
                        paymentType === "purchase_payment" ? "purchase" : "sale"
                      }`}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {transactions.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No pending{" "}
                      {paymentType === "purchase_payment"
                        ? "purchases"
                        : "sales"}
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <SelectItem key={transaction.id} value={transaction.id}>
                        {paymentType === "purchase_payment"
                          ? `${transaction.purchase_number} - ${transaction.supplier?.name}`
                          : `${transaction.invoice_number} - ${transaction.customer?.name}`}{" "}
                        | Balance: {formatCurrency(transaction.balance_amount)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Transaction Details Card */}
        {selectedTransaction && (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <h4 className="font-medium text-sm">Transaction Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">
                  {paymentType === "purchase_payment" ? "Supplier" : "Customer"}
                  :
                </span>
                <p className="font-medium">
                  {paymentType === "purchase_payment"
                    ? selectedTransaction.supplier?.name
                    : selectedTransaction.customer?.name}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Transaction #:</span>
                <p className="font-medium">
                  {paymentType === "purchase_payment"
                    ? selectedTransaction.purchase_number
                    : selectedTransaction.invoice_number}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Amount:</span>
                <p className="font-medium">
                  {formatCurrency(selectedTransaction.total_amount)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Balance Due:</span>
                <p className="font-medium text-orange-600">
                  {formatCurrency(selectedTransaction.balance_amount)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {/* Payment Date */}
          <FormField
            control={form.control}
            name="payment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (Rs.) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                {selectedTransaction && (
                  <FormDescription>
                    Max: {formatCurrency(selectedTransaction.balance_amount)}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Payment Method */}
          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reference Number */}
          <FormField
            control={form.control}
            name="reference_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Cheque #, Transaction ID, etc."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Cheque number, transaction ID, or other reference
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes about this payment..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Recording..."
              : payment
              ? "Update Payment"
              : "Record Payment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
