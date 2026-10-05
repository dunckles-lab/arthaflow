import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { parseTelegramMessage } from '@/lib/bot-parser';
import { verifySignedPairingCode } from '@/lib/pairing-token';
import {
  sendTelegramMessage,
  answerCallbackQuery,
  editTelegramMessage,
} from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Secret Token if provided
    const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (expectedSecret && secretToken && secretToken !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized secret token' }, { status: 401 });
    }

    const body = await req.json();

    // 2. Handle Inline Button Callbacks (callback_query)
    if (body.callback_query) {
      await handleCallbackQuery(body.callback_query);
      return NextResponse.json({ ok: true });
    }

    // 3. Handle Regular Message
    const message = body.message || body.edited_message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const telegramUserId = String(message.from?.id || chatId);
    const telegramUsername = message.from?.username || message.from?.first_name || 'User';
    const rawText = message.text.trim();

    const supabase = getSupabase();

    // Handle /start command (may contain deep link payload: /start AF_... or /start AF-123456)
    if (rawText.startsWith('/start')) {
      const parts = rawText.split(/\s+/);
      if (parts.length > 1 && (parts[1].startsWith('AF_') || parts[1].startsWith('AF-') || parts[1].startsWith('af_') || parts[1].startsWith('af-'))) {
        await handlePairing(chatId, telegramUserId, telegramUsername, parts[1], supabase);
        return NextResponse.json({ ok: true });
      }

      await sendTelegramMessage(
        chatId,
        `👋 <b>Selamat datang di ArthaFlow Bot!</b>\n\n` +
        `Bot asisten finansial cerdas untuk mencatat mutasi pengeluaran, pemasukan, dan transfer saldo secara instan.\n\n` +
        `🔐 <b>Langkah Menghubungkan Akun:</b>\n` +
        `1. Buka dashboard ArthaFlow di web browser\n` +
        `2. Buka menu <b>Integrasi Telegram</b> untuk mendapatkan Kode Pairing\n` +
        `3. Kirim perintah: <code>/pair KODE_PAIRING</code> ke bot ini\n\n` +
        `Ketik <code>/help</code> untuk panduan lengkap format pencatatan.`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /help command
    if (rawText === '/help' || rawText.toLowerCase() === 'help' || rawText.toLowerCase() === 'bantuan') {
      await sendTelegramMessage(
        chatId,
        `📖 <b>Panduan Perintah & Format ArthaFlow:</b>\n\n` +
        `<b>1. Pencatatan Cepat:</b>\n` +
        `• <code>keluar 50rb makan siang muamalat</code>\n` +
        `• <code>masuk 5jt gaji bca</code>\n` +
        `• <code>tf 100k bca ke gopay</code>\n\n` +
        `<b>2. Kelola Ruang Buku (Scope):</b>\n` +
        `• <code>/scope</code> — Lihat dan ganti ruang buku (Pribadi, Keluarga, Usaha)\n` +
        `• <code>/scope pribadi</code> — Pindah langsung ke scope Pribadi\n` +
        `• <code>/scope keluarga</code> — Pindah langsung ke scope Keluarga\n` +
        `• <code>/scope usaha</code> — Pindah langsung ke scope Organisasi/Usaha\n\n` +
        `<b>3. Laporan & Saldo:</b>\n` +
        `• <code>/saldo</code> — Lihat ringkasan saldo seluruh rekening aktif\n` +
        `• <code>/rekap</code> — Lihat rekap transaksi hari ini & bulan ini\n` +
        `• <code>/pair KODE</code> — Hubungkan akun Telegram ke ArthaFlow`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /pair command
    if (rawText.startsWith('/pair') || rawText.startsWith('pair ') || rawText.startsWith('AF-') || rawText.startsWith('af-') || rawText.startsWith('AF_')) {
      let code = rawText;
      if (rawText.startsWith('/pair')) {
        const parts = rawText.split(/\s+/);
        if (parts.length < 2) {
          await sendTelegramMessage(
            chatId,
            `⚠️ <b>Format salah.</b>\nGunakan: <code>/pair KODE_PAIRING</code>\nContoh: <code>/pair AF-829102</code>`
          );
          return NextResponse.json({ ok: true });
        }
        code = parts[1];
      } else if (rawText.startsWith('pair ')) {
        code = rawText.substring(5).trim();
      }

      await handlePairing(chatId, telegramUserId, telegramUsername, code, supabase);
      return NextResponse.json({ ok: true });
    }

    // Check if Telegram user is paired to an ArthaFlow account
    const binding = await getBinding(telegramUserId, supabase);
    if (!binding) {
      await sendTelegramMessage(
        chatId,
        `⚠️ <b>Akun Telegram belum terhubung dengan ArthaFlow!</b>\n\n` +
        `Silakan ambil Kode Pairing di dashboard Web ArthaFlow, lalu kirim ke sini:\n` +
        `<code>/pair KODE_PAIRING</code>`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /scope, /switch, /ruang, /pindah command
    if (
      rawText.startsWith('/scope') ||
      rawText.startsWith('/switch') ||
      rawText.startsWith('/ruang') ||
      rawText.startsWith('/pindah') ||
      rawText.toLowerCase() === 'scope' ||
      rawText.toLowerCase() === 'switch'
    ) {
      const parts = rawText.split(/\s+/);
      const hint = parts.length > 1 ? parts.slice(1).join(' ') : null;
      await handleScope(chatId, telegramUserId, binding, hint, supabase);
      return NextResponse.json({ ok: true });
    }

    // Handle /saldo command
    if (rawText === '/saldo' || rawText.toLowerCase() === 'saldo' || rawText.toLowerCase() === 'cek saldo') {
      await handleSaldo(chatId, binding, supabase);
      return NextResponse.json({ ok: true });
    }

    // Handle /rekap command
    if (rawText.startsWith('/rekap') || rawText.toLowerCase() === 'rekap') {
      await handleRekap(chatId, binding, supabase);
      return NextResponse.json({ ok: true });
    }

    // Parse natural language transaction
    const parsed = parseTelegramMessage(rawText);
    if (!parsed) {
      await sendTelegramMessage(
        chatId,
        `❓ Format tidak dikenali. Ketik <code>/help</code> untuk panduan atau coba:\n` +
        `• <code>keluar 50rb makan siang muamalat</code>\n` +
        `• <code>masuk 2jt bonus bca</code>\n` +
        `• <code>/saldo</code> untuk cek saldo\n` +
        `• <code>/scope</code> untuk ganti ruang buku`
      );
      return NextResponse.json({ ok: true });
    }

    // Execute transaction insertion
    await executeBotTransaction(chatId, telegramUsername, binding, parsed, supabase);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}

// GET Endpoint for Webhook Diagnostic & Status Check
export async function GET() {
  return NextResponse.json({
    status: 'ArthaFlow Telegram Webhook Online',
    timestamp: new Date().toISOString(),
    configured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
  });
}

// Fallback in-memory bindings cache if DB is not yet migrated
const activeBindings = new Map<string, { telegram_user_id: string; user_id: string; tenant_id: string; telegram_username?: string }>();

function getTenantEmoji(type?: string): string {
  if (type === 'household') return '🏠';
  if (type === 'personal') return '👤';
  if (type === 'organization') return '🏢';
  return '📁';
}

/**
 * Handle user account pairing
 */
async function handlePairing(
  chatId: number | string,
  telegramUserId: string,
  telegramUsername: string,
  rawCode: string,
  supabase: any
) {
  try {
    let code = rawCode.trim();
    if (/^\d{6}$/.test(code)) {
      code = `AF-${code}`;
    }
    const upperCode = code.toUpperCase();

    let targetUserId = '';
    let targetTenantId = '';

    // 1. Try Stateless Signed Code Verification (AF_...)
    if (code.startsWith('AF_') || code.startsWith('af_')) {
      const verified = verifySignedPairingCode(code);
      if (verified) {
        targetUserId = verified.userId;
        targetTenantId = verified.tenantId;
      }
    }

    // 2. Try Supabase telegram_bindings table lookup (PENDING_AF-XXXXXX)
    if (!targetUserId && supabase) {
      try {
        const { data: pendingRecord, error: pErr } = await supabase
          .from('telegram_bindings')
          .select('*')
          .eq('telegram_user_id', `PENDING_${upperCode}`)
          .maybeSingle();

        if (!pErr && pendingRecord) {
          targetUserId = pendingRecord.user_id;
          targetTenantId = pendingRecord.tenant_id;
          await supabase.from('telegram_bindings').delete().eq('id', pendingRecord.id);
        }
      } catch (e) {
        console.warn('Pending binding lookup error:', e);
      }
    }

    // 3. Try Supabase telegram_pairing_codes table lookup
    if (!targetUserId && supabase) {
      try {
        const { data, error } = await supabase
          .from('telegram_pairing_codes')
          .select('*')
          .eq('code', upperCode)
          .maybeSingle();

        if (!error && data) {
          targetUserId = data.user_id;
          targetTenantId = data.tenant_id;
          await supabase.from('telegram_pairing_codes').delete().eq('code', upperCode);
        }
      } catch (e) {
        // Ignored
      }
    }

    // 4. If code is invalid or not found
    if (!targetUserId) {
      await sendTelegramMessage(
        chatId,
        `❌ <b>Kode pairing tidak valid atau telah kedaluwarsa.</b>\n\n` +
        `Silakan buka dashboard Web ArthaFlow, buka modal <b>Integrasi Bot Telegram</b>, lalu kirim kode pairing terbaru ke sini.`
      );
      return;
    }

    // Default tenant fallback if none
    if (!targetTenantId) {
      targetTenantId = 't-personal';
    }

    // Update in-memory bindings cache
    activeBindings.set(telegramUserId, {
      telegram_user_id: telegramUserId,
      user_id: targetUserId,
      tenant_id: targetTenantId,
      telegram_username: telegramUsername,
    });

    // Insert or update binding in Supabase
    if (supabase) {
      try {
        await supabase.from('telegram_bindings').upsert({
          id: `tb_${telegramUserId}`,
          telegram_user_id: String(telegramUserId),
          telegram_username: telegramUsername || '',
          telegram_chat_id: String(chatId),
          user_id: targetUserId,
          tenant_id: targetTenantId,
        });
      } catch (dbErr) {
        console.warn('Supabase binding write error:', dbErr);
      }
    }

    // Fetch tenant name
    let tenantName = 'Dompet Pribadi';
    if (supabase) {
      const { data: tData } = await supabase.from('tenants').select('*').eq('id', targetTenantId).maybeSingle();
      if (tData) tenantName = `${getTenantEmoji(tData.type)} ${tData.name}`;
    }

    await sendTelegramMessage(
      chatId,
      `🎉 <b>Akun Berhasil Terhubung!</b>\n\n` +
      `Akun Telegram Anda (@${telegramUsername}) kini terhubung ke ruang buku <b>${tenantName}</b> di ArthaFlow.\n\n` +
      `📌 <b>Perintah yang dapat langsung digunakan:</b>\n` +
      `• <code>/saldo</code> — Cek saldo rekening Anda\n` +
      `• <code>/scope</code> — Ganti ruang buku (Pribadi / Keluarga / Usaha)\n` +
      `• <code>keluar 35rb sarapan pagi muamalat</code>\n` +
      `• <code>masuk 1.5jt freelance muamalat</code>\n` +
      `• <code>tf 50k muamalat ke gopay</code>\n` +
      `• <code>/rekap</code> — Rekapitulasi pengeluaran & pemasukan`,
      {
        inline_keyboard: [
          [
            { text: '💳 Cek Saldo Sekarang', callback_data: 'check_saldo' },
            { text: '🔄 Pilih Ruang Buku', callback_data: 'switch_scope' },
          ]
        ]
      }
    );
  } catch (err) {
    console.error('Pairing error:', err);
    await sendTelegramMessage(chatId, `❌ Gagal memproses pairing: ${err}`);
  }
}

/**
 * Get active binding for telegram user
 */
async function getBinding(telegramUserId: string, supabase: any) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('telegram_bindings')
        .select('*')
        .eq('telegram_user_id', String(telegramUserId))
        .not('telegram_user_id', 'like', 'PENDING_%')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase telegram_bindings lookup error:', e);
    }
  }

  if (activeBindings.has(telegramUserId)) {
    return activeBindings.get(telegramUserId);
  }

  return null;
}

/**
 * Handle Scope Switch (/scope command)
 */
async function handleScope(
  chatId: number | string,
  telegramUserId: string,
  binding: any,
  targetScopeHint: string | null,
  supabase: any
) {
  try {
    const { data: tenants, error: tErr } = await supabase.from('tenants').select('*').order('created_at', { ascending: true });
    if (tErr || !tenants || tenants.length === 0) {
      await sendTelegramMessage(chatId, `⚠️ Belum ada ruang buku (scope) yang terdaftar di database.`);
      return;
    }

    // If user provided a specific scope hint: e.g. /scope pribadi, /scope keluarga, /scope 1
    if (targetScopeHint) {
      const hint = targetScopeHint.trim().toLowerCase();
      let matchedTenant = null;

      if (/^\d+$/.test(hint)) {
        const idx = parseInt(hint, 10) - 1;
        if (idx >= 0 && idx < tenants.length) {
          matchedTenant = tenants[idx];
        }
      }

      if (!matchedTenant) {
        matchedTenant = tenants.find((t: any) =>
          t.id.toLowerCase() === hint ||
          t.name.toLowerCase().includes(hint) ||
          (t.type && t.type.toLowerCase().includes(hint))
        );
      }

      if (matchedTenant) {
        await switchBindingScope(chatId, telegramUserId, binding, matchedTenant, supabase);
        return;
      }
    }

    // Render interactive scope selection buttons
    const currentTenant = tenants.find((t: any) => t.id === binding.tenant_id) || tenants[0];

    const keyboardButtons = tenants.map((t: any) => {
      const isCurrent = t.id === binding.tenant_id;
      const label = `${getTenantEmoji(t.type)} ${t.name}${isCurrent ? ' (Aktif ✅)' : ''}`;
      return [{ text: label, callback_data: `set_scope:${t.id}` }];
    });

    const scopeMsg =
      `📍 <b>Pengaturan Ruang Buku (Scope Keuangan):</b>\n\n` +
      `Scope saat ini: <b>${getTenantEmoji(currentTenant.type)} ${currentTenant.name}</b>\n\n` +
      `Pilih ruang buku di bawah ini untuk berpindah ruang pencatatan:`;

    await sendTelegramMessage(chatId, scopeMsg, { inline_keyboard: keyboardButtons });
  } catch (err: any) {
    await sendTelegramMessage(chatId, `❌ Gagal memuat daftar ruang buku: ${err.message}`);
  }
}

/**
 * Switch binding's active tenant scope
 */
async function switchBindingScope(
  chatId: number | string,
  telegramUserId: string,
  binding: any,
  targetTenant: any,
  supabase: any,
  messageId?: number
) {
  try {
    if (supabase) {
      await supabase
        .from('telegram_bindings')
        .update({ tenant_id: targetTenant.id })
        .eq('telegram_user_id', String(telegramUserId));
    }

    if (activeBindings.has(telegramUserId)) {
      const b = activeBindings.get(telegramUserId);
      if (b) b.tenant_id = targetTenant.id;
    }
    binding.tenant_id = targetTenant.id;

    const emoji = getTenantEmoji(targetTenant.type);
    const text =
      `✅ <b>Ruang Buku Berhasil Diubah!</b>\n\n` +
      `Scope aktif sekarang: <b>${emoji} ${targetTenant.name}</b>\n\n` +
      `Mulai sekarang, seluruh pencatatan transaksi, cek saldo (<code>/saldo</code>), dan rekap (<code>/rekap</code>) akan masuk ke ruang buku ini.`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '💳 Cek Saldo Scope Ini', callback_data: 'check_saldo' },
          { text: '🔄 Ganti Scope Lain', callback_data: 'switch_scope' },
        ]
      ]
    };

    if (messageId && chatId) {
      await editTelegramMessage(chatId, messageId, text, inlineKeyboard);
    } else {
      await sendTelegramMessage(chatId, text, inlineKeyboard);
    }
  } catch (e: any) {
    console.error('Switch scope error:', e);
    await sendTelegramMessage(chatId, `❌ Gagal mengganti ruang buku: ${e.message}`);
  }
}

