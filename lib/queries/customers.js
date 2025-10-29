// Get all customers with optional filters
export async function getCustomers(supabase, filters = {}) {
  let query = supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,business_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  if (filters.city) {
    query = query.eq("city", filters.city);
  }

  if (filters.customerType) {
    query = query.eq("customer_type", filters.customerType);
  }

  if (filters.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

// Get single customer by ID
export async function getCustomer(supabase, id) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Get customer with sales statistics
export async function getCustomerWithStats(supabase, id) {
  const [customer, sales] = await Promise.all([
    getCustomer(supabase, id),
    supabase
      .from("sales")
      .select("total_amount, balance_amount, payment_status")
      .eq("customer_id", id),
  ]);

  if (sales.error) throw sales.error;

  const stats = {
    total_sales: sales.data?.length || 0,
    total_amount:
      sales.data?.reduce((sum, s) => sum + parseFloat(s.total_amount), 0) || 0,
    total_due:
      sales.data?.reduce((sum, s) => sum + parseFloat(s.balance_amount), 0) ||
      0,
    pending_invoices:
      sales.data?.filter((s) => s.payment_status === "pending").length || 0,
  };

  return { ...customer, stats };
}

// Create new customer
export async function createCustomer(supabase, customerData) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("customers")
    .insert({
      ...customerData,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update customer
export async function updateCustomer(supabase, id, customerData) {
  const { data, error } = await supabase
    .from("customers")
    .update(customerData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete customer
export async function deleteCustomer(supabase, id) {
  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) throw error;
}

// Get unique cities
export async function getCustomerCities(supabase) {
  const { data, error } = await supabase
    .from("customers")
    .select("city")
    .not("city", "is", null);

  if (error) throw error;

  // Get unique cities
  const cities = [...new Set(data.map((item) => item.city))].filter(Boolean);
  return cities;
}

// Get active customers (for dropdowns)
export async function getActiveCustomers(supabase) {
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, business_name")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
}

// Get customers with outstanding balance
export async function getCustomersWithDue(supabase) {
  const { data: sales, error } = await supabase
    .from("sales")
    .select("customer_id, balance_amount")
    .gt("balance_amount", 0);

  if (error) throw error;

  // Group by customer and sum balances
  const dueByCustomer = sales.reduce((acc, sale) => {
    if (!acc[sale.customer_id]) {
      acc[sale.customer_id] = 0;
    }
    acc[sale.customer_id] += parseFloat(sale.balance_amount);
    return acc;
  }, {});

  // Get customer details
  const customerIds = Object.keys(dueByCustomer);
  if (customerIds.length === 0) return [];

  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("*")
    .in("id", customerIds);

  if (customersError) throw customersError;

  // Add due amount to customer data
  return customers.map((customer) => ({
    ...customer,
    due_amount: dueByCustomer[customer.id],
  }));
}
