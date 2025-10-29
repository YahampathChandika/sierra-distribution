"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SuppliersHeader } from "./suppliers-header";
import { SuppliersTable } from "./suppliers-table";
import { Card, CardContent } from "@/components/ui/card";

export function SuppliersContent({ suppliers, cities }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filteredSuppliers, setFilteredSuppliers] = useState(suppliers);

  useEffect(() => {
    setFilteredSuppliers(suppliers);
  }, [suppliers]);

  const handleSearch = (search) => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`/dashboard/suppliers?${params.toString()}`);
  };

  const handleFilterChange = (filterType, value) => {
    const params = new URLSearchParams(searchParams);

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

    router.push(`/dashboard/suppliers?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <SuppliersHeader
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        cities={cities}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">Total Suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {suppliers.filter((s) => s.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Active Suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{cities.length}</div>
            <p className="text-xs text-muted-foreground">Cities</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {suppliers.filter((s) => !s.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Inactive Suppliers</p>
          </CardContent>
        </Card>
      </div>

      <SuppliersTable suppliers={filteredSuppliers} />
    </div>
  );
}
