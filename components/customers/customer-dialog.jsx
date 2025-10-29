"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createCustomer, updateCustomer } from "@/lib/queries/customers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerForm } from "./customer-form";
import { useToast } from "@/hooks/use-toast";

export function CustomerDialog({ customer, open, onOpenChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (customer) {
        // Update existing customer
        await updateCustomer(supabase, customer.id, data);
        toast({
          title: "Success",
          description: "Customer updated successfully",
        });
      } else {
        // Create new customer
        await createCustomer(supabase, data);
        toast({
          title: "Success",
          description: "Customer created successfully",
        });
      }
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Edit Customer" : "Create New Customer"}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? "Update customer information below"
              : "Fill in the customer details below"}
          </DialogDescription>
        </DialogHeader>
        <CustomerForm
          customer={customer}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
