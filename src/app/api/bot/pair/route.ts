import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// In-memory fallback if live database table is not yet created
const memoryPairingCodes = new Map<string, { userId: string; tenantId: string; expiresAt: number }>();
const memoryBindings = new Map<string, { telegramUserId: string; telegramUsername?: string; userId: string; tenantId: string }>();

export async function POST(req: NextRequest) {
  try {
    const { userId, tenantId } = await req.json();

    if (!userId || !tenantId) {
      return NextResponse.json({ error: 'userId and tenantId are required' }, { status: 400 });
    }

    // Generate 6-digit random code
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const code = `AF-${randomNum}`;
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save to memory cache
    memoryPairingCodes.set(code, { userId, tenantId, expiresAt });

    // Also attempt to save to Supabase if table exists
    const supabase = getSupabase();
    try {
      await supabase.from('telegram_pairing_codes').upsert({
        code,
        user_id: userId,
        tenant_id: tenantId,
        expires_at: new Date(expiresAt).toISOString(),
      });
    } catch (e) {
      console.warn('Supabase telegram_pairing_codes write skipped (fallback to memory):', e);
    }

    return NextResponse.json({
      success: true,
      code,
      expiresInSeconds: 600,
      botUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'arthaflow_bot',
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
      console.warn('Supabase telegram_bindings lookup failed, fallback to memory');
    }

    // Check memory fallback
    if (!binding) {
      for (const b of memoryBindings.values()) {
        if (b.userId === userId) {
          binding = b;
          break;
        }
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
