"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createSupplier, updateSupplier } from "@/lib/queries/suppliers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SupplierForm } from "./supplier-form";
import { useToast } from "@/hooks/use-toast";

export function SupplierDialog({ supplier, open, onOpenChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (supplier) {
        // Update existing supplier
        await updateSupplier(supabase, supplier.id, data);
        toast({
          title: "Success",
          description: "Supplier updated successfully",
        });
      } else {
        // Create new supplier
        await createSupplier(supabase, data);
        toast({
          title: "Success",
          description: "Supplier created successfully",
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
            {supplier ? "Edit Supplier" : "Create New Supplier"}
          </DialogTitle>
          <DialogDescription>
            {supplier
              ? "Update supplier information below"
              : "Fill in the supplier details below"}
          </DialogDescription>
        </DialogHeader>
        <SupplierForm
          supplier={supplier}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
