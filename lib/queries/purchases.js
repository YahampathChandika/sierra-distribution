// Get all purchases with supplier info
export async function getPurchases(supabase, filters = {}) {
  let query = supabase
    .from("purchases")
    .select(
      `
      *,
      supplier:suppliers(id, name),
      purchase_items(
        id,
        quantity,
        mrp,
        discount_percentage,
        cost_price,
        total,
        product:products(id, name, unit)
      )
    `
    )
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters.search) {
    query = query.or(
      `purchase_number.ilike.%${filters.search}%,supplier_invoice_number.ilike.%${filters.search}%`
    );
  }

  if (filters.supplierId) {
    query = query.eq("supplier_id", filters.supplierId);
  }

  if (filters.paymentStatus) {
    query = query.eq("payment_status", filters.paymentStatus);
  }

  if (filters.dateFrom) {
    query = query.gte("purchase_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("purchase_date", filters.dateTo);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

// Get single purchase by ID with all details
export async function getPurchase(supabase, id) {
  const { data, error } = await supabase
    .from("purchases")
    .select(
      `
      *,
      supplier:suppliers(id, name, phone, email),
      purchase_items(
        id,
        quantity,
        mrp,
        discount_percentage,
        cost_price,
        total,
        product:products(id, name, unit, sku)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Create new purchase with items
export async function createPurchase(supabase, purchaseData, items) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Generate purchase number
  const { data: purchaseNumber } = await supabase.rpc(
    "generate_purchase_number"
  );

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total), 0);
  const discountAmount =
    (subtotal * parseFloat(purchaseData.discount_percentage || 0)) / 100;
  const totalAmount = subtotal - discountAmount;

  // Insert purchase
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      purchase_number: purchaseNumber,
      supplier_id: purchaseData.supplier_id,
      purchase_date: purchaseData.purchase_date,
      supplier_invoice_number: purchaseData.supplier_invoice_number,
      subtotal: subtotal,
      discount_percentage: parseFloat(purchaseData.discount_percentage || 0),
      discount_amount: discountAmount,
      total_amount: totalAmount,
      paid_amount: parseFloat(purchaseData.paid_amount || 0),
      balance_amount: totalAmount - parseFloat(purchaseData.paid_amount || 0),
      payment_status:
        parseFloat(purchaseData.paid_amount || 0) >= totalAmount
          ? "paid"
          : parseFloat(purchaseData.paid_amount || 0) > 0
          ? "partial"
          : "pending",
      notes: purchaseData.notes,
      created_by: user.id,
    })
    .select()
    .single();

  if (purchaseError) throw purchaseError;

  // Insert purchase items
  const itemsToInsert = items.map((item) => ({
    purchase_id: purchase.id,
    product_id: item.product_id,
    quantity: parseFloat(item.quantity),
    mrp: parseFloat(item.mrp),
    discount_percentage: parseFloat(item.discount_percentage || 0),
    cost_price: parseFloat(item.cost_price),
    total: parseFloat(item.total),
  }));

  const { error: itemsError } = await supabase
    .from("purchase_items")
    .insert(itemsToInsert);

  if (itemsError) throw itemsError;

  return purchase;
}

// Update purchase (Admin only)
export async function updatePurchase(supabase, id, purchaseData, items) {
  // Get existing purchase to compare
  const { data: existingPurchase } = await supabase
    .from("purchases")
    .select("*")
    .eq("id", id)
    .single();

  // Calculate new totals
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total), 0);
  const discountAmount =
    (subtotal * parseFloat(purchaseData.discount_percentage || 0)) / 100;
  const totalAmount = subtotal - discountAmount;

  // Update purchase
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .update({
      supplier_id: purchaseData.supplier_id,
      purchase_date: purchaseData.purchase_date,
      supplier_invoice_number: purchaseData.supplier_invoice_number,
      subtotal: subtotal,
      discount_percentage: parseFloat(purchaseData.discount_percentage || 0),
      discount_amount: discountAmount,
      total_amount: totalAmount,
      balance_amount: totalAmount - existingPurchase.paid_amount,
      payment_status:
        existingPurchase.paid_amount >= totalAmount
          ? "paid"
          : existingPurchase.paid_amount > 0
          ? "partial"
          : "pending",
      notes: purchaseData.notes,
    })
    .eq("id", id)
    .select()
    .single();

  if (purchaseError) throw purchaseError;

  // Delete old items and insert new ones
  await supabase.from("purchase_items").delete().eq("purchase_id", id);

  const itemsToInsert = items.map((item) => ({
    purchase_id: purchase.id,
    product_id: item.product_id,
    quantity: parseFloat(item.quantity),
    mrp: parseFloat(item.mrp),
    discount_percentage: parseFloat(item.discount_percentage || 0),
    cost_price: parseFloat(item.cost_price),
    total: parseFloat(item.total),
  }));

  const { error: itemsError } = await supabase
    .from("purchase_items")
    .insert(itemsToInsert);

  if (itemsError) throw itemsError;

  return purchase;
}

// Delete purchase (Admin only)
export async function deletePurchase(supabase, id) {
  // Items will be deleted via CASCADE
  const { error } = await supabase.from("purchases").delete().eq("id", id);

  if (error) throw error;
}

// Get purchase statistics
export async function getPurchaseStats(supabase, filters = {}) {
  let query = supabase
    .from("purchases")
    .select("total_amount, balance_amount, payment_status");

  if (filters.dateFrom) {
    query = query.gte("purchase_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("purchase_date", filters.dateTo);
  }

  const { data, error } = await query;

  if (error) throw error;

  const stats = {
    total_purchases: data.length,
    total_amount: data.reduce((sum, p) => sum + parseFloat(p.total_amount), 0),
    total_paid: data.reduce(
      (sum, p) =>
        sum + (parseFloat(p.total_amount) - parseFloat(p.balance_amount)),
      0
    ),
    total_due: data.reduce((sum, p) => sum + parseFloat(p.balance_amount), 0),
    pending_count: data.filter((p) => p.payment_status === "pending").length,
  };

  return stats;
}