/**
 * Show balances of wallets in the tenant
 */
async function handleSaldo(chatId: number | string, binding: any, supabase: any) {
  try {
    // 1. Fetch current tenant info
    let tenantName = 'Ruang Buku';
    let tenantType = 'personal';
    if (supabase) {
      const { data: tData } = await supabase.from('tenants').select('*').eq('id', binding.tenant_id).maybeSingle();
      if (tData) {
        tenantName = tData.name;
        tenantType = tData.type;
      }
    }

    // 2. Fetch wallets (do NOT filter by is_active since DB schema does not have is_active column)
    const { data: wallets, error: wError } = await supabase
      .from('wallets')
      .select('*')
      .eq('tenant_id', binding.tenant_id);

    const { data: savings, error: sError } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('tenant_id', binding.tenant_id);

    if (wError) {
      console.warn('Supabase fetch wallets error in handleSaldo:', wError);
    }

    if (!wallets || wallets.length === 0) {
      await sendTelegramMessage(
        chatId,
        `💳 <b>Ringkasan Saldo Rekening & Tabungan</b>\n` +
        `📂 <i>Ruang Buku: ${getTenantEmoji(tenantType)} ${tenantName}</i>\n\n` +
        `⚠️ <i>Belum ada rekening atau dompet yang terdaftar di ruang buku ini.</i>\n\n` +
        `Silakan tambahkan rekening baru di web dashboard, atau ganti ruang buku dengan <code>/scope</code>.`,
        {
          inline_keyboard: [
            [
              { text: '🔄 Ganti Ruang Buku (Scope)', callback_data: 'switch_scope' },
            ]
          ]
        }
      );
      return;
    }

    let totalWallets = 0;
    let walletListText = '';

    for (const w of wallets) {
      const bal = Number(w.balance || 0);
      totalWallets += bal;
      walletListText += `• <b>${w.name}</b>: Rp ${bal.toLocaleString('id-ID')}\n`;
    }

    let totalSavings = 0;
    let savingsListText = '';
    if (savings && savings.length > 0) {
      for (const s of savings) {
        const amt = Number(s.current_amount || 0);
        totalSavings += amt;
        savingsListText += `• 🎯 <b>${s.name}</b>: Rp ${amt.toLocaleString('id-ID')} / Rp ${Number(s.target_amount || 0).toLocaleString('id-ID')}\n`;
      }
    }

    let msg =
      `💳 <b>Ringkasan Saldo Rekening & Dompet</b>\n` +
      `📂 <i>Ruang Buku: ${getTenantEmoji(tenantType)} ${tenantName}</i>\n\n` +
      `${walletListText}\n` +
      `💰 <b>Total Saldo Kas/Bank:</b> Rp ${totalWallets.toLocaleString('id-ID')}`;

    if (savingsListText) {
      msg += `\n\n🏦 <b>Alokasi Target Tabungan:</b>\n${savingsListText}\n💎 <b>Total Tabungan:</b> Rp ${totalSavings.toLocaleString('id-ID')}`;
    }

    msg += `\n\n📈 <b>Total Kekayaan Bersih:</b> Rp ${(totalWallets + totalSavings).toLocaleString('id-ID')}`;

    await sendTelegramMessage(chatId, msg, {
      inline_keyboard: [
        [
          { text: '🔄 Ganti Scope', callback_data: 'switch_scope' },
          { text: '📊 Rekap Keuangan', callback_data: 'check_rekap' },
        ]
      ]
    });
  } catch (err: any) {
    await sendTelegramMessage(chatId, `❌ Gagal mengambil saldo: ${err.message}`);
  }
}

