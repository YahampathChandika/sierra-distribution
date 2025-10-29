// Get all due purchases (amounts we owe to suppliers)
export async function getDuePurchases(supabase, filters = {}) {
  let query = supabase
    .from("purchases")
    .select(
      `
      id,
      purchase_number,
      supplier_id,
      purchase_date,
      total_amount,
      paid_amount,
      balance_amount,
      payment_status,
      supplier:suppliers(id, name, phone, email)
    `
    )
    .gt("balance_amount", 0)
    .order("purchase_date", { ascending: true });

  if (filters.supplierId) {
    query = query.eq("supplier_id", filters.supplierId);
  }

  if (filters.search) {
    query = query.or(`purchase_number.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Add aging information
  const today = new Date();
  return data.map((purchase) => {
    const purchaseDate = new Date(purchase.purchase_date);
    const daysOverdue = Math.floor(
      (today - purchaseDate) / (1000 * 60 * 60 * 24)
    );

    let agingCategory = "current";
    if (daysOverdue > 90) agingCategory = "90+";
    else if (daysOverdue > 60) agingCategory = "60-90";
    else if (daysOverdue > 30) agingCategory = "30-60";
    else if (daysOverdue > 0) agingCategory = "0-30";

    return {
      ...purchase,
      days_overdue: daysOverdue,
      aging_category: agingCategory,
      type: "purchase",
    };
  });
}

// Get all due sales (amounts customers owe us)
export async function getDueSales(supabase, filters = {}) {
  let query = supabase
    .from("sales")
    .select(
      `
      id,
      invoice_number,
      customer_id,
      sale_date,
      total_amount,
      paid_amount,
      balance_amount,
      payment_status,
      customer:customers(id, name, business_name, phone, email)
    `
    )
    .gt("balance_amount", 0)
    .order("sale_date", { ascending: true });

  if (filters.customerId) {
    query = query.eq("customer_id", filters.customerId);
  }

  if (filters.search) {
    query = query.or(`invoice_number.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Add aging information
  const today = new Date();
  return data.map((sale) => {
    const saleDate = new Date(sale.sale_date);
    const daysOverdue = Math.floor((today - saleDate) / (1000 * 60 * 60 * 24));

    let agingCategory = "current";
    if (daysOverdue > 90) agingCategory = "90+";
    else if (daysOverdue > 60) agingCategory = "60-90";
    else if (daysOverdue > 30) agingCategory = "30-60";
    else if (daysOverdue > 0) agingCategory = "0-30";

    return {
      ...sale,
      days_overdue: daysOverdue,
      aging_category: agingCategory,
      type: "sale",
    };
  });
}

// Get all due invoices (combined)
export async function getAllDueInvoices(supabase, filters = {}) {
  const [duePurchases, dueSales] = await Promise.all([
    getDuePurchases(supabase, filters),
    getDueSales(supabase, filters),
  ]);

  let combined = [];

  // Add purchases if filter allows
  if (!filters.type || filters.type === "purchase") {
    combined = [...combined, ...duePurchases];
  }

  // Add sales if filter allows
  if (!filters.type || filters.type === "sale") {
    combined = [...combined, ...dueSales];
  }

  // Apply aging filter
  if (filters.aging && filters.aging !== "all") {
    combined = combined.filter((item) => item.aging_category === filters.aging);
  }

  // Sort by days overdue (oldest first)
  combined.sort((a, b) => b.days_overdue - a.days_overdue);

  return combined;
}

// Get due invoices statistics
export async function getDueInvoicesStats(supabase) {
  const [duePurchases, dueSales] = await Promise.all([
    getDuePurchases(supabase, {}),
    getDueSales(supabase, {}),
  ]);

  const stats = {
    // Purchase stats
    total_due_purchases: duePurchases.length,
    total_due_purchases_amount: duePurchases.reduce(
      (sum, p) => sum + parseFloat(p.balance_amount),
      0
    ),

    // Sale stats
    total_due_sales: dueSales.length,
    total_due_sales_amount: dueSales.reduce(
      (sum, s) => sum + parseFloat(s.balance_amount),
      0
    ),

    // Aging breakdown for sales (receivables)
    sales_aging: {
      current: dueSales.filter((s) => s.aging_category === "current").length,
      "0-30": dueSales.filter((s) => s.aging_category === "0-30").length,
      "30-60": dueSales.filter((s) => s.aging_category === "30-60").length,
      "60-90": dueSales.filter((s) => s.aging_category === "60-90").length,
      "90+": dueSales.filter((s) => s.aging_category === "90+").length,
    },

    // Aging breakdown for purchases (payables)
    purchases_aging: {
      current: duePurchases.filter((p) => p.aging_category === "current")
        .length,
      "0-30": duePurchases.filter((p) => p.aging_category === "0-30").length,
      "30-60": duePurchases.filter((p) => p.aging_category === "30-60").length,
      "60-90": duePurchases.filter((p) => p.aging_category === "60-90").length,
      "90+": duePurchases.filter((p) => p.aging_category === "90+").length,
    },

    // Overdue counts
    overdue_purchases: duePurchases.filter((p) => p.days_overdue > 30).length,
    overdue_sales: dueSales.filter((s) => s.days_overdue > 30).length,
  };

  return stats;
}

// Get top debtors (customers who owe most)
export async function getTopDebtors(supabase, limit = 5) {
  const dueSales = await getDueSales(supabase, {});

  // Group by customer
  const customerDebts = dueSales.reduce((acc, sale) => {
    const customerId = sale.customer_id;
    if (!acc[customerId]) {
      acc[customerId] = {
        customer_id: customerId,
        customer_name: sale.customer?.name,
        business_name: sale.customer?.business_name,
        total_due: 0,
        invoice_count: 0,
      };
    }
    acc[customerId].total_due += parseFloat(sale.balance_amount);
    acc[customerId].invoice_count += 1;
    return acc;
  }, {});

  // Convert to array and sort
  return Object.values(customerDebts)
    .sort((a, b) => b.total_due - a.total_due)
    .slice(0, limit);
}

// Get top creditors (suppliers we owe most)
export async function getTopCreditors(supabase, limit = 5) {
  const duePurchases = await getDuePurchases(supabase, {});

  // Group by supplier
  const supplierDebts = duePurchases.reduce((acc, purchase) => {
    const supplierId = purchase.supplier_id;
    if (!acc[supplierId]) {
      acc[supplierId] = {
        supplier_id: supplierId,
        supplier_name: purchase.supplier?.name,
        total_due: 0,
        purchase_count: 0,
      };
    }
    acc[supplierId].total_due += parseFloat(purchase.balance_amount);
    acc[supplierId].purchase_count += 1;
    return acc;
  }, {});

  // Convert to array and sort
  return Object.values(supplierDebts)
    .sort((a, b) => b.total_due - a.total_due)
    .slice(0, limit);
}
