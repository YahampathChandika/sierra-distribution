"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { PaymentDialog } from "./payment-dialog";

export function PaymentsHeader({ onSearch, onFilterChange }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">
            Track and record payment transactions
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Record Payment
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by payment number or reference..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select onValueChange={(value) => onFilterChange("type", value)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sale_payment">Sale Payments</SelectItem>
            <SelectItem value="purchase_payment">Purchase Payments</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => onFilterChange("method", value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Create Dialog */}
      <PaymentDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
