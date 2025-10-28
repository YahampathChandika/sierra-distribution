export async function signIn(supabase, email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut(supabase) {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(supabase) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function getUser(supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Don't throw error if user is not authenticated
  if (error && error.status === 401) {
    return null;
  }

  if (error) throw error;
  return user;
}
