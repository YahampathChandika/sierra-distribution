// Get all sales with customer info
export async function getSales(supabase, filters = {}) {
  let query = supabase
    .from("sales")
    .select(
      `
      *,
      customer:customers(id, name, business_name),
      sale_items(
        id,
        quantity,
        mrp,
        discount_percentage,
        selling_price,
        total,
        cost_price,
        profit,
        product:products(id, name, unit)
      )
    `
    )
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters.search) {
    query = query.or(`invoice_number.ilike.%${filters.search}%`);
  }

  if (filters.customerId) {
    query = query.eq("customer_id", filters.customerId);
  }

  if (filters.paymentStatus) {
    query = query.eq("payment_status", filters.paymentStatus);
  }

  if (filters.dateFrom) {
    query = query.gte("sale_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("sale_date", filters.dateTo);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

// Get single sale by ID with all details
export async function getSale(supabase, id) {
  const { data, error } = await supabase
    .from("sales")
    .select(
      `
      *,
      customer:customers(id, name, business_name, phone, email),
      sale_items(
        id,
        quantity,
        mrp,
        discount_percentage,
        selling_price,
        total,
        cost_price,
        profit,
        product:products(id, name, unit, sku)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Get average cost price for a product
async function getAverageCostPrice(supabase, productId) {
  const { data, error } = await supabase
    .from("purchase_items")
    .select("cost_price, quantity")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(10); // Use last 10 purchases for average

  if (error || !data || data.length === 0) {
    return 0;
  }

  // Calculate weighted average
  const totalCost = data.reduce(
    (sum, item) =>
      sum + parseFloat(item.cost_price) * parseFloat(item.quantity),
    0
  );
  const totalQuantity = data.reduce(
    (sum, item) => sum + parseFloat(item.quantity),
    0
  );

  return totalQuantity > 0 ? totalCost / totalQuantity : 0;
}

// Create new sale with items
export async function createSale(supabase, saleData, items) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Generate invoice number
  const { data: invoiceNumber } = await supabase.rpc("generate_invoice_number");

  // Get cost prices and calculate profit for each item
  const itemsWithProfit = await Promise.all(
    items.map(async (item) => {
      const costPrice = await getAverageCostPrice(supabase, item.product_id);
      const profit =
        (parseFloat(item.selling_price) - costPrice) *
        parseFloat(item.quantity);

      return {
        ...item,
        cost_price: costPrice,
        profit: profit,
      };
    })
  );

  // Calculate totals
  const subtotal = itemsWithProfit.reduce(
    (sum, item) => sum + parseFloat(item.total),
    0
  );
  const discountAmount =
    (subtotal * parseFloat(saleData.discount_percentage || 0)) / 100;
  const totalAmount = subtotal - discountAmount;
  const totalCost = itemsWithProfit.reduce(
    (sum, item) =>
      sum + parseFloat(item.cost_price) * parseFloat(item.quantity),
    0
  );
  const totalProfit = totalAmount - totalCost;

  // Insert sale
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      invoice_number: invoiceNumber,
      customer_id: saleData.customer_id,
      sale_date: saleData.sale_date,
      subtotal: subtotal,
      discount_percentage: parseFloat(saleData.discount_percentage || 0),
      discount_amount: discountAmount,
      total_amount: totalAmount,
      paid_amount: parseFloat(saleData.paid_amount || 0),
      balance_amount: totalAmount - parseFloat(saleData.paid_amount || 0),
      payment_status:
        parseFloat(saleData.paid_amount || 0) >= totalAmount
          ? "paid"
          : parseFloat(saleData.paid_amount || 0) > 0
          ? "partial"
          : "pending",
      total_cost: totalCost,
      total_profit: totalProfit,
      notes: saleData.notes,
      created_by: user.id,
    })
    .select()
    .single();

  if (saleError) throw saleError;

  // Insert sale items
  const itemsToInsert = itemsWithProfit.map((item) => ({
    sale_id: sale.id,
    product_id: item.product_id,
    quantity: parseFloat(item.quantity),
    mrp: parseFloat(item.mrp),
    discount_percentage: parseFloat(item.discount_percentage || 0),
    selling_price: parseFloat(item.selling_price),
    total: parseFloat(item.total),
    cost_price: item.cost_price,
    profit: item.profit,
  }));

  const { error: itemsError } = await supabase
    .from("sale_items")
    .insert(itemsToInsert);

  if (itemsError) throw itemsError;

  return sale;
}

// Update sale (Admin only)
export async function updateSale(supabase, id, saleData, items) {
  // Get existing sale to compare
  const { data: existingSale } = await supabase
    .from("sales")
    .select("*")
    .eq("id", id)
    .single();

  // Get cost prices and calculate profit for each item
  const itemsWithProfit = await Promise.all(
    items.map(async (item) => {
      const costPrice = await getAverageCostPrice(supabase, item.product_id);
      const profit =
        (parseFloat(item.selling_price) - costPrice) *
        parseFloat(item.quantity);

      return {
        ...item,
        cost_price: costPrice,
        profit: profit,
      };
    })
  );

  // Calculate new totals
  const subtotal = itemsWithProfit.reduce(
    (sum, item) => sum + parseFloat(item.total),
    0
  );
  const discountAmount =
    (subtotal * parseFloat(saleData.discount_percentage || 0)) / 100;
  const totalAmount = subtotal - discountAmount;
  const totalCost = itemsWithProfit.reduce(
    (sum, item) =>
      sum + parseFloat(item.cost_price) * parseFloat(item.quantity),
    0
  );
  const totalProfit = totalAmount - totalCost;

  // Update sale
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .update({
      customer_id: saleData.customer_id,
      sale_date: saleData.sale_date,
      subtotal: subtotal,
      discount_percentage: parseFloat(saleData.discount_percentage || 0),
      discount_amount: discountAmount,
      total_amount: totalAmount,
      balance_amount: totalAmount - existingSale.paid_amount,
      payment_status:
        existingSale.paid_amount >= totalAmount
          ? "paid"
          : existingSale.paid_amount > 0
          ? "partial"
          : "pending",
      total_cost: totalCost,
      total_profit: totalProfit,
      notes: saleData.notes,
    })
    .eq("id", id)
    .select()
    .single();

  if (saleError) throw saleError;

  // Delete old items and insert new ones
  await supabase.from("sale_items").delete().eq("sale_id", id);

  const itemsToInsert = itemsWithProfit.map((item) => ({
    sale_id: sale.id,
    product_id: item.product_id,
    quantity: parseFloat(item.quantity),
    mrp: parseFloat(item.mrp),
    discount_percentage: parseFloat(item.discount_percentage || 0),
    selling_price: parseFloat(item.selling_price),
    total: parseFloat(item.total),
    cost_price: item.cost_price,
    profit: item.profit,
  }));

  const { error: itemsError } = await supabase
    .from("sale_items")
    .insert(itemsToInsert);

  if (itemsError) throw itemsError;

  return sale;
}

// Delete sale (Admin only)
export async function deleteSale(supabase, id) {
  // Items will be deleted via CASCADE
  const { error } = await supabase.from("sales").delete().eq("id", id);

  if (error) throw error;
}

// Get sales statistics
export async function getSalesStats(supabase, filters = {}) {
  let query = supabase
    .from("sales")
    .select("total_amount, balance_amount, payment_status, total_profit");

  if (filters.dateFrom) {
    query = query.gte("sale_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("sale_date", filters.dateTo);
  }

  const { data, error } = await query;

  if (error) throw error;

  const stats = {
    total_sales: data.length,
    total_amount: data.reduce((sum, s) => sum + parseFloat(s.total_amount), 0),
    total_paid: data.reduce(
      (sum, s) =>
        sum + (parseFloat(s.total_amount) - parseFloat(s.balance_amount)),
      0
    ),
    total_due: data.reduce((sum, s) => sum + parseFloat(s.balance_amount), 0),
    total_profit: data.reduce(
      (sum, s) => sum + (parseFloat(s.total_profit) || 0),
      0
    ),
    pending_count: data.filter((s) => s.payment_status === "pending").length,
  };

  return stats;
}
