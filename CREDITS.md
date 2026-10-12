# Фото и откуда они

## Первый экран: пара «День / Вечер» — Gemini (сгенерировал пользователь 2026-10-12)
`img/hero-day.webp` и `img/hero-night.webp` (896×1200, 3:4). Оригиналы: `Desktop\_archive\potolki-template-sources\hero-day-gen.jpg` и `hero-night-gen.jpg`, нарезка в `prep.py`.
Если пару нужно перегенерировать, промты ниже.

**Промт 1 (день):**
> Photorealistic interior photo of a modern living room in a European apartment. White matte stretch ceiling with built-in geometric LED light lines, lights switched OFF (thin light-grey grooves in the ceiling). Soft natural daylight from a large window on the left, light grey sofa, low oak TV unit, white walls, light floor, minimal decor, one big plant. VERTICAL portrait format 3:4. Camera at eye level in the middle of the room, looking slightly up: the ceiling with the light lines fills the top 45% of the frame, the sofa and TV unit are in the lower part. Keep the main elements in the center, leave calm walls at the left and right edges and at the very top and bottom (the image will be cropped there). High resolution. No people, no text, no logos, no watermark.

**Промт 2 (вечер)** — загрузить в Gemini картинку из промта 1:
> Same photo, same camera angle, same furniture and composition — change only the lighting to evening: the window shows deep blue dusk, all lamps are off, the LED light lines in the ceiling are switched ON and glow cool white, plus a hidden LED strip along the ceiling perimeter (floating ceiling effect). Soft reflections of the light lines on the floor. Keep everything else identical, same vertical 3:4 format.

Формат 3:4 нужен потому, что рамка фото на главной вертикальная: на десктопе 0,72, на телефоне 0,80, на планшете 0,93. Кадр 3:4 обрезается под каждую, поэтому важное должно быть по центру.

## Остальные фото — Pexels License (бесплатно, в том числе для коммерческого использования)
Исходники: `Desktop\_archive\potolki-template-sources`, нарезка в webp — `prep.py`.
Фото с людьми (m-laser, m-gyps) проверены: чужих логотипов нет.

| Исходник | Pexels |
|---|---|
| c-matte | https://www.pexels.com/photo/7195891/ |
| c-satin | https://www.pexels.com/photo/6489095/ |
| c-gloss | https://www.pexels.com/photo/7546321/ |
| c-color | https://www.pexels.com/photo/7173662/ |
| c-print | https://www.pexels.com/photo/9551395/ |
| c-fabric | https://www.pexels.com/photo/7195875/ |
| c-translucent | https://www.pexels.com/photo/6934244/ |
| l-lines | https://www.pexels.com/photo/7005450/ |
| l-float | https://www.pexels.com/photo/7195882/ |
| l-shadow | https://www.pexels.com/photo/6636309/ |
| l-track | https://www.pexels.com/photo/8089086/ |
| l-cornice | https://www.pexels.com/photo/7195879/ |
| l-twolevel | https://www.pexels.com/photo/7227627/ |
| l-twolevel2 | https://www.pexels.com/photo/7166945/ |
| l-corridor | https://www.pexels.com/photo/6444242/ |
| r-living | https://www.pexels.com/photo/7005457/ |
| r-bedroom | https://www.pexels.com/photo/6782567/ |
| r-kitchen | https://www.pexels.com/photo/7214456/ |
| r-kitchen2 | https://www.pexels.com/photo/6920452/ |
| r-bath | https://www.pexels.com/photo/6899349/ |
| r-bath2 | https://www.pexels.com/photo/7031836/ |
| r-kids | https://www.pexels.com/photo/7167069/ |
| r-hall | https://www.pexels.com/photo/7005462/ |
| r-hall2 | https://www.pexels.com/photo/6238610/ |
| w1 | https://www.pexels.com/photo/7546219/ |
| w2 | https://www.pexels.com/photo/7005449/ |
| w3 | https://www.pexels.com/photo/7227643/ |
| w4 | https://www.pexels.com/photo/7545494/ |
| w5 | https://www.pexels.com/photo/7031208/ |
| w6 | https://www.pexels.com/photo/8134823/ |
| w7 | https://www.pexels.com/photo/6585620/ |
| w8 | https://www.pexels.com/photo/6899353/ |
| w9 | https://www.pexels.com/photo/7534545/ |
| w10 | https://www.pexels.com/photo/6238607/ |
| w11 | https://www.pexels.com/photo/7005474/ |
| w12 | https://www.pexels.com/photo/7546283/ |
| m-laser | https://www.pexels.com/photo/6473973/ |
| m-worker | https://www.pexels.com/photo/6474133/ |
| m-corner | https://www.pexels.com/photo/8469950/ |
| m-gyps | https://www.pexels.com/photo/30580530/ |

Соответствие: c-* → `img/canvas-*.webp`, l-* → `img/light-*.webp` (l-corridor → `dark-bg.webp`), r-* → `img/room-*.webp`,
w1…w12 → `img/work-1…12.webp`, m-laser → `measure.webp`, m-gyps → `vs-gyps.webp`.

**«Наши работы», сметы и отзывы — заглушки** (на сайте подписаны плашкой «Пример — замените»). Перед показом клиенту заменить на его фото, объекты и реальные отзывы.
