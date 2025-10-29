"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PurchasesHeader } from "./purchases-header";
import { PurchasesTable } from "./purchases-table";
import { Card, CardContent } from "@/components/ui/card";

export function PurchasesContent({ purchases, suppliers, stats }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filteredPurchases, setFilteredPurchases] = useState(purchases);

  useEffect(() => {
    setFilteredPurchases(purchases);
  }, [purchases]);

  const handleSearch = (search) => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`/dashboard/purchases?${params.toString()}`);
  };

  const handleFilterChange = (filterType, value) => {
    const params = new URLSearchParams(searchParams);

    if (filterType === "supplier") {
      if (value && value !== "all") {
        params.set("supplier", value);
      } else {
        params.delete("supplier");
      }
    }

    if (filterType === "status") {
      if (value && value !== "all") {
        params.set("status", value);
      } else {
        params.delete("status");
      }
    }

    router.push(`/dashboard/purchases?${params.toString()}`);
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
      <PurchasesHeader
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        suppliers={suppliers}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total_purchases}</div>
            <p className="text-xs text-muted-foreground">Total Purchases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {formatCurrency(stats.total_amount)}
            </div>
            <p className="text-xs text-muted-foreground">Total Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {formatCurrency(stats.total_paid)}
            </div>
            <p className="text-xs text-muted-foreground">Amount Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.total_due)}
            </div>
            <p className="text-xs text-muted-foreground">
              Amount Due ({stats.pending_count} pending)
            </p>
          </CardContent>
        </Card>
      </div>

      <PurchasesTable purchases={filteredPurchases} />
    </div>
  );
}
