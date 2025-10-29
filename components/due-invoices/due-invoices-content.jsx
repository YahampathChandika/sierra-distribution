"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DueInvoicesHeader } from "./due-invoices-header";
import { DueInvoicesTable } from "./due-invoices-table";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function DueInvoicesContent({ invoices, stats }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filteredInvoices, setFilteredInvoices] = useState(invoices);

  useEffect(() => {
    setFilteredInvoices(invoices);
  }, [invoices]);

  const handleSearch = (search) => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`/dashboard/due-invoices?${params.toString()}`);
  };

  const handleFilterChange = (filterType, value) => {
    const params = new URLSearchParams(searchParams);

    if (filterType === "type") {
      if (value && value !== "all") {
        params.set("type", value);
      } else {
        params.delete("type");
      }
    }

    if (filterType === "aging") {
      if (value && value !== "all") {
        params.set("aging", value);
      } else {
        params.delete("aging");
      }
    }

    router.push(`/dashboard/due-invoices?${params.toString()}`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <DueInvoicesHeader
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total_due_sales}</div>
            <p className="text-xs text-muted-foreground">Receivables Count</p>
            <p className="text-sm font-semibold text-green-600 mt-1">
              {formatCurrency(stats.total_due_sales_amount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {stats.total_due_purchases}
            </div>
            <p className="text-xs text-muted-foreground">Payables Count</p>
            <p className="text-sm font-semibold text-orange-600 mt-1">
              {formatCurrency(stats.total_due_purchases_amount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              {stats.overdue_sales > 0 && (
                <AlertTriangle className="size-4 text-orange-600" />
              )}
              <div className="text-2xl font-bold">{stats.overdue_sales}</div>
            </div>
            <p className="text-xs text-muted-foreground">Overdue Receivables</p>
            <p className="text-xs text-muted-foreground mt-1">(30+ days old)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              {stats.overdue_purchases > 0 && (
                <AlertTriangle className="size-4 text-red-600" />
              )}
              <div className="text-2xl font-bold">
                {stats.overdue_purchases}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Overdue Payables</p>
            <p className="text-xs text-muted-foreground mt-1">(30+ days old)</p>
          </CardContent>
        </Card>
      </div>

      {/* Aging Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Receivables Aging</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current:</span>
                <span className="font-medium">{stats.sales_aging.current}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">0-30 days:</span>
                <span className="font-medium">{stats.sales_aging["0-30"]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">30-60 days:</span>
                <span className="font-medium text-orange-600">
                  {stats.sales_aging["30-60"]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">60-90 days:</span>
                <span className="font-medium text-orange-700">
                  {stats.sales_aging["60-90"]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">90+ days:</span>
                <span className="font-medium text-red-600">
                  {stats.sales_aging["90+"]}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Payables Aging</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current:</span>
                <span className="font-medium">
                  {stats.purchases_aging.current}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">0-30 days:</span>
                <span className="font-medium">
                  {stats.purchases_aging["0-30"]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">30-60 days:</span>
                <span className="font-medium text-orange-600">
                  {stats.purchases_aging["30-60"]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">60-90 days:</span>
                <span className="font-medium text-orange-700">
                  {stats.purchases_aging["60-90"]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">90+ days:</span>
                <span className="font-medium text-red-600">
                  {stats.purchases_aging["90+"]}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DueInvoicesTable invoices={filteredInvoices} />
    </div>
  );
}
