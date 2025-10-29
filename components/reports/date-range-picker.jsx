"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

export function DateRangePicker({ onApply }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleApply = () => {
    onApply({ dateFrom, dateTo });
  };

  const handleThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setDateFrom(firstDay.toISOString().split("T")[0]);
    setDateTo(lastDay.toISOString().split("T")[0]);
  };

  const handleLastMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);

    setDateFrom(firstDay.toISOString().split("T")[0]);
    setDateTo(lastDay.toISOString().split("T")[0]);
  };

  const handleThisYear = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    const lastDay = new Date(now.getFullYear(), 11, 31);

    setDateFrom(firstDay.toISOString().split("T")[0]);
    setDateTo(lastDay.toISOString().split("T")[0]);
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="size-4 text-muted-foreground" />
        <h3 className="font-semibold">Date Range</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateFrom">From Date</Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateTo">To Date</Label>
          <Input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleThisMonth}>
          This Month
        </Button>
        <Button variant="outline" size="sm" onClick={handleLastMonth}>
          Last Month
        </Button>
        <Button variant="outline" size="sm" onClick={handleThisYear}>
          This Year
        </Button>
        <Button size="sm" onClick={handleApply}>
          Apply Filter
        </Button>
      </div>
    </div>
  );
}
