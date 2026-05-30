# Stroika Texture Pack — normalized

Texture pack для игрового прототипа **«Стройка века»**.

Пак нормализован для вставки в Vite/React проект `llm-powered-cv`: текстуры лежат в `textures/`, превью для карточки лендинга — в `preview/`.

## Структура

```text
stroika_texture_pack/
  README_TEXTURES.md
  preview/
    stroika-preview.webp
  textures/
    blueprint_basic_01.webp
    blueprint_sector_01.webp
    blueprint_industrial_01.webp
    blueprint_restricted_01.webp
    concrete_roof_01.webp
    concrete_roof_02.webp
    panel_roof_01.webp
    institute_roof_01.webp
    industrial_roof_01.webp
    road_asphalt_01.webp
    road_service_01.webp
    wasteland_blocked_01.webp
    wasteland_blocked_02.webp
    foundation_01.webp
    foundation_danger_01.webp
    paper_noise_01.webp
    stamp_noise_01.png
```

## Проверенные параметры

| File | Format | Resolution | Mode | Size |
|---|---:|---:|---:|---:|
| `preview/stroika-preview.webp` | WEBP | 1600x900 | RGB | 399.4 KB |
| `textures/blueprint_basic_01.webp` | WEBP | 512x512 | RGB | 4.2 KB |
| `textures/blueprint_industrial_01.webp` | WEBP | 512x512 | RGB | 4.8 KB |
| `textures/blueprint_restricted_01.webp` | WEBP | 512x512 | RGB | 6.2 KB |
| `textures/blueprint_sector_01.webp` | WEBP | 512x512 | RGB | 6.2 KB |
| `textures/concrete_roof_01.webp` | WEBP | 512x512 | RGB | 4.7 KB |
| `textures/concrete_roof_02.webp` | WEBP | 512x512 | RGB | 5.6 KB |
| `textures/foundation_01.webp` | WEBP | 512x512 | RGB | 11.8 KB |
| `textures/foundation_danger_01.webp` | WEBP | 512x512 | RGB | 20.9 KB |
| `textures/industrial_roof_01.webp` | WEBP | 512x512 | RGB | 6.6 KB |
| `textures/institute_roof_01.webp` | WEBP | 512x512 | RGB | 4.0 KB |
| `textures/panel_roof_01.webp` | WEBP | 512x512 | RGB | 7.6 KB |
| `textures/paper_noise_01.webp` | WEBP | 512x512 | RGB | 2.0 KB |
| `textures/road_asphalt_01.webp` | WEBP | 512x512 | RGB | 5.6 KB |
| `textures/road_service_01.webp` | WEBP | 512x512 | RGB | 4.2 KB |
| `textures/stamp_noise_01.png` | PNG | 512x512 | RGBA | 49.9 KB |
| `textures/wasteland_blocked_01.webp` | WEBP | 512x512 | RGB | 17.9 KB |
| `textures/wasteland_blocked_02.webp` | WEBP | 512x512 | RGB | 6.5 KB |

## Назначение

### Preview

- `preview/stroika-preview.webp` — изображение для карточки прототипа на лендинге. Размер: `1600x900`, формат: WebP.

### Board / blueprint backgrounds

- `textures/blueprint_basic_01.webp` — базовая чертежная подложка.
- `textures/blueprint_sector_01.webp` — секторная подложка для средних уровней.
- `textures/blueprint_industrial_01.webp` — индустриальная подложка.
- `textures/blueprint_restricted_01.webp` — подложка для уровней с пустырями.

### Buildings

- `textures/concrete_roof_01.webp` — базовая бетонная крыша.
- `textures/concrete_roof_02.webp` — альтернативная бетонная крыша.
- `textures/panel_roof_01.webp` — панельная крыша.
- `textures/institute_roof_01.webp` — крыша крупного института/НИИ.
- `textures/industrial_roof_01.webp` — промышленная крыша.

### Roads / foundation / wasteland

- `textures/road_asphalt_01.webp` — темная дорога/асфальт.
- `textures/road_service_01.webp` — служебный бетонный проезд.
- `textures/foundation_01.webp` — валидный фундамент во время drag.
- `textures/foundation_danger_01.webp` — warning/fail foundation, не настоящий пустырь.
- `textures/wasteland_blocked_01.webp` — основной blocked tile `ПУСТЫРЬ`.
- `textures/wasteland_blocked_02.webp` — альтернативный blocked tile.

### UI

- `textures/paper_noise_01.webp` — бумажная фактура.
- `textures/stamp_noise_01.png` — прозрачная маска/потертость для штампов.

## Правила ручной замены

1. Сохраняй те же имена файлов, если хочешь заменить текстуру без изменения кода.
2. Текстуры держать `512x512`, WebP. Исключение: `stamp_noise_01.png` должен оставаться PNG с alpha.
3. Preview держать `1600x900`, WebP, файл `preview/stroika-preview.webp`.
4. Не использовать кириллицу, пробелы и uppercase в именах файлов.
5. После замены ассетов выполнить `npm run build`.
6. Если меняешь имена файлов — обновить импорты/CSS variables в коде.

## CSS variable map

Рекомендуемая карта переменных в `.stroika-game`:

```css
.stroika-game {
  --stroika-tex-blueprint-basic: url("../assets/stroika/textures/blueprint_basic_01.webp");
  --stroika-tex-blueprint-sector: url("../assets/stroika/textures/blueprint_sector_01.webp");
  --stroika-tex-blueprint-industrial: url("../assets/stroika/textures/blueprint_industrial_01.webp");
  --stroika-tex-blueprint-restricted: url("../assets/stroika/textures/blueprint_restricted_01.webp");

  --stroika-tex-concrete-roof-01: url("../assets/stroika/textures/concrete_roof_01.webp");
  --stroika-tex-concrete-roof-02: url("../assets/stroika/textures/concrete_roof_02.webp");
  --stroika-tex-panel-roof-01: url("../assets/stroika/textures/panel_roof_01.webp");
  --stroika-tex-institute-roof-01: url("../assets/stroika/textures/institute_roof_01.webp");
  --stroika-tex-industrial-roof-01: url("../assets/stroika/textures/industrial_roof_01.webp");

  --stroika-tex-road-asphalt: url("../assets/stroika/textures/road_asphalt_01.webp");
  --stroika-tex-road-service: url("../assets/stroika/textures/road_service_01.webp");

  --stroika-tex-wasteland-blocked-01: url("../assets/stroika/textures/wasteland_blocked_01.webp");
  --stroika-tex-wasteland-blocked-02: url("../assets/stroika/textures/wasteland_blocked_02.webp");

  --stroika-tex-foundation: url("../assets/stroika/textures/foundation_01.webp");
  --stroika-tex-foundation-danger: url("../assets/stroika/textures/foundation_danger_01.webp");

  --stroika-tex-paper-noise: url("../assets/stroika/textures/paper_noise_01.webp");
  --stroika-tex-stamp-noise: url("../assets/stroika/textures/stamp_noise_01.png");
}
```

## Важные визуальные ограничения

- `wasteland_blocked_*` использовать только для настоящего `ПУСТЫРЯ`, не для danger selection.
- `foundation_danger_01.webp` использовать для warning/fail selection.
- Blueprint-подложки должны быть low-opacity, чтобы не забивать здания и римские цифры.
- Texture pack должен работать как дополнительный слой поверх текущих CSS fallback styles, а не заменять их полностью.
