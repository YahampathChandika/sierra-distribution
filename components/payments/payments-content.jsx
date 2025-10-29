"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaymentsHeader } from "./payments-header";
import { PaymentsTable } from "./payments-table";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export function PaymentsContent({ payments, stats }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filteredPayments, setFilteredPayments] = useState(payments);

  useEffect(() => {
    setFilteredPayments(payments);
  }, [payments]);

  const handleSearch = (search) => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`/dashboard/payments?${params.toString()}`);
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

    if (filterType === "method") {
      if (value && value !== "all") {
        params.set("method", value);
      } else {
        params.delete("method");
      }
    }

    router.push(`/dashboard/payments?${params.toString()}`);
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
      <PaymentsHeader
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total_payments}</div>
            <p className="text-xs text-muted-foreground">Total Payments</p>
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
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownLeft className="size-4 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.sale_amount)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Received ({stats.sale_payments} payments)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="size-4 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.purchase_amount)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Paid Out ({stats.purchase_payments} payments)
            </p>
          </CardContent>
        </Card>
      </div>

      <PaymentsTable payments={filteredPayments} />
    </div>
  );
}
