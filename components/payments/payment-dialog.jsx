"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createPayment, updatePayment } from "@/lib/queries/payments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentForm } from "./payment-form";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PaymentDialog({ payment, open, onOpenChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (payment) {
        // Update existing payment
        await updatePayment(supabase, payment.id, data);
        toast({
          title: "Success",
          description: "Payment updated successfully",
        });
      } else {
        // Create new payment
        await createPayment(supabase, data);
        toast({
          title: "Success",
          description:
            "Payment recorded successfully. Transaction status has been updated.",
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
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {payment ? "Edit Payment" : "Record New Payment"}
          </DialogTitle>
          <DialogDescription>
            {payment
              ? "Update payment information below"
              : "Record a payment received from customer or made to supplier"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-100px)] px-6 pb-6">
          <PaymentForm
            payment={payment}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