/**
 * Show transaction recap for today & this month
 */
async function handleRekap(chatId: number | string, binding: any, supabase: any) {
  try {
    let tenantName = 'Ruang Buku';
    let tenantType = 'personal';
    if (supabase) {
      const { data: tData } = await supabase.from('tenants').select('*').eq('id', binding.tenant_id).maybeSingle();
      if (tData) {
        tenantName = tData.name;
        tenantType = tData.type;
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const firstDayMonth = `${todayStr.substring(0, 7)}-01`;

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('tenant_id', binding.tenant_id)
      .gte('date', firstDayMonth);

    if (error || !transactions || transactions.length === 0) {
      await sendTelegramMessage(
        chatId,
        `📊 <b>Rekapitulasi Keuangan ArthaFlow</b>\n` +
        `📂 <i>Ruang Buku: ${getTenantEmoji(tenantType)} ${tenantName}</i>\n\n` +
        `📅 <b>Hari Ini (${todayStr}):</b>\n` +
        `• Pemasukan: 🟢 Rp 0\n` +
        `• Pengeluaran: 🔴 Rp 0\n` +
        `• Net Hari Ini: <b>Rp 0</b>\n\n` +
        `📆 <b>Bulan Ini (${todayStr.substring(0, 7)}):</b>\n` +
        `• Total Masuk: 🟢 Rp 0\n` +
        `• Total Keluar: 🔴 Rp 0\n` +
        `• Net Bulan Ini: <b>Rp 0</b>`,
        {
          inline_keyboard: [
            [
              { text: '💳 Cek Saldo', callback_data: 'check_saldo' },
              { text: '🔄 Ganti Scope', callback_data: 'switch_scope' },
            ]
          ]
        }
      );
      return;
    }

    let todayIncome = 0;
    let todayExpense = 0;
    let monthIncome = 0;
    let monthExpense = 0;

    for (const tx of transactions || []) {
      const amt = Number(tx.amount || 0);
      if (tx.date === todayStr) {
        if (tx.type === 'income') todayIncome += amt;
        if (tx.type === 'expense') todayExpense += amt;
      }
      if (tx.type === 'income') monthIncome += amt;
      if (tx.type === 'expense') monthExpense += amt;
    }

    const msg =
      `📊 <b>Rekapitulasi Keuangan ArthaFlow</b>\n` +
      `📂 <i>Ruang Buku: ${getTenantEmoji(tenantType)} ${tenantName}</i>\n\n` +
      `📅 <b>Hari Ini (${todayStr}):</b>\n` +
      `• Pemasukan: 🟢 Rp ${todayIncome.toLocaleString('id-ID')}\n` +
      `• Pengeluaran: 🔴 Rp ${todayExpense.toLocaleString('id-ID')}\n` +
      `• Net Hari Ini: <b>Rp ${(todayIncome - todayExpense).toLocaleString('id-ID')}</b>\n\n` +
      `📆 <b>Bulan Ini (${todayStr.substring(0, 7)}):</b>\n` +
      `• Total Masuk: 🟢 Rp ${monthIncome.toLocaleString('id-ID')}\n` +
      `• Total Keluar: 🔴 Rp ${monthExpense.toLocaleString('id-ID')}\n` +
      `• Net Bulan Ini: <b>Rp ${(monthIncome - monthExpense).toLocaleString('id-ID')}</b>`;

    await sendTelegramMessage(chatId, msg, {
      inline_keyboard: [
        [
          { text: '💳 Cek Saldo', callback_data: 'check_saldo' },
          { text: '🔄 Ganti Scope', callback_data: 'switch_scope' },
        ]
      ]
    });
  } catch (err: any) {
    await sendTelegramMessage(chatId, `❌ Gagal mengambil rekap: ${err.message}`);
  }
}

/**
 * Execute parsed transaction and save to database
 */
async function executeBotTransaction(
  chatId: number | string,
  telegramUsername: string,
  binding: any,
  parsed: any,
  supabase: any
) {
  try {
    let tenantName = 'Ruang Buku';
    let tenantType = 'personal';
    if (supabase) {
      const { data: tData } = await supabase.from('tenants').select('*').eq('id', binding.tenant_id).maybeSingle();
      if (tData) {
        tenantName = tData.name;
        tenantType = tData.type;
      }
    }

    // 1. Fetch available wallets & categories for this tenant
    const { data: wallets } = await supabase
      .from('wallets')
      .select('*')
      .eq('tenant_id', binding.tenant_id);

    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', binding.tenant_id);

    if (!wallets || wallets.length === 0) {
      await sendTelegramMessage(
        chatId,
        `⚠️ <b>Tidak dapat mencatat transaksi:</b>\n\n` +
        `Belum ada rekening / dompet di ruang buku <b>${getTenantEmoji(tenantType)} ${tenantName}</b>.\n\n` +
        `Silakan tambahkan rekening bank di web dashboard atau pindah ruang buku dengan <code>/scope</code>.`,
        {
          inline_keyboard: [
            [
              { text: '🔄 Ganti Ruang Buku (Scope)', callback_data: 'switch_scope' },
            ]
          ]
        }
      );
      return;
    }

    const walletList = wallets;

    // 2. Resolve source wallet
    let wallet = walletList[0];
    if (parsed.walletNameHint) {
      const match = walletList.find((w: any) =>
        w.name.toLowerCase().includes(parsed.walletNameHint.toLowerCase())
      );
      if (match) wallet = match;
    }

    // 3. Resolve target wallet for transfer
    let targetWallet = null;
    if (parsed.type === 'transfer') {
      if (parsed.targetWalletNameHint) {
        targetWallet = walletList.find((w: any) =>
          w.id !== wallet.id &&
          w.name.toLowerCase().includes(parsed.targetWalletNameHint.toLowerCase())
        );
      }
      if (!targetWallet) {
        targetWallet = walletList.find((w: any) => w.id !== wallet.id) || null;
      }
      if (!targetWallet) {
        await sendTelegramMessage(
          chatId,
          `⚠️ <b>Transfer gagal:</b> Anda membutuhkan minimal 2 rekening terdaftar di ruang buku ini untuk melakukan transfer antar rekening.`
        );
        return;
      }
    }

    // 4. Resolve category
    const catList = categories || [];
    let category = null;
    if (parsed.type !== 'transfer' && catList.length > 0) {
      const typeCategories = catList.filter((c: any) => c.type === parsed.type);
      const match = typeCategories.find((c: any) =>
        parsed.notes.toLowerCase().includes(c.name.toLowerCase())
      );
      category = match || typeCategories[0] || catList[0];
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const generatedTxId = `tx_${Date.now()}`;

    // 5. Insert transaction into Supabase
    try {
      await supabase.from('transactions').insert({
        id: generatedTxId,
        tenant_id: binding.tenant_id,
        user_id: binding.user_id,
        user_name: `@${telegramUsername} (Bot)`,
        type: parsed.type,
        amount: parsed.amount,
        wallet_id: wallet.id,
        target_wallet_id: targetWallet?.id || null,
        category_id: category?.id || null,
        date: todayStr,
        notes: parsed.notes,
      });

      // 6. Update wallet balances in Supabase
      if (parsed.type === 'expense') {
        await supabase
          .from('wallets')
          .update({ balance: Math.max(0, Number(wallet.balance) - parsed.amount) })
          .eq('id', wallet.id);
      } else if (parsed.type === 'income') {
        await supabase
          .from('wallets')
          .update({ balance: Number(wallet.balance) + parsed.amount })
          .eq('id', wallet.id);
      } else if (parsed.type === 'transfer' && targetWallet) {
        await supabase
          .from('wallets')
          .update({ balance: Math.max(0, Number(wallet.balance) - parsed.amount) })
          .eq('id', wallet.id);
        await supabase
          .from('wallets')
          .update({ balance: Number(targetWallet.balance) + parsed.amount })
          .eq('id', targetWallet.id);
      }
    } catch (dbErr) {
      console.warn('Database write error:', dbErr);
    }

    // 7. Calculate new balance to show
    const newBal =
      parsed.type === 'expense'
        ? Number(wallet.balance) - parsed.amount
        : parsed.type === 'income'
        ? Number(wallet.balance) + parsed.amount
        : Number(wallet.balance) - parsed.amount;

    // 8. Send reply with Action buttons
    const typeLabel =
      parsed.type === 'expense'
        ? '🔴 Pengeluaran'
        : parsed.type === 'income'
        ? '🟢 Pemasukan'
        : '🔁 Transfer';

    const confirmationText =
      `✅ <b>Transaksi Berhasil Dicatat!</b>\n\n` +
      `📂 <b>Ruang Buku:</b> ${getTenantEmoji(tenantType)} ${tenantName}\n` +
      `• <b>Tipe:</b> ${typeLabel}\n` +
      `• <b>Nominal:</b> <b>Rp ${parsed.amount.toLocaleString('id-ID')}</b>\n` +
      `• <b>Catatan:</b> ${parsed.notes}\n` +
      `• <b>Rekening:</b> ${wallet.name} <i>(Sisa: Rp ${newBal.toLocaleString('id-ID')})</i>\n` +
      (targetWallet ? `• <b>Tujuan:</b> ${targetWallet.name}\n` : '') +
      (category ? `• <b>Kategori:</b> ${category.name}\n` : '') +
      `• <b>Tanggal:</b> ${todayStr}`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '🗑 Batalkan Transaksi', callback_data: `cancel_tx:${generatedTxId}` },
          { text: '📊 Cek Saldo', callback_data: 'check_saldo' },
        ],
        [
          { text: '🔄 Ganti Scope', callback_data: 'switch_scope' },
        ]
      ],
    };

    await sendTelegramMessage(chatId, confirmationText, inlineKeyboard);
  } catch (err: any) {
    console.error('Execute transaction error:', err);
    await sendTelegramMessage(chatId, `❌ Gagal menyimpan transaksi: ${err.message}`);
  }
}

