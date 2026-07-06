# Snapshotter — серверная история продавцов

Cron-скрипт, который 24/7 опрашивает Bybit P2P и копит историю мейкеров в `sellers.json`.
Статичная страница (`index.html`, `HISTORY_URL`) подтягивает этот файл и мёржит в локальную историю —
так каждый посетитель сразу получает реальные сигналы возраста / роста сделок / смены ника,
которые браузер-only накопить не может («знаком ≥14 дней» перестаёт резать всех подряд).

## Зачем

- **Скорость**: страница может грузить готовый `sellers.json` вместо 28+ сек опроса 90 страниц.
- **Сильные анти-дроп сигналы**: возраст мейкера в выдаче, скорость роста сделок (>100/день = процессинг-конвейер), смены ника, диапазон цены (bait). Дропы живут дни — возраст ловит их.
- **Меньше зависимости от corsproxy.io** (опрос идёт с сервера напрямую).

## Требования

- Node 18+ (глобальный `fetch`).
- Сервер, с которого достижим `api2.bybit.com` (проверить: `curl -sI https://api2.bybit.com`). RU-edge обычно ок.
- nginx, отдающий `sellers.json` с CORS (для GitHub Pages origin).

## Установка (пример на edge `2.56.178.219`)

```bash
mkdir -p /opt/p2p-snapshotter
scp snapshotter/snapshot.js root@2.56.178.219:/opt/p2p-snapshotter/
```

### systemd timer (предпочтительно — §0.55 CLAUDE.md: standalone → systemd)

```ini
# /etc/systemd/system/p2p-snapshot.service
[Unit]
Description=Bybit P2P seller snapshotter
After=network-online.target
Wants=network-online.target
[Service]
Type=oneshot
Environment=SNAP_OUT=/var/www/p2p/sellers.json
ExecStart=/usr/bin/node /opt/p2p-snapshotter/snapshot.js
```
```ini
# /etc/systemd/system/p2p-snapshot.timer
[Unit]
Description=Run p2p snapshotter every 30 min
[Timer]
OnBootSec=2min
OnUnitActiveSec=30min
Persistent=true
[Install]
WantedBy=timers.target
```
```bash
mkdir -p /var/www/p2p
systemctl daemon-reload && systemctl enable --now p2p-snapshot.timer
systemctl start p2p-snapshot.service   # первый прогон сразу
```

### nginx (CORS-отдача JSON)

```nginx
# в server-блоке edge
location = /p2p/sellers.json {
    alias /var/www/p2p/sellers.json;
    add_header Access-Control-Allow-Origin "*" always;
    add_header Cache-Control "public, max-age=300";
    default_type application/json;
}
```

## Подключение страницы

В `index.html` выставить:
```js
const HISTORY_URL = 'https://<edge-домен>/p2p/sellers.json';
```
Пустая строка = фича выключена (текущее поведение, никаких сетевых изменений).

## Проверка

```bash
node /opt/p2p-snapshotter/snapshot.js   # ручной прогон → лог sellers=N
curl -s https://<edge>/p2p/sellers.json | head -c 200
```

## ⚠️ Перед деплоем

1. Проверить достижимость Bybit с сервера (иначе снапшоттер пустой).
2. §0.6 CLAUDE.md — `sellers.json` отдаётся с origin/edge напрямую, БЕЗ CDN-proxy toggle.
3. Файл копится ~недели — реальная польза сигналов через 2-3 недели наблюдений.
