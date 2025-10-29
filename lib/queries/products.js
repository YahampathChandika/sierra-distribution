// Get all products with optional filters
export async function getProducts(supabase, filters = {}) {
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive);
  }

  if (filters.lowStock) {
    query = query.lt("current_stock", supabase.raw("min_stock_level"));
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

// Get single product by ID
export async function getProduct(supabase, id) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Create new product
export async function createProduct(supabase, productData) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("products")
    .insert({
      ...productData,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update product
export async function updateProduct(supabase, id, productData) {
  const { data, error } = await supabase
    .from("products")
    .update(productData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete product
export async function deleteProduct(supabase, id) {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw error;
}

// Get product categories (unique categories)
export async function getProductCategories(supabase) {
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null);

  if (error) throw error;

  // Get unique categories
  const categories = [...new Set(data.map((item) => item.category))].filter(
    Boolean
  );
  return categories;
}

// Get low stock products
export async function getLowStockProducts(supabase) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .lt("current_stock", supabase.raw("min_stock_level"))
    .eq("is_active", true);

  if (error) throw error;
  return data;
}

// Update stock (manual adjustment)
export async function updateProductStock(
  supabase,
  productId,
  newStock,
  notes = ""
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get current stock
  const { data: product } = await supabase
    .from("products")
    .select("current_stock")
    .eq("id", productId)
    .single();

  // Update product stock
  const { data, error } = await supabase
    .from("products")
    .update({ current_stock: newStock })
    .eq("id", productId)
    .select()
    .single();

  if (error) throw error;

  // Record stock movement
  await supabase.from("stock_movements").insert({
    product_id: productId,
    movement_type: "adjustment",
    quantity: newStock - product.current_stock,
    balance_after: newStock,
    notes: notes,
    created_by: user.id,
  });

  return data;
}
