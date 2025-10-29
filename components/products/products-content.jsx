"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductsHeader } from "./products-header";
import { ProductsTable } from "./products-table";
import { Card, CardContent } from "@/components/ui/card";

export function ProductsContent({ products, categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const handleSearch = (search) => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`/dashboard/products?${params.toString()}`);
  };

  const handleFilterChange = (filterType, value) => {
    const params = new URLSearchParams(searchParams);

    if (filterType === "category") {
      if (value && value !== "all") {
        params.set("category", value);
      } else {
        params.delete("category");
      }
    }

    if (filterType === "status") {
      if (value && value !== "all") {
        params.set("status", value);
      } else {
        params.delete("status");
      }
    }

    router.push(`/dashboard/products?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <ProductsHeader
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        categories={categories}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {products.filter((p) => p.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Active Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {
                products.filter((p) => p.current_stock <= p.min_stock_level)
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Low Stock Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
      </div>

      <ProductsTable products={filteredProducts} />
    </div>
  );
}
