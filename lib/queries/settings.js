// Get all settings
export async function getSettings(supabase) {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .order("category", { ascending: true });

  if (error) throw error;

  // Convert to object format
  const settingsObject = data.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  return settingsObject;
}

// Get settings by category
export async function getSettingsByCategory(supabase, category) {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("category", category);

  if (error) throw error;

  return data.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});
}

// Update setting
export async function updateSetting(supabase, key, value) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("settings")
    .update({
      value: value,
      updated_by: user.id,
    })
    .eq("key", key)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update multiple settings
export async function updateSettings(supabase, settings) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const updates = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_by: user.id,
  }));

  const promises = updates.map((update) =>
    supabase
      .from("settings")
      .update({
        value: update.value,
        updated_by: update.updated_by,
      })
      .eq("key", update.key)
  );

  const results = await Promise.all(promises);

  // Check for errors
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    throw errors[0].error;
  }

  return true;
}
