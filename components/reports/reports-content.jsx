"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "./date-range-picker";
import { SalesReport } from "./sales-report";
import { ProfitLossReport } from "./profit-loss-report";
import { Card } from "@/components/ui/card";

export function ReportsContent({ initialData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "sales"
  );

  const handleDateRangeApply = ({ dateFrom, dateTo }) => {
    const params = new URLSearchParams(searchParams);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    params.set("tab", activeTab);
    router.push(`/dashboard/reports?${params.toString()}`);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`/dashboard/reports?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Generate business reports and analytics
        </p>
      </div>

      <DateRangePicker onApply={handleDateRangeApply} />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="purchases">Purchases Report</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <SalesReport reportData={initialData.sales} />
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Purchases Report</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Purchases
                  </p>
                  <p className="text-2xl font-bold">
                    {initialData.purchases.summary.total_purchases}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat("en-LK", {
                      style: "currency",
                      currency: "LKR",
                    }).format(initialData.purchases.summary.total_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat("en-LK", {
                      style: "currency",
                      currency: "LKR",
                    }).format(initialData.purchases.summary.total_paid)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Due</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {new Intl.NumberFormat("en-LK", {
                      style: "currency",
                      currency: "LKR",
                    }).format(initialData.purchases.summary.total_due)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="profit-loss" className="space-y-4">
          <ProfitLossReport reportData={initialData.profitLoss} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
