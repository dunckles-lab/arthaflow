import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { generateSignedPairingCode } from '@/lib/pairing-token';

export async function POST(req: NextRequest) {
  try {
    const { userId, tenantId } = await req.json();

    if (!userId || !tenantId) {
      return NextResponse.json({ error: 'userId and tenantId are required' }, { status: 400 });
    }

    // 1. Generate Stateless Signed Token (100% reliable, self-verifying)
    const signedCode = generateSignedPairingCode(userId, tenantId);

    // 2. Also generate short 6-digit random code
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const shortCode = `AF-${randomNum}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // 3. Attempt to save short code in Supabase if table exists
    const supabase = getSupabase();
    try {
      await supabase.from('telegram_pairing_codes').upsert({
        code: shortCode,
        user_id: userId,
        tenant_id: tenantId,
        expires_at: expiresAt,
      });
    } catch (e) {
      console.warn('Supabase telegram_pairing_codes write skipped (table might not exist yet):', e);
    }

    return NextResponse.json({
      success: true,
      code: signedCode,
      shortCode,
      expiresInSeconds: 900,
      botUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'agen_arthabot',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    let binding: any = null;

    try {
      const { data, error } = await supabase
        .from('telegram_bindings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        binding = data;
      }
    } catch (e) {
      // Table doesn't exist yet
    }

    return NextResponse.json({
      isPaired: Boolean(binding),
      binding: binding || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
