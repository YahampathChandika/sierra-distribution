// Get all payments with related transaction info
export async function getPayments(supabase, filters = {}) {
  let query = supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters.search) {
    query = query.or(
      `payment_number.ilike.%${filters.search}%,reference_number.ilike.%${filters.search}%`
    );
  }

  if (filters.paymentType) {
    query = query.eq("payment_type", filters.paymentType);
  }

  if (filters.paymentMethod) {
    query = query.eq("payment_method", filters.paymentMethod);
  }

  if (filters.dateFrom) {
    query = query.gte("payment_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("payment_date", filters.dateTo);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Enrich with related transaction data
  const enrichedPayments = await Promise.all(
    data.map(async (payment) => {
      if (payment.payment_type === "purchase_payment") {
        const { data: purchase } = await supabase
          .from("purchases")
          .select("purchase_number, supplier:suppliers(name)")
          .eq("id", payment.reference_id)
          .single();

        return {
          ...payment,
          transaction_number: purchase?.purchase_number,
          party_name: purchase?.supplier?.name,
        };
      } else if (payment.payment_type === "sale_payment") {
        const { data: sale } = await supabase
          .from("sales")
          .select("invoice_number, customer:customers(name)")
          .eq("id", payment.reference_id)
          .single();

        return {
          ...payment,
          transaction_number: sale?.invoice_number,
          party_name: sale?.customer?.name,
        };
      }
      return payment;
    })
  );

  return enrichedPayments;
}

// Get single payment by ID
export async function getPayment(supabase, id) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Get pending purchases (for payment dropdown)
export async function getPendingPurchases(supabase) {
  const { data, error } = await supabase
    .from("purchases")
    .select(
      `
      id,
      purchase_number,
      total_amount,
      balance_amount,
      supplier:suppliers(name)
    `
    )
    .gt("balance_amount", 0)
    .order("purchase_date", { ascending: false });

  if (error) throw error;
  return data;
}

// Get pending sales (for payment dropdown)
export async function getPendingSales(supabase) {
  const { data, error } = await supabase
    .from("sales")
    .select(
      `
      id,
      invoice_number,
      total_amount,
      balance_amount,
      customer:customers(name)
    `
    )
    .gt("balance_amount", 0)
    .order("sale_date", { ascending: false });

  if (error) throw error;
  return data;
}

// Create new payment
export async function createPayment(supabase, paymentData) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Generate payment number
  const { data: paymentNumber } = await supabase.rpc("generate_payment_number");

  // Insert payment
  const { data, error } = await supabase
    .from("payments")
    .insert({
      payment_number: paymentNumber,
      payment_type: paymentData.payment_type,
      reference_id: paymentData.reference_id,
      payment_date: paymentData.payment_date,
      amount: parseFloat(paymentData.amount),
      payment_method: paymentData.payment_method,
      reference_number: paymentData.reference_number,
      notes: paymentData.notes,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  // The database trigger will automatically update the purchase/sale payment status
  return data;
}

// Update payment (Admin only)
export async function updatePayment(supabase, id, paymentData) {
  const { data, error } = await supabase
    .from("payments")
    .update({
      payment_type: paymentData.payment_type,
      reference_id: paymentData.reference_id,
      payment_date: paymentData.payment_date,
      amount: parseFloat(paymentData.amount),
      payment_method: paymentData.payment_method,
      reference_number: paymentData.reference_number,
      notes: paymentData.notes,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete payment (Admin only)
export async function deletePayment(supabase, id) {
  const { error } = await supabase.from("payments").delete().eq("id", id);

  if (error) throw error;
}

// Get payment statistics
export async function getPaymentStats(supabase, filters = {}) {
  let query = supabase.from("payments").select("amount, payment_type");

  if (filters.dateFrom) {
    query = query.gte("payment_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("payment_date", filters.dateTo);
  }

  const { data, error } = await query;

  if (error) throw error;

  const stats = {
    total_payments: data.length,
    total_amount: data.reduce((sum, p) => sum + parseFloat(p.amount), 0),
    purchase_payments: data.filter((p) => p.payment_type === "purchase_payment")
      .length,
    purchase_amount: data
      .filter((p) => p.payment_type === "purchase_payment")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0),
    sale_payments: data.filter((p) => p.payment_type === "sale_payment").length,
    sale_amount: data
      .filter((p) => p.payment_type === "sale_payment")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0),
  };

  return stats;
}
