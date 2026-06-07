import {
  Activity,
  Crosshair,
  GitMerge,
  HeartPulse,
  Layers,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { type CSSProperties, type PointerEvent, type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { BASE_HEALTH, BOARD_COLS, BOARD_ROWS, LEVEL_TITLE, MUTAGENS, WAVE_CONFIGS } from "./organizm/balance";
import { EnemySprite } from "./organizm/components/EnemySprite";
import { PatchModule } from "./organizm/components/PatchTile";
import { createBattleState, runBattleStep as advanceBattleStep } from "./organizm/logic/battleStep";
import {
  cellKey,
  clamp,
  getAbsolutePatchCells,
  getBoardEntries,
  getOverlappingBoardPatch,
  getPlacementValidation,
} from "./organizm/logic/placement";
import { getDistance } from "./organizm/logic/targeting";
import {
  canMergeItems,
  formatCooldown,
  getPassiveStats,
  getPatchBounds,
  getPatchCategoryLabel,
  getPatchConfig,
  getPatchKindLabel,
  getPatchStats,
  levelToRoman,
  levelUp,
  PATCH_ORDER,
  REWARD_TABLE,
  STARTER_PATCHES,
} from "./organizm/patchCatalog";
import type {
  BattleState,
  BoardPatches,
  BoardPosition,
  CellCoord,
  DragState,
  GameMode,
  PatchBaseId,
  PatchInstance,
  PatchLevel,
  PatchZone,
  SelectedItem,
} from "./organizm/types";
import "./OrganizmGame.css";

function getBoardCellFromPointer(event: PointerEvent, boardElement: HTMLDivElement | null): CellCoord | null {
  if (!boardElement) {
    return null;
  }

  const rect = boardElement.getBoundingClientRect();
  const xRatio = (event.clientX - rect.left) / rect.width;
  const yRatio = (event.clientY - rect.top) / rect.height;

  if (xRatio < 0 || xRatio > 1 || yRatio < 0 || yRatio > 1) {
    return null;
  }

  return {
    x: clamp(Math.floor(xRatio * BOARD_COLS), 0, BOARD_COLS - 1),
    y: clamp(Math.floor(yRatio * BOARD_ROWS), 0, BOARD_ROWS - 1),
  };
}

function getCandidateFromPointer(
  event: PointerEvent,
  boardElement: HTMLDivElement | null,
  anchor: CellCoord,
): BoardPosition | null {
  const cell = getBoardCellFromPointer(event, boardElement);

  if (!cell) {
    return null;
  }

  return {
    x: cell.x - anchor.x,
    y: cell.y - anchor.y,
  };
}

function isPointerInsideElement(event: PointerEvent, element: HTMLElement | null) {
  if (!element) {
    return false;
  }

  const rect = element.getBoundingClientRect();

  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

function getPatchAtElementPoint(clientX: number, clientY: number) {
  const element = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
  const target = element?.closest<HTMLElement>("[data-organizm-patch-uid]");

  if (!target) {
    return null;
  }

  const uid = target.dataset.organizmPatchUid;
  const zone = target.dataset.organizmPatchZone as PatchZone | undefined;

  return uid && zone ? { uid, zone } : null;
}

function GameHUD({
  health,
  maxHealth,
  waveNumber,
}: {
  health: number;
  maxHealth: number;
  waveNumber: number;
}) {
  const healthPercent = maxHealth > 0 ? Math.max(0, Math.min(100, (health / maxHealth) * 100)) : 0;
  const style = { "--organizm-health": `${healthPercent}%` } as CSSProperties;

  return (
    <div className="organizm-hud" aria-label="Состояние Organizm">
      <div className="organizm-hud__brand">
        <Activity className="organizm-hud__brand-icon" aria-hidden="true" />
        <div>
          <span>Organizm</span>
          <strong>Сектор 01</strong>
        </div>
      </div>
      <div className="organizm-hud__stat organizm-hud__stat--health" style={style}>
        <HeartPulse className="organizm-hud__icon" aria-hidden="true" />
        <span>Здоровье</span>
        <strong>
          {health}/{maxHealth}
        </strong>
        <i aria-hidden="true" />
      </div>
      <div className="organizm-hud__stat">
        <Shield className="organizm-hud__icon" aria-hidden="true" />
        <span>Волна</span>
        <strong>{waveNumber}/5</strong>
      </div>
      <div className="organizm-hud__stat">
        <span className="organizm-mutagen-icon" aria-hidden="true" />
        <span>Мутагены</span>
        <strong>{MUTAGENS}</strong>
      </div>
    </div>
  );
}

function Battlefield({
  battle,
  health,
  maxHealth,
  mode,
  now,
}: {
  battle: BattleState;
  health: number;
  maxHealth: number;
  mode: GameMode;
  now: number;
}) {
  const coreStyle = {
    "--organizm-core-health": `${maxHealth > 0 ? Math.max(0, (health / maxHealth) * 100) : 0}%`,
  } as CSSProperties;
  const coreClasses = [
    "organizm-core",
    battle.beams.some((beam) => now - beam.createdAt < 430) ? "organizm-core--attack" : "",
    battle.effects.some((effect) => effect.type === "heal" && now - effect.createdAt < 620) ? "organizm-core--heal" : "",
    battle.effects.some((effect) => effect.type === "breach" && now - effect.createdAt < 620) ? "organizm-core--breach" : "",
    mode === "level-cleared" ? "organizm-core--stable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="organizm-battlefield" aria-label="Сектор заражения">
      <div className="organizm-battlefield__scanline" aria-hidden="true" />
      <div className="organizm-battlefield__edge organizm-battlefield__edge--top" aria-hidden="true" />
      <div className="organizm-battlefield__edge organizm-battlefield__edge--right" aria-hidden="true" />
      <div className="organizm-battlefield__edge organizm-battlefield__edge--bottom" aria-hidden="true" />
      <div className="organizm-battlefield__edge organizm-battlefield__edge--left" aria-hidden="true" />
      <div className={coreClasses} style={coreStyle} aria-label={`Ядро Organizm, здоровье ${health} из ${maxHealth}`}>
        <span className="organizm-core__ring" aria-hidden="true" />
        <span className="organizm-core__body" aria-hidden="true" />
        <span className="organizm-core__health" aria-hidden="true" />
        <span className="organizm-core__membrane" aria-hidden="true" />
        <span className="organizm-core__hp" aria-hidden="true">
          {health}
        </span>
      </div>

      {battle.beams.map((beam) => {
        const liveTarget = beam.source === "patch" && beam.targetId ? battle.enemies.find((enemy) => enemy.id === beam.targetId) : null;
        const targetPoint = liveTarget ? { x: liveTarget.x, y: liveTarget.y } : { x: beam.toX, y: beam.toY };
        const length = getDistance({ x: beam.fromX, y: beam.fromY }, targetPoint);
        const angle = Math.atan2(targetPoint.y - beam.fromY, targetPoint.x - beam.fromX) * (180 / Math.PI);

        return (
          <span
            key={beam.id}
            className={`organizm-beam organizm-beam--${beam.source} organizm-beam--${beam.tone} organizm-beam--${beam.visual}`}
            style={{
              left: `${beam.fromX}%`,
              top: `${beam.fromY}%`,
              width: `${length}%`,
              transform: `rotate(${angle}deg)`,
            }}
            aria-hidden="true"
          />
        );
      })}

      {battle.effects.map((effect) => (
        <span
          key={effect.id}
          className={`organizm-effect organizm-effect--${effect.type}${
            effect.tone ? ` organizm-effect--${effect.tone}` : ""
          }${effect.visual ? ` organizm-effect--${effect.visual}` : ""}`}
          style={{ left: `${effect.x}%`, top: `${effect.y}%` }}
          aria-hidden="true"
        />
      ))}

      {battle.floaters.map((floater) => (
        <span
          key={floater.id}
          className={`organizm-floating-number organizm-floating-number--${floater.kind} organizm-floating-number--${floater.tone}`}
          style={{ left: `${floater.x}%`, top: `${floater.y}%` }}
          aria-hidden="true"
        >
          {floater.value}
        </span>
      ))}

      {battle.enemies.map((enemy) => (
        <EnemySprite key={enemy.id} enemy={enemy} now={now} />
      ))}

      <div className="organizm-battlefield__meta">
        <span>{mode === "battle" ? "Волна активна" : "Буфер установки"}</span>
        <strong>
          {battle.killedCount}/{battle.wave.enemyCount} очищено
        </strong>
      </div>
    </div>
  );
}

function OrganizmBoard({
  boardRef,
  boardPatches,
  selectedItem,
  drag,
  mode,
  battle,
  now,
  onPatchPointerDown,
  onPatchSelect,
  onCellClick,
}: {
  boardRef: RefObject<HTMLDivElement>;
  boardPatches: BoardPatches;
  selectedItem: SelectedItem | null;
  drag: DragState | null;
  mode: GameMode;
  battle: BattleState;
  now: number;
  onPatchPointerDown: (event: PointerEvent<HTMLElement>, item: PatchInstance, origin: PatchZone) => void;
  onPatchSelect: (origin: PatchZone, uid: string) => void;
  onCellClick: (position: BoardPosition) => void;
}) {
  const canRenderGhost =
    Boolean(drag?.candidate) &&
    drag &&
    getAbsolutePatchCells(drag.item, drag.candidate!).every(
      (cell) => cell.x >= 0 && cell.x < BOARD_COLS && cell.y >= 0 && cell.y < BOARD_ROWS,
    );

  return (
    <div className="organizm-board-shell">
      <div className="organizm-board-shell__top">
        <div>
          <span>Матрица адаптации</span>
          <strong>6 x 5 клеток</strong>
        </div>
        <small>{mode === "battle" ? "сборка зафиксирована" : "drag или tap по ячейке"}</small>
      </div>
      <div ref={boardRef} className="organizm-board" role="grid" aria-label="Матрица адаптации 6 на 5">
        {Array.from({ length: BOARD_ROWS }).flatMap((_, y) =>
          Array.from({ length: BOARD_COLS }).map((__, x) => (
            <div
              key={`${x}-${y}`}
              className="organizm-board__cell"
              style={{ gridColumn: `${x + 1} / span 1`, gridRow: `${y + 1} / span 1` }}
              role="gridcell"
              aria-label={`Клетка ${x + 1}, ${y + 1}`}
              onClick={() => onCellClick({ x, y })}
            />
          )),
        )}

        {getBoardEntries(boardPatches).map((item) => {
          const patch = getPatchConfig(item);
          const stats = getPatchStats(item);
          const bounds = getPatchBounds(item);
          const isDragging = drag?.item.uid === item.uid && drag.origin === "board";
          const isSelected = selectedItem?.origin === "board" && selectedItem.uid === item.uid;
          const isTriggered = (battle.patchFlashUntil[item.uid] ?? 0) > now;
          const isReady = Boolean(battle.patchReady[item.uid]);
          const isActive = patch.kind === "active";
          const cooldownProgress = mode === "battle" && isActive ? Math.round((battle.patchChargeProgress[item.uid] ?? 0) * 100) : 0;
          const patchStyle = {
            gridColumn: `${item.position.x + 1} / span ${bounds.width}`,
            gridRow: `${item.position.y + 1} / span ${bounds.height}`,
            "--organizm-cooldown-progress": `${cooldownProgress}%`,
          } as CSSProperties;

          return (
            <button
              key={item.uid}
              type="button"
              className={`organizm-board-patch organizm-board-patch--${patch.tone}${
                isDragging ? " organizm-board-patch--dragging" : ""
              }${isActive && mode === "battle" ? " organizm-board-patch--active" : ""}${
                stats.heal ? " organizm-board-patch--support" : ""
              }${isTriggered ? " organizm-board-patch--triggered" : ""}${
                isReady ? " organizm-board-patch--ready" : ""
              }${
                isSelected ? " organizm-board-patch--selected" : ""
              }`}
              style={patchStyle}
              data-organizm-patch-uid={item.uid}
              data-organizm-patch-zone="board"
              onClick={() => onPatchSelect("board", item.uid)}
              onPointerDown={(event) => onPatchPointerDown(event, item, "board")}
              disabled={mode !== "prep"}
              aria-label={`Патч ${patch.title} ${levelToRoman(item.level)}`}
            >
              <PatchModule item={item} variant="board" />
            </button>
          );
        })}

        {drag?.candidate && canRenderGhost ? (
          <div
            className={`organizm-placement-ghost${
              drag.valid ? " organizm-placement-ghost--valid" : " organizm-placement-ghost--invalid"
            }`}
            style={{
              gridColumn: `${drag.candidate.x + 1} / span ${getPatchBounds(drag.item).width}`,
              gridRow: `${drag.candidate.y + 1} / span ${getPatchBounds(drag.item).height}`,
            }}
            aria-hidden="true"
          >
            <PatchModule item={drag.item} variant="ghost" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PatchCard({
  item,
  zone,
  selectedItem,
  disabled,
  onSelect,
  onPointerDown,
}: {
  item: PatchInstance;
  zone: PatchZone;
  selectedItem: SelectedItem | null;
  disabled: boolean;
  onSelect: (origin: PatchZone, uid: string) => void;
  onPointerDown: (event: PointerEvent<HTMLElement>, item: PatchInstance, origin: PatchZone) => void;
}) {
  const patch = getPatchConfig(item);
  const stats = getPatchStats(item);
  const isSelected = selectedItem?.origin === zone && selectedItem.uid === item.uid;

  return (
    <button
      type="button"
      className={`organizm-patch-card organizm-patch-card--${patch.tone}${
        isSelected ? " organizm-patch-card--selected" : ""
      }`}
      data-organizm-patch-uid={item.uid}
      data-organizm-patch-zone={zone}
      onClick={() => onSelect(zone, item.uid)}
      onPointerDown={(event) => onPointerDown(event, item, zone)}
      disabled={disabled}
      aria-label={`${patch.title} ${levelToRoman(item.level)}`}
    >
      <span className="organizm-patch-card__visual">
        <PatchModule item={item} variant="card" />
      </span>
      <span className="organizm-patch-card__copy">
        <strong>
          {patch.title} {levelToRoman(item.level)}
        </strong>
        <small>
          {getPatchKindLabel(patch)} · {formatCooldown(stats.cooldownMs)}
        </small>
      </span>
      <i>{getPatchCategoryLabel(patch)}</i>
    </button>
  );
}

function PatchStash({
  stashRef,
  stashItems,
  selectedItem,
  mode,
  onSelect,
  onPatchPointerDown,
}: {
  stashRef: RefObject<HTMLDivElement>;
  stashItems: PatchInstance[];
  selectedItem: SelectedItem | null;
  mode: GameMode;
  onSelect: (origin: PatchZone, uid: string) => void;
  onPatchPointerDown: (event: PointerEvent<HTMLElement>, item: PatchInstance, origin: PatchZone) => void;
}) {
  return (
    <div ref={stashRef} className="organizm-palette organizm-stash">
      <div className="organizm-palette__top">
        <div>
          <span>Новые патчи</span>
          <strong>{stashItems.length} патчей</strong>
        </div>
        <small>drag / tap / слияние</small>
      </div>
      <div className="organizm-palette__list">
        {stashItems.length > 0 ? (
          stashItems.map((item) => (
            <PatchCard
              key={item.uid}
              item={item}
              zone="stash"
              selectedItem={selectedItem}
              disabled={mode !== "prep"}
              onSelect={onSelect}
              onPointerDown={onPatchPointerDown}
            />
          ))
        ) : (
          <div className="organizm-stash__empty">Новых патчей нет. Запусти следующую волну.</div>
        )}
      </div>
    </div>
  );
}

function PatchDetails({
  selected,
  boardMergeTarget,
  stashMergeTarget,
  mode,
  onMergeBoard,
  onMergeStash,
  onDelete,
}: {
  selected: { item: PatchInstance; origin: PatchZone } | null;
  boardMergeTarget: PatchInstance | null;
  stashMergeTarget: PatchInstance | null;
  mode: GameMode;
  onMergeBoard: () => void;
  onMergeStash: () => void;
  onDelete: () => void;
}) {
  if (!selected) {
    return (
      <div className="organizm-details">
        <div className="organizm-details__title">
          <span>выбор модуля</span>
          <strong>Нет выбранного патча</strong>
        </div>
        <p>Выбери новый или установленный патч, чтобы увидеть эффект, слияние и утилизацию.</p>
      </div>
    );
  }

  const { item, origin } = selected;
  const patch = getPatchConfig(item);
  const stats = getPatchStats(item);

  return (
    <div className={`organizm-details organizm-details--${patch.tone}`}>
      <div className="organizm-details__hero">
        <PatchModule item={item} variant="card" />
        <div className="organizm-details__title">
          <span>
            {getPatchCategoryLabel(patch)} · {origin === "board" ? "в матрице" : "новый патч"}
          </span>
          <strong>
            {patch.title} {levelToRoman(item.level)}
          </strong>
        </div>
      </div>
      <div className="organizm-details__grid">
        <span>Тип</span>
        <strong>{getPatchKindLabel(patch)}</strong>
        <span>Таймер</span>
        <strong>{formatCooldown(stats.cooldownMs)}</strong>
        <span>Форма</span>
        <strong>
          {getPatchBounds(item).width} x {getPatchBounds(item).height}
        </strong>
      </div>
      <p>{stats.effect}</p>
      <small>{patch.role}</small>
      <div className="organizm-details__actions">
        <button
          type="button"
          onClick={onMergeBoard}
          disabled={mode !== "prep" || !boardMergeTarget}
          aria-label="Слить выбранный патч с совместимым патчем в матрице"
        >
          <GitMerge className="organizm-button-icon" aria-hidden="true" />
          {origin === "board" ? "Слияние в матрице" : "Слияние с матрицей"}
        </button>
        <button
          type="button"
          onClick={onMergeStash}
          disabled={mode !== "prep" || !stashMergeTarget}
          aria-label="Слить выбранный патч с совместимым новым патчем"
        >
          <GitMerge className="organizm-button-icon" aria-hidden="true" />
          Слияние новых патчей
        </button>
        <button
          type="button"
          className="organizm-details__delete"
          onClick={onDelete}
          disabled={mode !== "prep"}
          aria-label="Утилизировать выбранный патч"
        >
          <Trash2 className="organizm-button-icon" aria-hidden="true" />
          Утилизировать
        </button>
      </div>
    </div>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="organizm-start">
      <div className="organizm-start__matrix" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="organizm-start__copy">
        <p className="organizm-start__eyebrow">Playable MVP · Iteration 3</p>
        <h3>Organizm</h3>
        <p>Пиксельный автобатлер про цифровой организм. Размещай патчи, объединяй уровни и очисти 5 волн сектора.</p>
      </div>
      <div className="organizm-start__actions">
        <button type="button" onClick={onStart} aria-label="Запустить защиту Organizm">
          <Play className="organizm-button-icon" aria-hidden="true" />
          Запустить защиту
        </button>
        <span>Размести стартовые патчи, подави волну, получи новые модули и усиливай сборку через слияние.</span>
      </div>
    </div>
  );
}

export function OrganizmGame() {
  const [mode, setMode] = useState<GameMode>("start");
  const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
  const [boardPatches, setBoardPatches] = useState<BoardPatches>({});
  const [stashItems, setStashItems] = useState<PatchInstance[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [health, setHealth] = useState(BASE_HEALTH);
  const [battle, setBattle] = useState<BattleState>(() => createBattleState(WAVE_CONFIGS[0]));
  const [feedback, setFeedback] = useState("Запусти прототип и собери защитный контур.");

  const rootRef = useRef<HTMLElement | null>(null);
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const stashRef = useRef<HTMLDivElement | null>(null);
  const deleteRef = useRef<HTMLDivElement | null>(null);
  const battleRef = useRef<BattleState>(battle);
  const boardRefState = useRef<BoardPatches>(boardPatches);
  const stashRefState = useRef<PatchInstance[]>(stashItems);
  const maxHealthRef = useRef(BASE_HEALTH);
  const previousMaxHealthRef = useRef(BASE_HEALTH);
  const healthRef = useRef(BASE_HEALTH);
  const cooldownsRef = useRef<Partial<Record<string, number>>>({});
  const dragRef = useRef<DragState | null>(drag);
  const lastFrameRef = useRef(0);
  const effectIdRef = useRef(1);
  const uidRef = useRef(1);

  const currentWave = WAVE_CONFIGS[currentWaveIndex];
  const passiveStats = useMemo(() => getPassiveStats(getBoardEntries(boardPatches)), [boardPatches]);
  const maxHealth = BASE_HEALTH + passiveStats.maxHealthBonus;
  const now = typeof performance === "undefined" ? 0 : performance.now();
  const boardCount = getBoardEntries(boardPatches).length;
  const canStartWave = mode === "prep";
  const resultMode = mode === "level-cleared" || mode === "defeat";
  const selectedResolved = resolveSelectedItem(selectedItem, boardPatches, stashItems);
  const boardMergeTarget = selectedResolved
    ? findCompatibleBoardPatch(selectedResolved.item, selectedResolved.origin, boardPatches)
    : null;
  const stashMergeTarget = selectedResolved
    ? findCompatibleStashPatch(selectedResolved.item, selectedResolved.origin, stashItems)
    : null;

  function createPatchInstance(patchId: PatchBaseId, level: PatchLevel = 1): PatchInstance {
    const uid = `${patchId}-${uidRef.current}`;
    uidRef.current += 1;

    return { uid, patchId, level };
  }

  function createStarterStash() {
    return STARTER_PATCHES.map((patchId) => createPatchInstance(patchId));
  }

  function createWaveRewards(completedWaveIndex: number) {
    const ids = REWARD_TABLE[completedWaveIndex] ?? [];
    const rewardCount = WAVE_CONFIGS[completedWaveIndex].rewardCount;
    const rewards = ids.slice(0, rewardCount).map((patchId) => createPatchInstance(patchId));

    while (rewards.length < rewardCount) {
      const fallback = PATCH_ORDER[(completedWaveIndex + rewards.length) % PATCH_ORDER.length];
      rewards.push(createPatchInstance(fallback));
    }

    return rewards;
  }

  useEffect(() => {
    boardRefState.current = boardPatches;
  }, [boardPatches]);

  useEffect(() => {
    stashRefState.current = stashItems;
  }, [stashItems]);

  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  useEffect(() => {
    maxHealthRef.current = maxHealth;

    if (mode === "start") {
      previousMaxHealthRef.current = maxHealth;
      return;
    }

    const previousMax = previousMaxHealthRef.current;

    if (maxHealth > previousMax) {
      const delta = maxHealth - previousMax;
      setHealthValue((current) => Math.min(maxHealth, current + delta));
    } else if (maxHealth < previousMax) {
      setHealthValue((current) => Math.min(current, maxHealth));
    }

    previousMaxHealthRef.current = maxHealth;
  }, [maxHealth, mode]);

  useEffect(() => {
    const selectedStillExists = selectedItem ? resolveSelectedItem(selectedItem, boardPatches, stashItems) : null;

    if (selectedStillExists || (!selectedItem && (stashItems.length > 0 || boardCount > 0))) {
      return;
    }

    const fallback = stashItems[0]
      ? { origin: "stash" as const, uid: stashItems[0].uid }
      : getBoardEntries(boardPatches)[0]
        ? { origin: "board" as const, uid: getBoardEntries(boardPatches)[0].uid }
        : null;

    setSelectedItem(fallback);
  }, [boardCount, boardPatches, selectedItem, stashItems]);

  useEffect(() => {
    if (mode !== "battle") {
      return;
    }

    if (health <= 0) {
      setMode("defeat");
      setFeedback("Ядро заражено: вирусы прорвали защиту.");
    }
  }, [health, mode]);

  useEffect(() => {
    if (mode !== "battle") {
      return;
    }

    const waveFinished = battle.spawnedCount >= battle.wave.enemyCount && battle.enemies.length === 0;

    if (!waveFinished) {
      return;
    }

    if (health <= 0) {
      setMode("defeat");
      setFeedback("Ядро заражено: вирусы прорвали защиту.");
      return;
    }

    if (currentWaveIndex >= WAVE_CONFIGS.length - 1) {
      setMode("level-cleared");
      setFeedback("Сектор очищен. Все 5 волн подавлены.");
      return;
    }

    const rewards = createWaveRewards(currentWaveIndex);
    const nextWaveIndex = currentWaveIndex + 1;

    setStashItems(rewards);
    setCurrentWaveIndex(nextWaveIndex);
    setMode("prep");
    setFeedback(`Подготовка к волне ${nextWaveIndex + 1}: заражение подавлено, новые патчи: ${rewards.length}.`);
  }, [battle.enemies.length, battle.spawnedCount, currentWave.waveNumber, currentWaveIndex, health, mode]);

  useEffect(() => {
    if (mode !== "battle") {
      return undefined;
    }

    let animationFrame = 0;

    const step = () => {
      runBattleStep(performance.now());
      animationFrame = requestAnimationFrame(step);
    };

    lastFrameRef.current = performance.now();
    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [mode]);

  function setHealthValue(next: number | ((current: number) => number)) {
    setHealth((current) => {
      const value = typeof next === "function" ? next(current) : next;
      const clamped = Math.max(0, Math.min(maxHealthRef.current, Math.round(value)));
      healthRef.current = clamped;
      return clamped;
    });
  }

  function runBattleStep(frameNow: number) {
    const result = advanceBattleStep({
      current: battleRef.current,
      frameNow,
      lastFrameAt: lastFrameRef.current,
      health: healthRef.current,
      maxHealth: maxHealthRef.current,
      passiveStats,
      cooldowns: cooldownsRef.current,
      idFactory: {
        next: () => {
          const id = effectIdRef.current;
          effectIdRef.current += 1;
          return id;
        },
      },
    });

    lastFrameRef.current = frameNow;
    cooldownsRef.current = result.cooldowns;
    healthRef.current = result.health;
    setHealth(result.health);
    battleRef.current = result.battle;
    setBattle(result.battle);
  }

  function resolveItem(origin: PatchZone, uid: string): PatchInstance | undefined {
    if (origin === "board") {
      return boardRefState.current[uid];
    }

    return stashRefState.current.find((item) => item.uid === uid);
  }

  function mergeItems(source: SelectedItem, target: SelectedItem) {
    const sourceItem = resolveItem(source.origin, source.uid);
    const targetItem = resolveItem(target.origin, target.uid);

    if (!canMergeItems(sourceItem, targetItem)) {
      setFeedback("Слияние невозможно: нужны одинаковые патчи одного уровня ниже III.");
      return;
    }

    const upgradedTarget = levelUp(targetItem!);

    setBoardPatches((current) => {
      const next = { ...current };

      if (source.origin === "board") {
        delete next[source.uid];
      }

      if (target.origin === "board") {
        const targetPatch = next[target.uid] ?? current[target.uid];
        next[target.uid] = { ...targetPatch, level: upgradedTarget.level };
      }

      return next;
    });
    setStashItems((current) => {
      let next = current;

      if (source.origin === "stash") {
        next = next.filter((item) => item.uid !== source.uid);
      }

      if (target.origin === "stash") {
        next = next.map((item) => (item.uid === target.uid ? { ...item, level: upgradedTarget.level } : item));
      }

      return next;
    });
    setSelectedItem(target);
    setFeedback(`${getPatchConfig(targetItem!).title}: слияние до уровня ${levelToRoman(upgradedTarget.level)}.`);
  }

  function placeItemOnBoard(item: PatchInstance, origin: PatchZone, position: BoardPosition) {
    const validation = getPlacementValidation(item, position, boardRefState.current, origin === "board" ? item.uid : undefined);

    if (!validation.valid) {
      const mergeTarget = getOverlappingBoardPatch(item, position, boardRefState.current, origin === "board" ? item.uid : undefined);

      if (mergeTarget && canMergeItems(item, mergeTarget)) {
        mergeItems({ origin, uid: item.uid }, { origin: "board", uid: mergeTarget.uid });
        return;
      }

      setFeedback(validation.reason);
      return;
    }

    if (origin === "stash") {
      setStashItems((current) => current.filter((patch) => patch.uid !== item.uid));
      setBoardPatches((current) => ({
        ...current,
        [item.uid]: { ...item, position },
      }));
      setSelectedItem({ origin: "board", uid: item.uid });
    } else {
      setBoardPatches((current) => ({
        ...current,
        [item.uid]: { ...(current[item.uid] ?? item), position },
      }));
      setSelectedItem({ origin: "board", uid: item.uid });
    }

    setFeedback(`${getPatchConfig(item).title} ${levelToRoman(item.level)} установлен в матрицу.`);
  }

  function deleteItem(target: SelectedItem) {
    const item = resolveItem(target.origin, target.uid);

    if (!item) {
      return;
    }

    if (target.origin === "board") {
      setBoardPatches((current) => {
        const next = { ...current };
        delete next[target.uid];
        return next;
      });
    } else {
      setStashItems((current) => current.filter((patch) => patch.uid !== target.uid));
    }

    setSelectedItem(null);
    setFeedback(`${getPatchConfig(item).title} утилизирован.`);
  }

  function resetPrototype(nextMode: GameMode = "prep") {
    uidRef.current = 1;
    const starterStash = createStarterStash();
    const nextBattle = createBattleState(WAVE_CONFIGS[0]);

    setCurrentWaveIndex(0);
    setBoardPatches({});
    setStashItems(starterStash);
    setSelectedItem(starterStash[0] ? { origin: "stash", uid: starterStash[0].uid } : null);
    dragRef.current = null;
    setDrag(null);
    previousMaxHealthRef.current = BASE_HEALTH;
    maxHealthRef.current = BASE_HEALTH;
    healthRef.current = BASE_HEALTH;
    setHealth(BASE_HEALTH);
    battleRef.current = nextBattle;
    setBattle(nextBattle);
    setFeedback("Подготовка к волне 1: установи патчи в матрицу адаптации.");
    cooldownsRef.current = {};
    setMode(nextMode);
  }

  function handleStartPrototype() {
    resetPrototype("prep");
  }

  function handleStartWave() {
    if (!canStartWave) {
      return;
    }

    const frameNow = performance.now();
    const loadout = getBoardEntries(boardPatches);
    const nextCooldowns: Partial<Record<string, number>> = {};

    loadout.forEach((item) => {
      const patch = getPatchConfig(item);
      const stats = getPatchStats(item);

      if (patch.kind === "active" && stats.cooldownMs) {
        nextCooldowns[item.uid] = frameNow - stats.cooldownMs * 0.72;
      }
    });

    cooldownsRef.current = nextCooldowns;
    const nextBattle = createBattleState(currentWave, loadout, frameNow);
    battleRef.current = nextBattle;
    setBattle(nextBattle);
    dragRef.current = null;
    setDrag(null);
    setStashItems([]);
    if (selectedItem?.origin === "stash") {
      setSelectedItem(null);
    }
    setHealthValue((current) => Math.min(current, maxHealth));
    setFeedback(`Волна ${currentWave.waveNumber}: ${currentWave.title}. Новые патчи очищены из буфера.`);
    setMode("battle");
    window.requestAnimationFrame(() => {
      layoutRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function handlePatchSelect(origin: PatchZone, uid: string) {
    const targetItem = resolveItem(origin, uid);

    if (
      mode === "prep" &&
      selectedItem &&
      selectedResolved &&
      targetItem &&
      selectedResolved.item.uid !== targetItem.uid &&
      canMergeItems(selectedResolved.item, targetItem)
    ) {
      mergeItems({ origin: selectedResolved.origin, uid: selectedResolved.item.uid }, { origin, uid });
      return;
    }

    setSelectedItem({ origin, uid });
  }

  function beginPatchDrag(event: PointerEvent<HTMLElement>, item: PatchInstance, origin: PatchZone) {
    if (mode !== "prep") {
      setFeedback("Во время боя патчи заблокированы.");
      return;
    }

    event.stopPropagation();

    const existingPlacement = origin === "board" ? boardPatches[item.uid]?.position : undefined;
    const rawBoardCell = origin === "board" ? getBoardCellFromPointer(event, boardRef.current) : null;
    const anchor =
      existingPlacement && rawBoardCell
        ? {
            x: clamp(rawBoardCell.x - existingPlacement.x, 0, getPatchBounds(item).width - 1),
            y: clamp(rawBoardCell.y - existingPlacement.y, 0, getPatchBounds(item).height - 1),
          }
        : { x: 0, y: 0 };
    const candidate = getCandidateFromPointer(event, boardRef.current, anchor);
    const validation = getPlacementValidation(item, candidate, boardPatches, origin === "board" ? item.uid : undefined);

    try {
      rootRef.current?.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture improves touch dragging, but browsers can decline it.
    }

    const nextDrag = {
      item,
      pointerId: event.pointerId,
      origin,
      anchor,
      startX: event.clientX,
      startY: event.clientY,
      screenX: event.clientX,
      screenY: event.clientY,
      candidate,
      valid: validation.valid,
      reason: validation.reason,
      hasMoved: false,
    };

    dragRef.current = nextDrag;
    setDrag(nextDrag);
    setFeedback(validation.reason);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const activeDrag = dragRef.current;

    if (!activeDrag || activeDrag.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();

    const candidate = getCandidateFromPointer(event, boardRef.current, activeDrag.anchor);
    const validation = getPlacementValidation(
      activeDrag.item,
      candidate,
      boardPatches,
      activeDrag.origin === "board" ? activeDrag.item.uid : undefined,
    );

    const hasMoved =
      activeDrag.hasMoved || Math.hypot(event.clientX - activeDrag.startX, event.clientY - activeDrag.startY) > 6;
    const nextDrag = {
      ...activeDrag,
      screenX: event.clientX,
      screenY: event.clientY,
      candidate,
      valid: validation.valid,
      reason: validation.reason,
      hasMoved,
    };

    dragRef.current = nextDrag;
    setDrag(nextDrag);
    setFeedback(validation.reason);
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    const activeDrag = dragRef.current;

    if (!activeDrag || activeDrag.pointerId !== event.pointerId) {
      return;
    }

    try {
      rootRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      // The browser may already have released the pointer.
    }

    const pointedPatch =
      getPatchAtElementPoint(event.clientX, event.clientY) ??
      (!activeDrag.hasMoved ? { uid: activeDrag.item.uid, zone: activeDrag.origin } : null);

    if (!activeDrag.hasMoved && pointedPatch?.uid === activeDrag.item.uid && pointedPatch.zone === activeDrag.origin) {
      if (
        mode === "prep" &&
        selectedItem &&
        selectedResolved &&
        selectedResolved.item.uid !== activeDrag.item.uid &&
        canMergeItems(selectedResolved.item, activeDrag.item)
      ) {
        const clicked = { origin: activeDrag.origin, uid: activeDrag.item.uid };
        const selected = { origin: selectedResolved.origin, uid: selectedResolved.item.uid };
        const source = clicked.origin === "stash" && selected.origin === "board" ? clicked : selected;
        const target = clicked.origin === "stash" && selected.origin === "board" ? selected : clicked;

        mergeItems(source, target);
      } else {
        setSelectedItem({ origin: activeDrag.origin, uid: activeDrag.item.uid });
        setFeedback(`${getPatchConfig(activeDrag.item).title} ${levelToRoman(activeDrag.item.level)} выбран.`);
      }

      dragRef.current = null;
      setDrag(null);
      return;
    }

    if (
      pointedPatch &&
      pointedPatch.uid !== activeDrag.item.uid &&
      canMergeItems(activeDrag.item, resolveItem(pointedPatch.zone, pointedPatch.uid))
    ) {
      mergeItems({ origin: activeDrag.origin, uid: activeDrag.item.uid }, { origin: pointedPatch.zone, uid: pointedPatch.uid });
      dragRef.current = null;
      setDrag(null);
      return;
    }

    if (isPointerInsideElement(event, deleteRef.current)) {
      deleteItem({ origin: activeDrag.origin, uid: activeDrag.item.uid });
      dragRef.current = null;
      setDrag(null);
      return;
    }

    if (activeDrag.origin === "board" && isPointerInsideElement(event, stashRef.current)) {
      const boardItem = boardRefState.current[activeDrag.item.uid];

      if (boardItem) {
        setBoardPatches((current) => {
          const next = { ...current };
          delete next[activeDrag.item.uid];
          return next;
        });
        setStashItems((current) => [...current, { uid: boardItem.uid, patchId: boardItem.patchId, level: boardItem.level }]);
        setSelectedItem({ origin: "stash", uid: boardItem.uid });
        setFeedback(`${getPatchConfig(boardItem).title} снят в запас.`);
        dragRef.current = null;
        setDrag(null);
        return;
      }
    }

    if (activeDrag.valid && activeDrag.candidate) {
      placeItemOnBoard(activeDrag.item, activeDrag.origin, activeDrag.candidate);
      dragRef.current = null;
      setDrag(null);
      return;
    }

    const mergeTarget = getOverlappingBoardPatch(
      activeDrag.item,
      activeDrag.candidate,
      boardPatches,
      activeDrag.origin === "board" ? activeDrag.item.uid : undefined,
    );

    if (mergeTarget && canMergeItems(activeDrag.item, mergeTarget)) {
      mergeItems({ origin: activeDrag.origin, uid: activeDrag.item.uid }, { origin: "board", uid: mergeTarget.uid });
    } else {
      setFeedback(activeDrag.reason);
    }

    dragRef.current = null;
    setDrag(null);
  }

  function handlePointerCancel(event: PointerEvent<HTMLElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      setDrag(null);
      setFeedback("Размещение отменено.");
    }
  }

  function handleBoardCellClick(position: BoardPosition) {
    if (mode !== "prep" || !selectedResolved) {
      return;
    }

    placeItemOnBoard(selectedResolved.item, selectedResolved.origin, position);
  }

  function handleMergeBoard() {
    if (!selectedResolved || !boardMergeTarget) {
      setFeedback("Нет совместимого патча в матрице для слияния.");
      return;
    }

    mergeItems({ origin: selectedResolved.origin, uid: selectedResolved.item.uid }, { origin: "board", uid: boardMergeTarget.uid });
  }

  function handleMergeStash() {
    if (!selectedResolved || !stashMergeTarget) {
      setFeedback("Нет совместимого нового патча для слияния.");
      return;
    }

    mergeItems({ origin: selectedResolved.origin, uid: selectedResolved.item.uid }, { origin: "stash", uid: stashMergeTarget.uid });
  }

  function handleDeleteSelected() {
    if (!selectedResolved) {
      return;
    }

    deleteItem({ origin: selectedResolved.origin, uid: selectedResolved.item.uid });
  }

  const resultTitle = mode === "level-cleared" ? "Сектор очищен" : "Ядро заражено";
  const resultText =
    mode === "level-cleared"
      ? `Оставшееся здоровье: ${health}/${maxHealth}. Текущая сборка: ${boardCount} патчей.`
      : `Достигнута волна ${currentWave.waveNumber}. Вирусы прорвали защиту ядра.`;

  return (
    <section
      ref={rootRef}
      className={`organizm-game organizm-game--${mode}`}
      aria-label="Игровой прототип Organizm"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handlePointerCancel}
    >
      {mode === "start" ? (
        <StartScreen onStart={handleStartPrototype} />
      ) : (
        <>
          <div className="organizm-game__header">
            <div>
              <p className="organizm-game__eyebrow">Pixel autobattler</p>
              <h3>Organizm</h3>
              <p>{LEVEL_TITLE}. Размещай патчи, объединяй уровни и переживи растущую вирусную волну.</p>
            </div>
            <button
              type="button"
              className="organizm-game__restart"
              onClick={() => resetPrototype("prep")}
              disabled={mode === "battle"}
              aria-label="Рестарт прототипа Organizm"
            >
              <RotateCcw className="organizm-button-icon" aria-hidden="true" />
              Рестарт
            </button>
          </div>

          <GameHUD health={health} maxHealth={maxHealth} waveNumber={currentWave.waveNumber} />

          <div ref={layoutRef} className={`organizm-game__layout organizm-game__layout--${mode}`}>
            <div className="organizm-battle-shell">
              <div className="organizm-section-title">
                <Crosshair aria-hidden="true" />
                <span>Сектор заражения</span>
                <strong>
                  {battle.spawnedCount}/{currentWave.enemyCount} вирусов
                </strong>
              </div>
              <Battlefield battle={battle} health={health} maxHealth={maxHealth} mode={mode} now={now} />
            </div>

            <aside className="organizm-command-panel">
              <div className="organizm-command-panel__status" role="status" aria-live="polite">
                <Sparkles aria-hidden="true" />
                <span>{feedback}</span>
              </div>
              <button
                type="button"
                className="organizm-command-panel__start"
                onClick={handleStartWave}
                disabled={!canStartWave}
                aria-label={`Запустить волну ${currentWave.waveNumber}`}
              >
                <Zap className="organizm-button-icon" aria-hidden="true" />
                Запустить волну {currentWave.waveNumber}
              </button>
              <div className="organizm-command-panel__mini">
                <span>Установлено в матрице</span>
                <strong>{boardCount}</strong>
              </div>
              <div className="organizm-command-panel__mini">
                <span>Новые патчи</span>
                <strong>{stashItems.length}</strong>
              </div>
              <div className="organizm-command-panel__mini">
                <span>Текущая волна</span>
                <strong>{currentWave.title}</strong>
              </div>
              <div className="organizm-command-panel__mini">
                <span>Очищено</span>
                <strong>{battle.killedCount}</strong>
              </div>
              <div className="organizm-command-panel__mini">
                <span>Прорывы защиты</span>
                <strong>{battle.breachedCount}</strong>
              </div>
              <div ref={deleteRef} className="organizm-delete-zone" aria-label="Зона удаления патчей">
                <Trash2 className="organizm-button-icon" aria-hidden="true" />
                <span>Перетащи сюда или нажми “Утилизировать”</span>
              </div>
              <PatchDetails
                selected={selectedResolved}
                boardMergeTarget={boardMergeTarget}
                stashMergeTarget={stashMergeTarget}
                mode={mode}
                onMergeBoard={handleMergeBoard}
                onMergeStash={handleMergeStash}
                onDelete={handleDeleteSelected}
              />
            </aside>

            <div className="organizm-workbench">
              <OrganizmBoard
                boardRef={boardRef}
                boardPatches={boardPatches}
                selectedItem={selectedItem}
                drag={drag}
                mode={mode}
                battle={battle}
                now={now}
                onPatchPointerDown={beginPatchDrag}
                onPatchSelect={handlePatchSelect}
                onCellClick={handleBoardCellClick}
              />
              {mode === "prep" ? (
                <PatchStash
                  stashRef={stashRef}
                  stashItems={stashItems}
                  selectedItem={selectedItem}
                  mode={mode}
                  onSelect={handlePatchSelect}
                  onPatchPointerDown={beginPatchDrag}
                />
              ) : null}
            </div>
          </div>

          {mode === "prep" ? (
            <div className="organizm-mobile-action" aria-label="Быстрый запуск волны">
              <span>{feedback}</span>
              <button type="button" onClick={handleStartWave} disabled={!canStartWave} aria-label={`Запустить волну ${currentWave.waveNumber}`}>
                <Zap className="organizm-button-icon" aria-hidden="true" />
                Запустить волну {currentWave.waveNumber}
              </button>
            </div>
          ) : null}

          {resultMode ? (
            <div className={`organizm-result organizm-result--${mode}`} role="status" aria-live="assertive">
              <div className="organizm-result__panel">
                {mode === "level-cleared" ? (
                  <Shield className="organizm-result__icon" aria-hidden="true" />
                ) : (
                  <Activity className="organizm-result__icon" aria-hidden="true" />
                )}
                <strong>{resultTitle}</strong>
                <span>{resultText}</span>
                <button type="button" onClick={() => resetPrototype("prep")}>
                  <RotateCcw className="organizm-button-icon" aria-hidden="true" />
                  Попробовать снова
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {drag ? (
        <div
          className={`organizm-drag-ghost organizm-drag-ghost--${getPatchConfig(drag.item).tone}`}
          style={{ left: drag.screenX, top: drag.screenY }}
          aria-hidden="true"
        >
          <PatchModule item={drag.item} variant="ghost" />
        </div>
      ) : null}
    </section>
  );
}

function resolveSelectedItem(
  selectedItem: SelectedItem | null,
  boardPatches: BoardPatches,
  stashItems: PatchInstance[],
): { item: PatchInstance; origin: PatchZone } | null {
  if (!selectedItem) {
    return null;
  }

  if (selectedItem.origin === "board") {
    const item = boardPatches[selectedItem.uid];
    return item ? { item, origin: "board" } : null;
  }

  const item = stashItems.find((patch) => patch.uid === selectedItem.uid);
  return item ? { item, origin: "stash" } : null;
}

function findCompatibleBoardPatch(item: PatchInstance, origin: PatchZone, boardPatches: BoardPatches) {
  return getBoardEntries(boardPatches).find((candidate) => canMergeItems(item, candidate) && !(origin === "board" && candidate.uid === item.uid)) ?? null;
}

function findCompatibleStashPatch(item: PatchInstance, origin: PatchZone, stashItems: PatchInstance[]) {
  return stashItems.find((candidate) => canMergeItems(item, candidate) && !(origin === "stash" && candidate.uid === item.uid)) ?? null;
}
