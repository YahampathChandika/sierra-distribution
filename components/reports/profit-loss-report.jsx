"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export function ProfitLossReport({ reportData }) {
  const { summary } = reportData;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6" id="profit-loss-content">
      <h2 className="text-2xl font-bold">Profit & Loss Statement</h2>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_revenue)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="size-4 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(summary.total_cost)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gross Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.gross_profit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Margin: {summary.profit_margin.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Revenue (Sales)</span>
              <span className="font-bold text-green-600">
                {formatCurrency(summary.total_revenue)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">
                Cost of Goods Sold (Purchases)
              </span>
              <span className="font-bold text-orange-600">
                - {formatCurrency(summary.total_cost)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-t-2 border-black">
              <span className="text-lg font-bold">Net Profit</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(summary.net_profit)}
              </span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 mt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Profit Margin:</span>
                <p className="font-semibold text-lg">
                  {summary.profit_margin.toFixed(2)}%
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Revenue vs Cost:</span>
                <p className="font-semibold text-lg">
                  {summary.total_revenue > 0
                    ? (
                        (summary.total_cost / summary.total_revenue) *
                        100
                      ).toFixed(2)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
