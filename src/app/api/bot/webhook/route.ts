import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { parseTelegramMessage } from '@/lib/bot-parser';
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
    if (expectedSecret && secretToken !== expectedSecret) {
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

    // Handle /start command (may contain deep link payload: /start AF-123456)
    if (rawText.startsWith('/start')) {
      const parts = rawText.split(/\s+/);
      if (parts.length > 1 && parts[1].startsWith('AF-')) {
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
        `📖 <b>Panduan Format Pencatatan ArthaFlow:</b>\n\n` +
        `<b>1. Pengeluaran:</b>\n` +
        `• <code>keluar 50rb makan siang bca</code>\n` +
        `• <code>beli kopi 25k cash</code>\n` +
        `• <code>byr listrik 350.000 mandiri</code>\n\n` +
        `<b>2. Pemasukan:</b>\n` +
        `• <code>masuk 5jt gaji bca</code>\n` +
        `• <code>terima 500k refund tiket cash</code>\n\n` +
        `<b>3. Transfer Antar Rekening:</b>\n` +
        `• <code>tf 100k bca ke gopay</code>\n` +
        `• <code>transfer 500rb mandiri ovo</code>\n\n` +
        `<b>4. Perintah Tambahan:</b>\n` +
        `• <code>/saldo</code> — Lihat ringkasan saldo seluruh rekening\n` +
        `• <code>/rekap</code> — Lihat rekap transaksi hari ini & bulan ini\n` +
        `• <code>/pair KODE</code> — Hubungkan akun Telegram ke ArthaFlow`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /pair command
    if (rawText.startsWith('/pair')) {
      const parts = rawText.split(/\s+/);
      if (parts.length < 2) {
        await sendTelegramMessage(
          chatId,
          `⚠️ <b>Format salah.</b>\nGunakan: <code>/pair KODE_PAIRING</code>\nContoh: <code>/pair AF-829102</code>`
        );
        return NextResponse.json({ ok: true });
      }
      await handlePairing(chatId, telegramUserId, telegramUsername, parts[1].toUpperCase(), supabase);
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
        `❓ Format tidak dikenali. Ketik <code>/help</code> untuk contoh atau format:\n` +
        `• <code>keluar 50rb makan siang bca</code>\n` +
        `• <code>masuk 2jt bonus bca</code>\n` +
        `• <code>tf 100k bca ke gopay</code>`
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

/**
 * Handle user account pairing
 */
async function handlePairing(
  chatId: number | string,
  telegramUserId: string,
  telegramUsername: string,
  code: string,
  supabase: any
) {
  try {
    let pairingData: any = null;

    const { data, error } = await supabase
      .from('telegram_pairing_codes')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (!error && data) {
      pairingData = data;
    }

    if (!pairingData) {
      await sendTelegramMessage(
        chatId,
        `❌ <b>Kode pairing tidak valid atau telah kedaluwarsa.</b>\n` +
        `Silakan generate kode baru melalui dashboard ArthaFlow.`
      );
      return;
    }

    // Insert or update binding
    await supabase.from('telegram_bindings').upsert({
      telegram_user_id: telegramUserId,
      telegram_username: telegramUsername,
      telegram_chat_id: String(chatId),
      user_id: pairingData.user_id,
      tenant_id: pairingData.tenant_id,
      updated_at: new Date().toISOString(),
    });

    // Delete used pairing code
    await supabase.from('telegram_pairing_codes').delete().eq('code', code);

    await sendTelegramMessage(
      chatId,
      `🎉 <b>Akun Berhasil Terhubung!</b>\n\n` +
      `Akun Telegram Anda (@${telegramUsername}) kini terhubung ke scope keuangan ArthaFlow.\n\n` +
      `Sekarang Anda dapat langsung mencatat transaksi kapan saja:\n` +
      `• <code>keluar 35rb sarapan pagi</code>\n` +
      `• <code>masuk 1.5jt freelance</code>\n` +
      `• <code>/saldo</code> untuk cek saldo dompet`
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
  try {
    const { data } = await supabase
      .from('telegram_bindings')
      .select('*')
      .eq('telegram_user_id', telegramUserId)
      .maybeSingle();
    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Show balances of wallets in the tenant
 */
async function handleSaldo(chatId: number | string, binding: any, supabase: any) {
  try {
    const { data: wallets } = await supabase
      .from('wallets')
      .select('*')
      .eq('tenant_id', binding.tenant_id)
      .eq('is_active', true);

    if (!wallets || wallets.length === 0) {
      await sendTelegramMessage(chatId, `ℹ️ Belum ada rekening atau dompet aktif di scope ini.`);
      return;
    }

    let total = 0;
    let listText = '';

    for (const w of wallets) {
      total += Number(w.balance || 0);
      listText += `• <b>${w.name}</b>: Rp ${Number(w.balance || 0).toLocaleString('id-ID')}\n`;
    }

    const msg =
      `💳 <b>Ringkasan Saldo Rekening & Dompet</b>\n\n` +
      `${listText}\n` +
      `💰 <b>Total Kekayaan Bersih:</b> Rp ${total.toLocaleString('id-ID')}`;

    await sendTelegramMessage(chatId, msg);
  } catch (err: any) {
    await sendTelegramMessage(chatId, `❌ Gagal mengambil saldo: ${err.message}`);
  }
}

/**
 * Show transaction recap for today & this month
 */
async function handleRekap(chatId: number | string, binding: any, supabase: any) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const firstDayMonth = `${todayStr.substring(0, 7)}-01`;

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('tenant_id', binding.tenant_id)
      .gte('date', firstDayMonth);

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
      `📊 <b>Rekapitulasi Keuangan ArthaFlow</b>\n\n` +
      `📅 <b>Hari Ini (${todayStr}):</b>\n` +
      `• Pemasukan: 🟢 Rp ${todayIncome.toLocaleString('id-ID')}\n` +
      `• Pengeluaran: 🔴 Rp ${todayExpense.toLocaleString('id-ID')}\n` +
      `• Net Hari Ini: <b>Rp ${(todayIncome - todayExpense).toLocaleString('id-ID')}</b>\n\n` +
      `🗓 <b>Bulan Ini:</b>\n` +
      `• Total Pemasukan: 🟢 Rp ${monthIncome.toLocaleString('id-ID')}\n` +
      `• Total Pengeluaran: 🔴 Rp ${monthExpense.toLocaleString('id-ID')}\n` +
      `• Arus Kas Bersih: <b>Rp ${(monthIncome - monthExpense).toLocaleString('id-ID')}</b>`;

    await sendTelegramMessage(chatId, msg);
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
    // 1. Fetch available wallets & categories
    const { data: wallets } = await supabase
      .from('wallets')
      .select('*')
      .eq('tenant_id', binding.tenant_id)
      .eq('is_active', true);

    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', binding.tenant_id);

    if (!wallets || wallets.length === 0) {
      await sendTelegramMessage(chatId, `❌ Belum ada dompet/rekening aktif yang terdaftar di ArthaFlow.`);
      return;
    }

    // 2. Resolve source wallet
    let wallet = wallets[0];
    if (parsed.walletNameHint) {
      const match = wallets.find((w: any) =>
        w.name.toLowerCase().includes(parsed.walletNameHint.toLowerCase())
      );
      if (match) wallet = match;
    } else if (binding.default_wallet_id) {
      const def = wallets.find((w: any) => w.id === binding.default_wallet_id);
      if (def) wallet = def;
    }

    // 3. Resolve target wallet for transfer
    let targetWallet = null;
    if (parsed.type === 'transfer') {
      if (parsed.targetWalletNameHint) {
        targetWallet = wallets.find((w: any) =>
          w.id !== wallet.id &&
          w.name.toLowerCase().includes(parsed.targetWalletNameHint.toLowerCase())
        );
      }
      if (!targetWallet) {
        targetWallet = wallets.find((w: any) => w.id !== wallet.id);
      }
    }

    // 4. Resolve category
    let category = null;
    if (categories && categories.length > 0) {
      if (parsed.type !== 'transfer') {
        const typeCategories = categories.filter((c: any) => c.type === parsed.type);
        // Look for matching keywords in notes
        const match = typeCategories.find((c: any) =>
          parsed.notes.toLowerCase().includes(c.name.toLowerCase())
        );
        category = match || typeCategories[0] || categories[0];
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 5. Insert transaction
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .insert({
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
      })
      .select()
      .single();

    if (txError) throw txError;

    // 6. Update wallet balances
    if (parsed.type === 'expense') {
      await supabase
        .from('wallets')
        .update({ balance: Number(wallet.balance) - parsed.amount })
        .eq('id', wallet.id);
    } else if (parsed.type === 'income') {
      await supabase
        .from('wallets')
        .update({ balance: Number(wallet.balance) + parsed.amount })
        .eq('id', wallet.id);
    } else if (parsed.type === 'transfer' && targetWallet) {
      await supabase
        .from('wallets')
        .update({ balance: Number(wallet.balance) - parsed.amount })
        .eq('id', wallet.id);
      await supabase
        .from('wallets')
        .update({ balance: Number(targetWallet.balance) + parsed.amount })
        .eq('id', targetWallet.id);
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
          { text: '🗑 Batalkan Transaksi', callback_data: `cancel_tx:${tx.id}` },
          { text: '📊 Cek Saldo', callback_data: 'check_saldo' },
        ],
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
      // 1. Fetch transaction
      const { data: tx } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', txId)
        .maybeSingle();

      if (!tx) {
        await answerCallbackQuery(callbackQueryId, 'Transaksi sudah dihapus atau tidak ditemukan.');
        return;
      }

      // 2. Revert wallet balances
      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', tx.wallet_id)
        .maybeSingle();

      if (wallet) {
        if (tx.type === 'expense') {
          await supabase
            .from('wallets')
            .update({ balance: Number(wallet.balance) + Number(tx.amount) })
            .eq('id', wallet.id);
        } else if (tx.type === 'income') {
          await supabase
            .from('wallets')
            .update({ balance: Number(wallet.balance) - Number(tx.amount) })
            .eq('id', wallet.id);
        } else if (tx.type === 'transfer' && tx.target_wallet_id) {
          const { data: targetWallet } = await supabase
            .from('wallets')
            .select('*')
            .eq('id', tx.target_wallet_id)
            .maybeSingle();

          await supabase
            .from('wallets')
            .update({ balance: Number(wallet.balance) + Number(tx.amount) })
            .eq('id', wallet.id);

          if (targetWallet) {
            await supabase
              .from('wallets')
              .update({ balance: Number(targetWallet.balance) - Number(tx.amount) })
              .eq('id', targetWallet.id);
          }
        }
      }

      // 3. Delete transaction record
      await supabase.from('transactions').delete().eq('id', txId);

      await answerCallbackQuery(callbackQueryId, 'Transaksi berhasil dibatalkan!');

      if (chatId && messageId) {
        await editTelegramMessage(
          chatId,
          messageId,
          `🚫 <b>[TRANSAKSI DIBATALKAN]</b>\n\n` +
          `Transaksi nominal <b>Rp ${Number(tx.amount).toLocaleString('id-ID')}</b> telah dihapus dan saldo rekening telah dipulihkan secara otomatis.`
        );
      }
    } catch (e: any) {
      await answerCallbackQuery(callbackQueryId, `Gagal membatalkan: ${e.message}`);
    }
  } else if (data === 'check_saldo') {
    const binding = await getBinding(telegramUserId, supabase);
    if (binding) {
      await answerCallbackQuery(callbackQueryId);
      await handleSaldo(chatId, binding, supabase);
    } else {
      await answerCallbackQuery(callbackQueryId, 'Akun belum terhubung');
    }
  }
}
