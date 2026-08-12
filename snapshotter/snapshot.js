#!/usr/bin/env node
/**
 * Bybit P2P seller-history snapshotter.
 *
 * Runs on a server (cron / systemd timer), polls Bybit P2P USDT/RUB/Sberbank
 * every run, and accumulates a per-seller history JSON. The static page
 * (index.html) fetches this file via HISTORY_URL and merges it into its local
 * history — giving every visitor real 24/7 age / growth / nick-change signals
 * instead of browser-only accumulation.
 *
 * Output shape (consumed by index.html fetchRemoteHistory):
 *   { updatedAt: <ms>, sellers: { <userId>: { fs, ls, nf, nl, nk, nc, sn, pmin, pmax } } }
 *     fs = firstSeen ms, ls = lastSeen ms
 *     nf = finishNum first observed, nl = finishNum last observed
 *     nk = latest nick, nc = nick-change count, sn = snapshot count
 *     pmin/pmax = min/max observed price (bait / range signal)
 *
 * Zero deps (Node 18+ global fetch). Run: node snapshot.js
 */

'use strict';
const fs = require('fs');
const path = require('path');

const OUT = process.env.SNAP_OUT || path.join(__dirname, 'sellers.json');
const BYBIT_URL = 'https://api2.bybit.com/fiat/otc/item/online';
const MAX_PAGES = Number(process.env.SNAP_MAX_PAGES || 60);
const PAGE_SIZE = 30;
const PAYMENT = ['14'];            // Sberbank
const PRUNE_DAYS = Number(process.env.SNAP_PRUNE_DAYS || 120); // drop sellers unseen this long

async function fetchPage(page) {
    const body = { tokenId: 'USDT', currencyId: 'RUB', payment: PAYMENT, side: '0', size: String(PAGE_SIZE), page: String(page), amount: '' };
    const r = await fetch(BYBIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 snapshotter' },
        body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    if (data.ret_code !== 0) throw new Error('ret_code=' + data.ret_code);
    return (data.result && data.result.items) || [];
}

function loadStore() {
    try {
        const j = JSON.parse(fs.readFileSync(OUT, 'utf8'));
        return j.sellers || {};
    } catch (e) { return {}; }
}

async function main() {
    const now = Date.now();
    const store = loadStore();
    let scanned = 0;

    for (let page = 1; page <= MAX_PAGES; page++) {
        let items;
        try { items = await fetchPage(page); }
        catch (e) { console.error('page', page, e.message); break; }
        if (!items.length) break;
        scanned += items.length;

        for (const o of items) {
            // Bybit с августа 2026 отдаёт userId = "0" у всех офферов → ключ мерчанта = userMaskId
            const uid = o.userMaskId || (o.userId && String(o.userId) !== '0' ? String(o.userId) : null);
            if (!uid) continue;
            const fin = Number(o.finishNum) || 0;
            const nick = o.nickName || null;
            const price = parseFloat(o.price);
            let h = store[uid];
            if (!h) {
                store[uid] = { fs: now, ls: now, nf: fin, nl: fin, nk: nick, nc: 0, sn: 1, pmin: price, pmax: price };
                continue;
            }
            if (nick && h.nk && nick !== h.nk) h.nc = (h.nc || 0) + 1;
            if (nick) h.nk = nick;
            h.nl = fin;
            h.sn = (h.sn || 1) + 1;         // one run = one snapshot (cron interval controls cadence)
            h.ls = now;
            if (isFinite(price)) {
                h.pmin = h.pmin == null ? price : Math.min(h.pmin, price);
                h.pmax = h.pmax == null ? price : Math.max(h.pmax, price);
            }
        }
        await new Promise(r => setTimeout(r, 300)); // be polite to Bybit
    }

    // prune long-unseen sellers to keep the file small
    const cutoff = now - PRUNE_DAYS * 86400000;
    for (const uid in store) if ((store[uid].ls || 0) < cutoff) delete store[uid];

    const tmp = OUT + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ updatedAt: now, sellers: store }));
    fs.renameSync(tmp, OUT);
    console.log(new Date(now).toISOString(), 'sellers=', Object.keys(store).length, 'scanned=', scanned);
}

main().catch(e => { console.error(e); process.exit(1); });