/**
 * Handle callback queries from inline buttons
 */
async function handleCallbackQuery(cb: any) {
  const data = cb.data;
  const messageId = cb.message?.message_id;
  const chatId = cb.message?.chat?.id;
  const callbackQueryId = cb.id;
  const telegramUserId = String(cb.from?.id || chatId);

  const supabase = getSupabase();

  if (data.startsWith('cancel_tx:')) {
    const txId = data.split(':')[1];
    try {
      await supabase.from('transactions').delete().eq('id', txId);
      await answerCallbackQuery(callbackQueryId, 'Transaksi berhasil dibatalkan!');

      if (chatId && messageId) {
        await editTelegramMessage(
          chatId,
          messageId,
          `🚫 <b>[TRANSAKSI DIBATALKAN]</b>\n\n` +
          `Transaksi telah dibatalkan dan dihapus secara otomatis.`
        );
      }
    } catch (e: any) {
      await answerCallbackQuery(callbackQueryId, `Transaksi telah dibatalkan.`);
    }
  } else if (data.startsWith('set_scope:')) {
    const targetTenantId = data.split(':')[1];
    const binding = await getBinding(telegramUserId, supabase);
    if (!binding) {
      await answerCallbackQuery(callbackQueryId, 'Akun belum terhubung');
      return;
    }
    const { data: tenant } = await supabase.from('tenants').select('*').eq('id', targetTenantId).maybeSingle();
    if (tenant) {
      await answerCallbackQuery(callbackQueryId, `Scope diubah ke ${tenant.name}`);
      await switchBindingScope(chatId, telegramUserId, binding, tenant, supabase, messageId);
    } else {
      await answerCallbackQuery(callbackQueryId, 'Scope tidak ditemukan');
    }
  } else if (data === 'switch_scope') {
    const binding = await getBinding(telegramUserId, supabase);
    if (binding) {
      await answerCallbackQuery(callbackQueryId);
      await handleScope(chatId, telegramUserId, binding, null, supabase);
    } else {
      await answerCallbackQuery(callbackQueryId, 'Akun belum terhubung');
    }
  } else if (data === 'check_saldo') {
    const binding = await getBinding(telegramUserId, supabase);
    if (binding) {
      await answerCallbackQuery(callbackQueryId);
      await handleSaldo(chatId, binding, supabase);
    } else {
      await answerCallbackQuery(callbackQueryId, 'Akun belum terhubung');
    }
  } else if (data === 'check_rekap') {
    const binding = await getBinding(telegramUserId, supabase);
    if (binding) {
      await answerCallbackQuery(callbackQueryId);
      await handleRekap(chatId, binding, supabase);
    } else {
      await answerCallbackQuery(callbackQueryId, 'Akun belum terhubung');
    }
  }
}
