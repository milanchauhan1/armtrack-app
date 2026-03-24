import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/login`)
  }

  // Check for pending team invite (set by /join/[code] before redirect to auth)
  const pendingInvite = cookieStore.get('armtrack-pending-invite')?.value
  if (pendingInvite) {
    const response = NextResponse.redirect(`${origin}/join/${pendingInvite}`)
    response.cookies.set('armtrack-pending-invite', '', { maxAge: 0, path: '/' })
    return response
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete, role')
    .eq('id', data.session.user.id)
    .single()

  if (profile?.onboarding_complete) {
    if (profile.role === 'coach') {
      return NextResponse.redirect(`${origin}/coach/dashboard`)
    }
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  return NextResponse.redirect(`${origin}/onboarding`)
}
