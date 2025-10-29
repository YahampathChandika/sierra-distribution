"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomersHeader } from "./customers-header";
import { CustomersTable } from "./customers-table";
import { Card, CardContent } from "@/components/ui/card";

export function CustomersContent({ customers, cities }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filteredCustomers, setFilteredCustomers] = useState(customers);

  useEffect(() => {
    setFilteredCustomers(customers);
  }, [customers]);

  const handleSearch = (search) => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`/dashboard/customers?${params.toString()}`);
  };

  const handleFilterChange = (filterType, value) => {
    const params = new URLSearchParams(searchParams);

    if (filterType === "customer_type") {
      if (value && value !== "all") {
        params.set("customer_type", value);
      } else {
        params.delete("customer_type");
      }
    }

    if (filterType === "city") {
      if (value && value !== "all") {
        params.set("city", value);
      } else {
        params.delete("city");
      }
    }

    if (filterType === "status") {
      if (value && value !== "all") {
        params.set("status", value);
      } else {
        params.delete("status");
      }
    }

    router.push(`/dashboard/customers?${params.toString()}`);
  };

  // Calculate stats
  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.is_active).length,
    hardwareShops: customers.filter((c) => c.customer_type === "hardware_shop")
      .length,
    electricians: customers.filter((c) => c.customer_type === "electrician")
      .length,
    contractors: customers.filter((c) => c.customer_type === "contractor")
      .length,
  };

  return (
    <div className="space-y-6">
      <CustomersHeader
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        cities={cities}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Active Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.hardwareShops}</div>
            <p className="text-xs text-muted-foreground">Hardware Shops</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {stats.electricians + stats.contractors}
            </div>
            <p className="text-xs text-muted-foreground">
              Electricians & Contractors
            </p>
          </CardContent>
        </Card>
      </div>

      <CustomersTable customers={filteredCustomers} />
    </div>
  );
}
