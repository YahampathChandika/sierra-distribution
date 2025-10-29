"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { SalesHeader } from "./sales-header";
import { SalesTable } from "./sales-table";
import { Card, CardContent } from "@/components/ui/card";

export function SalesContent({ sales, customers, stats }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuth();
  const [filteredSales, setFilteredSales] = useState(sales);

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    setFilteredSales(sales);
  }, [sales]);

  const handleSearch = (search) => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`/dashboard/sales?${params.toString()}`);
  };

  const handleFilterChange = (filterType, value) => {
    const params = new URLSearchParams(searchParams);

    if (filterType === "customer") {
      if (value && value !== "all") {
        params.set("customer", value);
      } else {
        params.delete("customer");
      }
    }

    if (filterType === "status") {
      if (value && value !== "all") {
        params.set("status", value);
      } else {
        params.delete("status");
      }
    }

    router.push(`/dashboard/sales?${params.toString()}`);
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
      <SalesHeader
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        customers={customers}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total_sales}</div>
            <p className="text-xs text-muted-foreground">Total Sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {formatCurrency(stats.total_amount)}
            </div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        {isAdmin && (
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.total_profit)}
              </div>
              <p className="text-xs text-muted-foreground">Total Profit</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {formatCurrency(stats.total_paid)}
            </div>
            <p className="text-xs text-muted-foreground">Amount Collected</p>
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

      <SalesTable sales={filteredSales} />
    </div>
  );
}
