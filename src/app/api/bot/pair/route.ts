import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { generateSignedPairingCode } from '@/lib/pairing-token';

export async function POST(req: NextRequest) {
  try {
    const { userId, tenantId } = await req.json();

    if (!userId || !tenantId) {
      return NextResponse.json({ error: 'userId and tenantId are required' }, { status: 400 });
    }

    // 1. Generate Stateless Signed Token (self-verifying)
    const signedCode = generateSignedPairingCode(userId, tenantId);

    // 2. Generate short 6-digit code: AF-XXXXXX
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const shortCode = `AF-${randomNum}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const supabase = getSupabase();

    // 3. Save pending pairing into telegram_bindings (guaranteed table) & telegram_pairing_codes
    if (supabase) {
      try {
        await supabase.from('telegram_bindings').upsert({
          id: `pair_${randomNum}`,
          telegram_user_id: `PENDING_${shortCode}`,
          telegram_chat_id: 'PENDING',
          user_id: userId,
          tenant_id: tenantId,
          updated_at: expiresAt,
        });
      } catch (e) {
        console.warn('telegram_bindings pending pairing write error:', e);
      }

      try {
        await supabase.from('telegram_pairing_codes').upsert({
          code: shortCode,
          user_id: userId,
          tenant_id: tenantId,
          expires_at: expiresAt,
        });
      } catch (e) {
        // Table might not exist yet
      }
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

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('telegram_bindings')
          .select('*')
          .eq('user_id', userId)
          .not('telegram_user_id', 'like', 'PENDING_%')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          binding = data;
        }
      } catch (e) {
        console.warn('Check pairing DB lookup error:', e);
      }
    }

    return NextResponse.json({
      isPaired: Boolean(binding),
      binding: binding || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
