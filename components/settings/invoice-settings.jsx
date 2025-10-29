"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateSettings } from "@/lib/queries/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";

export function InvoiceSettings({ initialSettings }) {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    invoice_prefix: initialSettings.invoice_prefix || "INV",
    purchase_prefix: initialSettings.purchase_prefix || "PUR",
    payment_prefix: initialSettings.payment_prefix || "PAY",
  });
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateSettings(supabase, settings);
      toast({
        title: "Success",
        description: "Invoice settings updated successfully",
      });
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="size-5" />
          <CardTitle>Invoice & Numbering</CardTitle>
        </div>
        <CardDescription>
          Configure invoice prefixes and numbering format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
            <Input
              id="invoice_prefix"
              value={settings.invoice_prefix}
              onChange={(e) =>
                setSettings({ ...settings, invoice_prefix: e.target.value })
              }
              placeholder="INV"
            />
            <p className="text-xs text-muted-foreground">
              Example: {settings.invoice_prefix}-000001
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase_prefix">Purchase Prefix</Label>
            <Input
              id="purchase_prefix"
              value={settings.purchase_prefix}
              onChange={(e) =>
                setSettings({ ...settings, purchase_prefix: e.target.value })
              }
              placeholder="PUR"
            />
            <p className="text-xs text-muted-foreground">
              Example: {settings.purchase_prefix}-000001
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_prefix">Payment Prefix</Label>
            <Input
              id="payment_prefix"
              value={settings.payment_prefix}
              onChange={(e) =>
                setSettings({ ...settings, payment_prefix: e.target.value })
              }
              placeholder="PAY"
            />
            <p className="text-xs text-muted-foreground">
              Example: {settings.payment_prefix}-000001
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
