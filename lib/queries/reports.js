// Get sales report with date range
export async function getSalesReport(supabase, dateFrom, dateTo) {
  let query = supabase
    .from("sales")
    .select(
      `
      id,
      invoice_number,
      sale_date,
      total_amount,
      paid_amount,
      balance_amount,
      payment_status,
      total_cost,
      total_profit,
      customer:customers(name, business_name)
    `
    )
    .order("sale_date", { ascending: false });

  if (dateFrom) {
    query = query.gte("sale_date", dateFrom);
  }

  if (dateTo) {
    query = query.lte("sale_date", dateTo);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Calculate summary
  const summary = {
    total_sales: data.length,
    total_revenue: data.reduce((sum, s) => sum + parseFloat(s.total_amount), 0),
    total_paid: data.reduce((sum, s) => sum + parseFloat(s.paid_amount), 0),
    total_due: data.reduce((sum, s) => sum + parseFloat(s.balance_amount), 0),
    total_profit: data.reduce(
      (sum, s) => sum + (parseFloat(s.total_profit) || 0),
      0
    ),
    avg_sale_value:
      data.length > 0
        ? data.reduce((sum, s) => sum + parseFloat(s.total_amount), 0) /
          data.length
        : 0,
  };

  return { data, summary };
}

// Get purchases report with date range
export async function getPurchasesReport(supabase, dateFrom, dateTo) {
  let query = supabase
    .from("purchases")
    .select(
      `
      id,
      purchase_number,
      purchase_date,
      total_amount,
      paid_amount,
      balance_amount,
      payment_status,
      supplier:suppliers(name)
    `
    )
    .order("purchase_date", { ascending: false });

  if (dateFrom) {
    query = query.gte("purchase_date", dateFrom);
  }

  if (dateTo) {
    query = query.lte("purchase_date", dateTo);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Calculate summary
  const summary = {
    total_purchases: data.length,
    total_amount: data.reduce((sum, p) => sum + parseFloat(p.total_amount), 0),
    total_paid: data.reduce((sum, p) => sum + parseFloat(p.paid_amount), 0),
    total_due: data.reduce((sum, p) => sum + parseFloat(p.balance_amount), 0),
    avg_purchase_value:
      data.length > 0
        ? data.reduce((sum, p) => sum + parseFloat(p.total_amount), 0) /
          data.length
        : 0,
  };

  return { data, summary };
}

// Get profit & loss report
export async function getProfitLossReport(supabase, dateFrom, dateTo) {
  const [salesResult, purchasesResult] = await Promise.all([
    getSalesReport(supabase, dateFrom, dateTo),
    getPurchasesReport(supabase, dateFrom, dateTo),
  ]);

  const summary = {
    total_revenue: salesResult.summary.total_revenue,
    total_cost: purchasesResult.summary.total_amount,
    gross_profit: salesResult.summary.total_profit,
    net_profit:
      salesResult.summary.total_revenue - purchasesResult.summary.total_amount,
    profit_margin:
      salesResult.summary.total_revenue > 0
        ? (salesResult.summary.total_profit /
            salesResult.summary.total_revenue) *
          100
        : 0,
  };

  return { sales: salesResult, purchases: purchasesResult, summary };
}

// Get stock report
export async function getStockReport(supabase) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  // Calculate summary
  const summary = {
    total_products: data.length,
    total_stock_value: data.reduce(
      (sum, p) => sum + parseFloat(p.current_stock) * parseFloat(p.mrp),
      0
    ),
    low_stock_items: data.filter((p) => p.current_stock <= p.min_stock_level)
      .length,
    out_of_stock: data.filter((p) => p.current_stock === 0).length,
  };

  return { data, summary };
}

// Get customer report
export async function getCustomerReport(supabase, dateFrom, dateTo) {
  // Get all customers
  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("id, name, business_name, phone, email")
    .order("name");

  if (customersError) throw customersError;

  // Get sales for each customer
  const customersWithSales = await Promise.all(
    customers.map(async (customer) => {
      let salesQuery = supabase
        .from("sales")
        .select("total_amount, balance_amount")
        .eq("customer_id", customer.id);

      if (dateFrom) {
        salesQuery = salesQuery.gte("sale_date", dateFrom);
      }

      if (dateTo) {
        salesQuery = salesQuery.lte("sale_date", dateTo);
      }

      const { data: sales } = await salesQuery;

      const total_sales = sales?.length || 0;
      const total_amount =
        sales?.reduce((sum, s) => sum + parseFloat(s.total_amount), 0) || 0;
      const total_due =
        sales?.reduce((sum, s) => sum + parseFloat(s.balance_amount), 0) || 0;

      return {
        ...customer,
        total_sales,
        total_amount,
        total_due,
      };
    })
  );

  // Filter out customers with no sales and sort by total amount
  const activeCustomers = customersWithSales
    .filter((c) => c.total_sales > 0)
    .sort((a, b) => b.total_amount - a.total_amount);

  const summary = {
    total_customers: activeCustomers.length,
    total_revenue: activeCustomers.reduce((sum, c) => sum + c.total_amount, 0),
    total_due: activeCustomers.reduce((sum, c) => sum + c.total_due, 0),
    avg_customer_value:
      activeCustomers.length > 0
        ? activeCustomers.reduce((sum, c) => sum + c.total_amount, 0) /
          activeCustomers.length
        : 0,
  };

  return { data: activeCustomers, summary };
}

// Get supplier report
export async function getSupplierReport(supabase, dateFrom, dateTo) {
  // Get all suppliers
  const { data: suppliers, error: suppliersError } = await supabase
    .from("suppliers")
    .select("id, name, phone, email")
    .order("name");

  if (suppliersError) throw suppliersError;

  // Get purchases for each supplier
  const suppliersWithPurchases = await Promise.all(
    suppliers.map(async (supplier) => {
      let purchasesQuery = supabase
        .from("purchases")
        .select("total_amount, balance_amount")
        .eq("supplier_id", supplier.id);

      if (dateFrom) {
        purchasesQuery = purchasesQuery.gte("purchase_date", dateFrom);
      }

      if (dateTo) {
        purchasesQuery = purchasesQuery.lte("purchase_date", dateTo);
      }

      const { data: purchases } = await purchasesQuery;

      const total_purchases = purchases?.length || 0;
      const total_amount =
        purchases?.reduce((sum, p) => sum + parseFloat(p.total_amount), 0) || 0;
      const total_due =
        purchases?.reduce((sum, p) => sum + parseFloat(p.balance_amount), 0) ||
        0;

      return {
        ...supplier,
        total_purchases,
        total_amount,
        total_due,
      };
    })
  );

  // Filter out suppliers with no purchases and sort by total amount
  const activeSuppliers = suppliersWithPurchases
    .filter((s) => s.total_purchases > 0)
    .sort((a, b) => b.total_amount - a.total_amount);

  const summary = {
    total_suppliers: activeSuppliers.length,
    total_purchases: activeSuppliers.reduce(
      (sum, s) => sum + s.total_amount,
      0
    ),
    total_due: activeSuppliers.reduce((sum, s) => sum + s.total_due, 0),
    avg_supplier_value:
      activeSuppliers.length > 0
        ? activeSuppliers.reduce((sum, s) => sum + s.total_amount, 0) /
          activeSuppliers.length
        : 0,
  };

  return { data: activeSuppliers, summary };
}

// Get payment report
export async function getPaymentReport(supabase, dateFrom, dateTo) {
  let query = supabase
    .from("payments")
    .select("*")
    .order("payment_date", { ascending: false });

  if (dateFrom) {
    query = query.gte("payment_date", dateFrom);
  }

  if (dateTo) {
    query = query.lte("payment_date", dateTo);
  }

  const { data, error } = await query;

  if (error) throw error;

  const summary = {
    total_payments: data.length,
    total_amount: data.reduce((sum, p) => sum + parseFloat(p.amount), 0),
    sale_payments: data.filter((p) => p.payment_type === "sale_payment").length,
    sale_payments_amount: data
      .filter((p) => p.payment_type === "sale_payment")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0),
    purchase_payments: data.filter((p) => p.payment_type === "purchase_payment")
      .length,
    purchase_payments_amount: data
      .filter((p) => p.payment_type === "purchase_payment")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0),
  };

  return { data, summary };
}

// Get monthly sales trend (for charts)
export async function getMonthlySalesTrend(supabase, months = 6) {
  const { data, error } = await supabase
    .from("sales")
    .select("sale_date, total_amount, total_profit")
    .gte(
      "sale_date",
      new Date(new Date().setMonth(new Date().getMonth() - months))
        .toISOString()
        .split("T")[0]
    )
    .order("sale_date");

  if (error) throw error;

  // Group by month
  const monthlyData = data.reduce((acc, sale) => {
    const month = new Date(sale.sale_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    if (!acc[month]) {
      acc[month] = { month, revenue: 0, profit: 0, count: 0 };
    }
    acc[month].revenue += parseFloat(sale.total_amount);
    acc[month].profit += parseFloat(sale.total_profit) || 0;
    acc[month].count += 1;
    return acc;
  }, {});

  return Object.values(monthlyData);
}
