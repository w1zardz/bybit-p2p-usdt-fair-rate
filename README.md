# USDT Fair Rate — Справедливый курс USDT/RUB

[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue?style=flat-square)](https://w1zardz.github.io/bybit-p2p-usdt-fair-rate/)

Мониторинг P2P офферов Bybit с расчётом справедливого курса USDT к рублю и автоматическим фильтром грязных денег. Помогает безопасно продать USDT на Сбербанк по честному курсу.

> **[Открыть приложение](https://w1zardz.github.io/bybit-p2p-usdt-fair-rate/)**

![Screenshot](https://via.placeholder.com/800x450?text=USDT+Fair+Rate+Screenshot)

## Зачем это нужно

На Bybit P2P офферы с завышенным курсом USDT часто связаны с грязными деньгами — казино, процессинг, дропы. Через месяцы или годы это может привести к блокировке счёта или уголовному преследованию по ст. 161 УК РФ. Этот инструмент показывает, какой курс USDT действительно безопасен.

## Возможности

- **Справедливый курс USDT** — рассчитывается из курса ЦБ РФ (USD/RUB) и рыночной цены USDT/USD (CoinGecko)
- **Фильтр грязных денег** — автоматическое определение подозрительных офферов с завышенным курсом
- **Рейтинг доверия (Trust Score)** — оценка надёжности продавца по количеству сделок, проценту завершения, KYC
- **Безопасная зона** — выделение офферов в диапазоне 95-98% от справедливого курса (реально чистый обмен USDT на рубли)
- **Прямые ссылки на Bybit** — переход к профилю продавца и продаже USDT в один клик
- **Фильтр по Сбербанку** — только офферы с оплатой на Сбербанк
- **Определение заблокированных офферов** — предупреждение о требованиях к минимальному количеству сделок

## Как это работает

1. Загружается текущий курс USD/RUB с сайта ЦБ РФ
2. Загружается цена USDT/USD с CoinGecko
3. Рассчитывается справедливый курс USDT к рублю (курс ЦБ x цена USDT)
4. Загружаются P2P офферы Bybit (продажа USDT за рубли, оплата на Сбербанк)
5. Каждый оффер проверяется на признаки грязных денег:
   - Цена выше справедливого курса — определённо грязные
   - Цена выше 98% от справедливого курса — вероятно грязные
   - Низкий процент завершения сделок — ненадёжный продавец
6. Безопасные офферы выделяются отдельно, подозрительные скрыты под спойлером

## Источники данных

- [ЦБ РФ](https://www.cbr-xml-daily.ru/) — официальный курс USD/RUB
- [CoinGecko](https://www.coingecko.com/) — рыночная цена USDT
- [Bybit P2P](https://www.bybit.com/fiat/trade/otc) — офферы на покупку/продажу USDT

## Технологии

Одностраничное приложение без зависимостей — чистый HTML, CSS и JavaScript. Хостинг на GitHub Pages.

---

## English

### USDT Fair Rate — Fair USDT/RUB Exchange Rate Calculator

A real-time monitoring tool for Bybit P2P offers that calculates the fair USDT to Russian Ruble exchange rate and automatically detects potentially dirty money offers.

**[Live Demo](https://w1zardz.github.io/bybit-p2p-usdt-fair-rate/)**

### Features

- **Fair rate calculation** from Central Bank of Russia (USD/RUB) and CoinGecko (USDT/USD)
- **Dirty money detection** — flags suspicious offers above fair rate thresholds
- **Trust scoring** — rates merchants by completed orders, completion rate, and KYC status
- **Safe zone highlighting** — offers at 95-98% of fair rate (clean P2P trading range)
- **Direct Bybit links** — one-click access to merchant profiles
- **Sberbank filter** — only shows offers accepting Sberbank payments

### How It Works

The tool fetches the official USD/RUB rate from the Central Bank of Russia, multiplies it by the USDT/USD market price, and compares real Bybit P2P offers against this fair rate. Offers significantly above the fair rate are flagged as potential dirty money (casino processing, drops, etc.), while offers in the 95-98% range are marked as safe for trading.

### Tech Stack

Zero-dependency single-page app — vanilla HTML, CSS, and JavaScript. Hosted on GitHub Pages.
