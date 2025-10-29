"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createSale, updateSale } from "@/lib/queries/sales";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SaleForm } from "./sale-form";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SaleDialog({ sale, open, onOpenChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      const { items, ...saleData } = data;

      if (sale) {
        // Update existing sale
        await updateSale(supabase, sale.id, saleData, items);
        toast({
          title: "Success",
          description: "Sale updated successfully",
        });
      } else {
        // Create new sale
        await createSale(supabase, saleData, items);
        toast({
          title: "Success",
          description: "Sale created successfully. Stock has been updated.",
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
          <DialogTitle>{sale ? "Edit Sale" : "Create New Sale"}</DialogTitle>
          <DialogDescription>
            {sale
              ? "Update sale information below"
              : "Fill in the sale details and add items"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-100px)] px-6 pb-6">
          <SaleForm sale={sale} onSubmit={handleSubmit} isLoading={isLoading} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
