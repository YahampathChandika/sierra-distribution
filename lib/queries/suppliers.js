// Get all suppliers with optional filters
export async function getSuppliers(supabase, filters = {}) {
  let query = supabase
    .from("suppliers")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  if (filters.city) {
    query = query.eq("city", filters.city);
  }

  if (filters.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

// Get single supplier by ID
export async function getSupplier(supabase, id) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Get supplier with purchase statistics
export async function getSupplierWithStats(supabase, id) {
  const [supplier, purchases] = await Promise.all([
    getSupplier(supabase, id),
    supabase
      .from("purchases")
      .select("total_amount, balance_amount, payment_status")
      .eq("supplier_id", id),
  ]);

  if (purchases.error) throw purchases.error;

  const stats = {
    total_purchases: purchases.data?.length || 0,
    total_amount:
      purchases.data?.reduce((sum, p) => sum + parseFloat(p.total_amount), 0) ||
      0,
    total_due:
      purchases.data?.reduce(
        (sum, p) => sum + parseFloat(p.balance_amount),
        0
      ) || 0,
    pending_bills:
      purchases.data?.filter((p) => p.payment_status === "pending").length || 0,
  };

  return { ...supplier, stats };
}

// Create new supplier
export async function createSupplier(supabase, supplierData) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      ...supplierData,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update supplier
export async function updateSupplier(supabase, id, supplierData) {
  const { data, error } = await supabase
    .from("suppliers")
    .update(supplierData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete supplier
export async function deleteSupplier(supabase, id) {
  const { error } = await supabase.from("suppliers").delete().eq("id", id);

  if (error) throw error;
}

// Get unique cities
export async function getSupplierCities(supabase) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("city")
    .not("city", "is", null);

  if (error) throw error;

  // Get unique cities
  const cities = [...new Set(data.map((item) => item.city))].filter(Boolean);
  return cities;
}

// Get active suppliers (for dropdowns)
export async function getActiveSuppliers(supabase) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
}
