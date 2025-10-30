"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createPurchase, updatePurchase } from "@/lib/queries/purchases";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PurchaseForm } from "./purchase-form";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PurchaseDialog({ purchase, open, onOpenChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      const { items, ...purchaseData } = data;

      if (purchase) {
        // Update existing purchase
        await updatePurchase(supabase, purchase.id, purchaseData, items);
        toast({
          title: "Success",
          description: "Purchase updated successfully",
        });
      } else {
        // Create new purchase
        await createPurchase(supabase, purchaseData, items);
        toast({
          title: "Success",
          description: "Purchase created successfully. Stock has been updated.",
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
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {purchase ? "Edit Purchase" : "Create New Purchase"}
          </DialogTitle>
          <DialogDescription>
            {purchase
              ? "Update purchase information below"
              : "Fill in the purchase details and add items"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-100px)] px-6 pb-6">
          <PurchaseForm
            purchase={purchase}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
