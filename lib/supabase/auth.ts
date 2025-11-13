import { createClient } from "./client"

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient()

  // Create the user. We avoid specifying an email redirect so we don't force
  // an email verification redirect flow here. Depending on your Supabase
  // project's auth settings, an email confirmation may still be required.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) return { data, error }

  // If the signUp did not create a session (common when email confirm is
  // required), attempt to sign the user in immediately with the same
  // credentials. If your Supabase project enforces email confirmation this
  // will fail — in that case you'd need to create the user via a server-side
  // admin client with email_confirmed set to true.
  if (!data.session) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // If sign-in failed, surface a clearer error when it's due to email
    // confirmation. Supabase often returns a generic 'Invalid login
    // credentials' message which is confusing when the account exists but
    // hasn't been confirmed.
    if (signInError) {
      const msg = /confirm|verify|verification|email/i.test(signInError.message || "")
        ? "Email confirmation required. Please check your inbox and click the confirmation link."
        : signInError.message || "Invalid login credentials"

      return { data: signInData ?? data, error: new Error(msg) }
    }

    return { data: signInData ?? data, error: undefined }
  }

  return { data, error }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}
