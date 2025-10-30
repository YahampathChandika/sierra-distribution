"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateSettings } from "@/lib/queries/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

export function BusinessSettings({ initialSettings }) {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    business_name: initialSettings.business_name || "",
    business_address: initialSettings.business_address || "",
    business_phone: initialSettings.business_phone || "",
    business_email: initialSettings.business_email || "",
    tax_number: initialSettings.tax_number || "",
  });
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateSettings(supabase, settings);
      toast({
        title: "Success",
        description: "Business settings updated successfully",
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
          <Building2 className="size-5" />
          <CardTitle>Business Information</CardTitle>
        </div>
        <CardDescription>
          Update your business details and contact information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name *</Label>
            <Input
              id="business_name"
              value={settings.business_name}
              onChange={(e) =>
                setSettings({ ...settings, business_name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_address">Address</Label>
            <Textarea
              id="business_address"
              value={settings.business_address}
              onChange={(e) =>
                setSettings({ ...settings, business_address: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business_phone">Phone</Label>
              <Input
                id="business_phone"
                type="tel"
                value={settings.business_phone}
                onChange={(e) =>
                  setSettings({ ...settings, business_phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_email">Email</Label>
              <Input
                id="business_email"
                type="email"
                value={settings.business_email}
                onChange={(e) =>
                  setSettings({ ...settings, business_email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_number">Tax/VAT Number</Label>
            <Input
              id="tax_number"
              value={settings.tax_number}
              onChange={(e) =>
                setSettings({ ...settings, tax_number: e.target.value })
              }
            />
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
