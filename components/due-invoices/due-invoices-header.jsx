"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export function DueInvoicesHeader({ onSearch, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Due Invoices</h2>
        <p className="text-muted-foreground">
          View and manage outstanding payments
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by invoice or purchase number..."
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
            <SelectItem value="sale">Receivables (From Customers)</SelectItem>
            <SelectItem value="purchase">Payables (To Suppliers)</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => onFilterChange("aging", value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Aging" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Aging</SelectItem>
            <SelectItem value="current">Current</SelectItem>
            <SelectItem value="0-30">0-30 days</SelectItem>
            <SelectItem value="30-60">30-60 days</SelectItem>
            <SelectItem value="60-90">60-90 days</SelectItem>
            <SelectItem value="90+">90+ days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
