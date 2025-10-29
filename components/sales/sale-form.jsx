"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveCustomers } from "@/lib/queries/customers";
import { getProducts } from "@/lib/queries/products";
import { useAuth } from "@/components/providers/auth-provider";

const saleItemSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  quantity: z.string().min(1, "Quantity is required"),
  mrp: z.string().min(1, "MRP is required"),
  discount_percentage: z.string(),
  selling_price: z.string(),
  total: z.string(),
});

const saleFormSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  sale_date: z.string().min(1, "Sale date is required"),
  items: z.array(saleItemSchema).min(1, "At least one item is required"),
  discount_percentage: z.string(),
  paid_amount: z.string(),
  notes: z.string().optional(),
});

export function SaleForm({ sale, onSubmit, isLoading }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const { profile } = useAuth();
  const supabase = createClient();

  const isAdmin = profile?.role === "admin";

  const form = useForm({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customer_id: sale?.customer_id || "",
      sale_date: sale?.sale_date || new Date().toISOString().split("T")[0],
      items: sale?.sale_items?.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity.toString(),
        mrp: item.mrp.toString(),
        discount_percentage: item.discount_percentage.toString(),
        selling_price: item.selling_price.toString(),
        total: item.total.toString(),
      })) || [
        {
          product_id: "",
          quantity: "0",
          mrp: "0",
          discount_percentage: "0",
          selling_price: "0",
          total: "0",
        },
      ],
      discount_percentage: sale?.discount_percentage?.toString() || "0",
      paid_amount: sale?.paid_amount?.toString() || "0",
      notes: sale?.notes || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Load customers and products
  useEffect(() => {
    const loadData = async () => {
      const [customersData, productsData] = await Promise.all([
        getActiveCustomers(supabase),
        getProducts(supabase, { isActive: true }),
      ]);
      setCustomers(customersData);
      setProducts(productsData);
    };
    loadData();
  }, []);

  // Calculate item total when quantity, MRP, or discount changes
  const calculateItemTotal = (index) => {
    const item = form.getValues(`items.${index}`);
    const quantity = parseFloat(item.quantity) || 0;
    const mrp = parseFloat(item.mrp) || 0;
    const discount = parseFloat(item.discount_percentage) || 0;

    const sellingPrice = mrp - (mrp * discount) / 100;
    const total = sellingPrice * quantity;

    form.setValue(`items.${index}.selling_price`, sellingPrice.toFixed(2));
    form.setValue(`items.${index}.total`, total.toFixed(2));
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    const items = form.getValues("items");
    return items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
  };

  // Calculate final total
  const calculateFinalTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(form.watch("discount_percentage")) || 0;
    return subtotal - (subtotal * discount) / 100;
  };

  const handleSubmit = (values) => {
    const formattedData = {
      ...values,
      discount_percentage: parseFloat(values.discount_percentage) || 0,
      paid_amount: parseFloat(values.paid_amount) || 0,
      items: values.items.map((item) => ({
        product_id: item.product_id,
        quantity: parseFloat(item.quantity),
        mrp: parseFloat(item.mrp),
        discount_percentage: parseFloat(item.discount_percentage) || 0,
        selling_price: parseFloat(item.selling_price),
        total: parseFloat(item.total),
      })),
    };
    onSubmit(formattedData);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header Information */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                        {customer.business_name &&
                          ` (${customer.business_name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sale_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Sale Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Sale Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  product_id: "",
                  quantity: "0",
                  mrp: "0",
                  discount_percentage: "0",
                  selling_price: "0",
                  total: "0",
                })
              }
            >
              <Plus className="mr-2 size-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-4 p-4 border rounded-lg md:grid-cols-6"
              >
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.product_id`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            const product = products.find(
                              (p) => p.id === value
                            );
                            if (product) {
                              form.setValue(
                                `items.${index}.mrp`,
                                product.mrp.toString()
                              );
                              calculateItemTotal(index);
                            }
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} ({product.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qty *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            calculateItemTotal(index);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`items.${index}.mrp`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MRP *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            calculateItemTotal(index);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`items.${index}.discount_percentage`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disc %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            calculateItemTotal(index);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-end gap-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.total`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Total</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(calculateSubtotal())}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Discount:</span>
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="discount_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            className="w-20 text-right"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span>{formatCurrency(calculateFinalTotal())}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Paid Amount:
                </span>
                <FormField
                  control={form.control}
                  name="paid_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="w-32 text-right"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(
                    calculateFinalTotal() -
                      (parseFloat(form.watch("paid_amount")) || 0)
                  )}
                </span>
              </div>
            </div>
          </div>
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
                  placeholder="Additional notes about this sale..."
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
            {isLoading ? "Saving..." : sale ? "Update Sale" : "Create Sale"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
