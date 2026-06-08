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
  X,
  Zap,
} from "lucide-react";
import { type CSSProperties, type PointerEvent, type RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  BASE_HEALTH,
  BOSS_END_DELAY_MS,
  BOARD_COLS,
  BOARD_ROWS,
  BOARD_START_COLS,
  BOARD_START_ROWS,
  DEFEAT_DELAY_MS,
  EXPANSION_CELLS,
  LEVEL_END_DELAY_MS,
  WAVE_END_DELAY_MS,
  getScaledWaveConfig,
  getSectorTitle,
  getShortSectorTitle,
  WAVE_CONFIGS,
} from "./organizm/balance";
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
  isCellAvailable,
} from "./organizm/logic/placement";
import {
  canMergeItems,
  formatCooldown,
  getPassiveStats,
  getPatchBounds,
  getPatchCategoryLabel,
  getPatchConfig,
  getPatchKindLabel,
  getPatchStats,
  getStarterPatchIdsForSector,
  getWaveRewardPatchIds,
  levelToRoman,
  levelUp,
} from "./organizm/patchCatalog";
import {
  describeMutationLevel,
  getMutationConfig,
  getMutationCost,
  getMutationStats,
  MUTATION_ORDER,
  type MutationCounts,
  type MutationId,
} from "./organizm/mutationCatalog";
import type {
  BattleState,
  BattleBeam,
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
  WaveConfig,
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

function getUnlockedCellSet(unlockedCount: number) {
  return new Set(EXPANSION_CELLS.slice(0, unlockedCount).map(cellKey));
}

function getMatrixLabel(unlockedCells: Set<string>) {
  const unlockedCount = Math.min(unlockedCells.size, EXPANSION_CELLS.length);

  if (unlockedCount >= 15) {
    return "6 x 4";
  }

  if (unlockedCount >= 9) {
    return "6 x 3";
  }

  if (unlockedCount >= 6) {
    return "5 x 3";
  }

  if (unlockedCount >= 3) {
    return "4 x 3";
  }

  return `${BOARD_START_COLS} x ${BOARD_START_ROWS}`;
}

function hasBossInWave(wave: WaveConfig) {
  return wave.groups.some((group) => group.typeId === "glitch-capsule");
}

type BattleEndingState = "wave" | "level" | "defeat" | "boss" | null;
type BattlefieldSize = { width: number; height: number };
type BattlefieldPoint = { x: number; y: number };

function toBattlefieldPixels(point: CellCoord, size: BattlefieldSize): BattlefieldPoint {
  return {
    x: (point.x / 100) * size.width,
    y: (point.y / 100) * size.height,
  };
}

function getPerpendicularOffset(from: BattlefieldPoint, to: BattlefieldPoint, amount: number): BattlefieldPoint {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(0.001, Math.hypot(dx, dy));

  return {
    x: (-dy / length) * amount,
    y: (dx / length) * amount,
  };
}

function getBeamTargetPoint(beam: BattleBeam, battle: BattleState) {
  const liveTarget = beam.source === "patch" && beam.targetId ? battle.enemies.find((enemy) => enemy.id === beam.targetId) : null;

  return liveTarget ? { x: liveTarget.x, y: liveTarget.y } : { x: beam.toX, y: beam.toY };
}

function GameHUD({
  health,
  maxHealth,
  waveNumber,
  sectorIndex,
  mutagens,
}: {
  health: number;
  maxHealth: number;
  waveNumber: number;
  sectorIndex: number;
  mutagens: number;
}) {
  const healthPercent = maxHealth > 0 ? Math.max(0, Math.min(100, (health / maxHealth) * 100)) : 0;
  const style = { "--organizm-health": `${healthPercent}%` } as CSSProperties;

  return (
    <div className="organizm-hud" aria-label="Состояние Organizm">
      <div className="organizm-hud__brand">
        <Activity className="organizm-hud__brand-icon" aria-hidden="true" />
        <div>
          <span>Organizm</span>
          <strong>{getShortSectorTitle(sectorIndex)}</strong>
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
        <strong>{mutagens}</strong>
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
  sectorTitle,
  endingState,
}: {
  battle: BattleState;
  health: number;
  maxHealth: number;
  mode: GameMode;
  now: number;
  sectorTitle: string;
  endingState: BattleEndingState;
}) {
  const battlefieldRef = useRef<HTMLDivElement | null>(null);
  const [battlefieldSize, setBattlefieldSize] = useState<BattlefieldSize>({ width: 0, height: 0 });
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
  const beamViewportWidth = Math.max(1, battlefieldSize.width);
  const beamViewportHeight = Math.max(1, battlefieldSize.height);

  useEffect(() => {
    const element = battlefieldRef.current;

    if (!element) {
      return undefined;
    }

    const syncBattlefieldSize = () => {
      const rect = element.getBoundingClientRect();
      setBattlefieldSize((current) => {
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));

        return current.width === width && current.height === height ? current : { width, height };
      });
    };

    syncBattlefieldSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", syncBattlefieldSize);
      return () => window.removeEventListener("resize", syncBattlefieldSize);
    }

    const observer = new ResizeObserver(syncBattlefieldSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={battlefieldRef} className="organizm-battlefield" aria-label={sectorTitle}>
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

      {battle.beams.length > 0 ? (
        <svg
          className="organizm-beam-svg"
          viewBox={`0 0 ${beamViewportWidth} ${beamViewportHeight}`}
          aria-hidden="true"
        >
          {battle.beams.map((beam) => {
            const fromPoint = toBattlefieldPixels({ x: beam.fromX, y: beam.fromY }, battlefieldSize);
            const targetPoint = toBattlefieldPixels(getBeamTargetPoint(beam, battle), battlefieldSize);
            const doubleOffset = getPerpendicularOffset(fromPoint, targetPoint, 5);

            return (
              <g
                key={beam.id}
                className={`organizm-beam-vector organizm-beam--${beam.source} organizm-beam--${beam.tone} organizm-beam--${beam.visual}`}
              >
                <line className="organizm-beam-line" x1={fromPoint.x} y1={fromPoint.y} x2={targetPoint.x} y2={targetPoint.y} />
                {beam.visual === "double" ? (
                  <line
                    className="organizm-beam-line organizm-beam-line--offset"
                    x1={fromPoint.x + doubleOffset.x}
                    y1={fromPoint.y + doubleOffset.y}
                    x2={targetPoint.x + doubleOffset.x}
                    y2={targetPoint.y + doubleOffset.y}
                  />
                ) : null}
                <circle className="organizm-beam-impact" cx={targetPoint.x} cy={targetPoint.y} r={beam.source === "enemy" ? 4 : 5} />
              </g>
            );
          })}
        </svg>
      ) : null}

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
        <span>
          {endingState === "boss"
            ? "Коллапс босса"
            : endingState === "wave"
              ? "Волна подавлена"
              : endingState === "level"
                ? "Сектор стабилизируется"
                : endingState === "defeat"
                  ? "Ядро разрушено"
                  : mode === "battle"
                    ? "Волна активна"
                    : "Буфер установки"}
        </span>
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
  unlockedCells,
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
  unlockedCells: Set<string>;
  onPatchPointerDown: (event: PointerEvent<HTMLElement>, item: PatchInstance, origin: PatchZone) => void;
  onPatchSelect: (origin: PatchZone, uid: string) => void;
  onCellClick: (position: BoardPosition) => void;
}) {
  const matrixLabel = getMatrixLabel(unlockedCells);
  const activeCellCount = BOARD_START_COLS * BOARD_START_ROWS + unlockedCells.size;
  const canRenderGhost =
    Boolean(drag?.candidate) &&
    drag &&
    getAbsolutePatchCells(drag.item, drag.candidate!).every(
      (cell) => cell.x >= 0 && cell.x < BOARD_COLS && cell.y >= 0 && cell.y < BOARD_ROWS && isCellAvailable(cell, unlockedCells),
    );

  return (
    <div className="organizm-board-shell">
      <div className="organizm-board-shell__top">
        <div>
          <span>Матрица адаптации</span>
          <strong>{matrixLabel} клеток</strong>
        </div>
        <small>{mode === "battle" ? "сборка зафиксирована" : `${activeCellCount} активных · drag/tap`}</small>
      </div>
      <div
        ref={boardRef}
        className="organizm-board"
        role="grid"
        aria-label={`Матрица адаптации ${matrixLabel.replace(" x ", " на ")} с клетками роста ткани`}
      >
        {Array.from({ length: BOARD_ROWS }).flatMap((_, y) =>
          Array.from({ length: BOARD_COLS }).map((__, x) => {
            const available = isCellAvailable({ x, y }, unlockedCells);

            return (
              <div
                key={`${x}-${y}`}
                className={`organizm-board__cell${available ? "" : " organizm-board__cell--locked"}`}
                style={{ gridColumn: `${x + 1} / span 1`, gridRow: `${y + 1} / span 1` }}
                role="gridcell"
                aria-disabled={!available}
                aria-label={`${available ? "Клетка" : "Закрытая клетка роста ткани"} ${x + 1}, ${y + 1}`}
                title={available ? undefined : "Откроется через мутацию Рост ткани"}
                onClick={available ? () => onCellClick({ x, y }) : undefined}
              />
            );
          }),
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
  mergeCandidateUid,
  disabled,
  onSelect,
  onPointerDown,
}: {
  item: PatchInstance;
  zone: PatchZone;
  selectedItem: SelectedItem | null;
  mergeCandidateUid?: string | null;
  disabled: boolean;
  onSelect: (origin: PatchZone, uid: string) => void;
  onPointerDown: (event: PointerEvent<HTMLElement>, item: PatchInstance, origin: PatchZone) => void;
}) {
  const patch = getPatchConfig(item);
  const stats = getPatchStats(item);
  const isSelected = selectedItem?.origin === zone && selectedItem.uid === item.uid;
  const isMergeCandidate = mergeCandidateUid === item.uid;

  return (
    <button
      type="button"
      className={`organizm-patch-card organizm-patch-card--${patch.tone}${
        isSelected ? " organizm-patch-card--selected" : ""
      }${
        isMergeCandidate ? " organizm-patch-card--merge-target" : ""
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
  mergeCandidateUid,
  mode,
  onSelect,
  onPatchPointerDown,
}: {
  stashRef: RefObject<HTMLDivElement>;
  stashItems: PatchInstance[];
  selectedItem: SelectedItem | null;
  mergeCandidateUid?: string | null;
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
              mergeCandidateUid={mergeCandidateUid}
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

function PatchTooltip({
  selected,
  boardMergeTarget,
  stashMergeTarget,
  mode,
  onInstall,
  onMergeBoard,
  onMergeStash,
  onMoveToStash,
  onDelete,
  onClose,
}: {
  selected: { item: PatchInstance; origin: PatchZone } | null;
  boardMergeTarget: PatchInstance | null;
  stashMergeTarget: PatchInstance | null;
  mode: GameMode;
  onInstall: () => void;
  onMergeBoard: () => void;
  onMergeStash: () => void;
  onMoveToStash: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  if (!selected) {
    return null;
  }

  const { item, origin } = selected;
  const patch = getPatchConfig(item);
  const stats = getPatchStats(item);

  return (
    <div className="organizm-patch-tooltip-backdrop" onPointerDown={onClose} role="presentation">
      <div className={`organizm-patch-tooltip organizm-patch-tooltip--${patch.tone}`} onPointerDown={(event) => event.stopPropagation()}>
        <div className="organizm-patch-tooltip__top">
          <PatchModule item={item} variant="card" />
          <div>
            <span>
              {levelToRoman(item.level)} · {getPatchKindLabel(patch)} · {origin === "board" ? "в матрице" : "новый"}
            </span>
            <strong>{patch.title}</strong>
          </div>
          <button type="button" className="organizm-patch-tooltip__close" onClick={onClose} aria-label="Закрыть описание патча">
            <X className="organizm-button-icon" aria-hidden="true" />
          </button>
        </div>
        <div className="organizm-patch-tooltip__grid">
          <span>Тип</span>
          <strong>{getPatchCategoryLabel(patch)}</strong>
          <span>Таймер</span>
          <strong>{formatCooldown(stats.cooldownMs)}</strong>
        </div>
        <p>{stats.effect}</p>
        <div className="organizm-patch-tooltip__actions">
          {origin === "stash" ? (
            <button type="button" onClick={onInstall} disabled={mode !== "prep"}>
              <Layers className="organizm-button-icon" aria-hidden="true" />
              Установить
            </button>
          ) : (
            <button type="button" onClick={onMoveToStash} disabled={mode !== "prep"}>
              <Layers className="organizm-button-icon" aria-hidden="true" />
              Снять
            </button>
          )}
          <button type="button" onClick={onMergeStash} disabled={mode !== "prep" || !stashMergeTarget}>
            <GitMerge className="organizm-button-icon" aria-hidden="true" />
            Слияние
          </button>
          <button type="button" onClick={onMergeBoard} disabled={mode !== "prep" || !boardMergeTarget}>
            <GitMerge className="organizm-button-icon" aria-hidden="true" />
            С матрицей
          </button>
          <button type="button" className="organizm-details__delete" onClick={onDelete} disabled={mode !== "prep"}>
            <Trash2 className="organizm-button-icon" aria-hidden="true" />
            Утилизировать
          </button>
        </div>
      </div>
    </div>
  );
}

function getPurchasedMutationCount(counts: MutationCounts) {
  return MUTATION_ORDER.reduce((total, id) => total + (counts[id] ?? 0), 0);
}

function MutationScreen({
  sectorIndex,
  mutagens,
  mutationCost,
  mutationCounts,
  lastMutationId,
  mutationFeedback,
  onBuyMutation,
  onNextSector,
  onNewSession,
}: {
  sectorIndex: number;
  mutagens: number;
  mutationCost: number;
  mutationCounts: MutationCounts;
  lastMutationId: MutationId | null;
  mutationFeedback: string;
  onBuyMutation: () => void;
  onNextSector: () => void;
  onNewSession: () => void;
}) {
  const lastMutation = lastMutationId ? getMutationConfig(lastMutationId) : null;
  const canBuyMutation = mutagens >= mutationCost;
  const purchasedCount = getPurchasedMutationCount(mutationCounts);

  return (
    <div className="organizm-mutations" aria-label="Экран эволюции Organizm">
      <div className="organizm-mutations__header">
        <div>
          <span>Сессия · {getShortSectorTitle(sectorIndex)}</span>
          <h3>Экран эволюции</h3>
          <p>Мутационная колода усиливает следующий сектор. Повтор карточки повышает её уровень.</p>
        </div>
        <div className="organizm-mutations__stats" aria-label="Баланс мутаций">
          <div>
            <span>Мутагены</span>
            <strong>{mutagens}</strong>
          </div>
          <div>
            <span>Следующая</span>
            <strong>{mutationCost}</strong>
          </div>
          <div>
            <span>Сектор</span>
            <strong>{String(sectorIndex).padStart(2, "0")}</strong>
          </div>
        </div>
      </div>

      <div className="organizm-mutations__notice" role="status" aria-live="polite">
        <span className="organizm-mutagen-icon" aria-hidden="true" />
        <strong>{lastMutation ? lastMutation.title : "Мутационная колода"}</strong>
        <span>{lastMutation ? mutationFeedback : "Открой первую карточку мутации после сектора."}</span>
      </div>

      <div className="organizm-mutations__deck" aria-label="Мутационная колода">
        {MUTATION_ORDER.map((id) => {
          const mutation = getMutationConfig(id);
          const count = mutationCounts[id] ?? 0;
          const isOpen = count > 0;
          const isLast = lastMutationId === id;
          const currentBonus = count === 0 ? "Слот закрыт" : count === 1 ? mutation.firstBonus : `${mutation.firstBonus} · x${count}`;

          return (
            <div
              key={id}
              className={`organizm-mutation-card${isOpen ? ` organizm-mutation-card--${mutation.tone}` : " organizm-mutation-card--locked"}${
                isLast ? " organizm-mutation-card--revealed" : ""
              }`}
            >
              <span className={`organizm-mutation-card__icon organizm-mutation-card__icon--${isOpen ? mutation.icon : "locked"}`}>
                {isOpen ? mutation.shortTitle : "?"}
              </span>
              <div className="organizm-mutation-card__copy">
                <span>{isOpen ? `Уровень ${count}` : "Закрытая карта"}</span>
                <strong>{isOpen ? mutation.title : "Неизвестная мутация"}</strong>
                <small>{isOpen ? mutation.description : "Выпадение проявит карту и применит первый бонус."}</small>
              </div>
              <div className="organizm-mutation-card__bonus">
                <strong>{currentBonus}</strong>
                <small>{isOpen ? describeMutationLevel(id, count) : mutation.firstBonus}</small>
              </div>
            </div>
          );
        })}
      </div>

      <div className="organizm-mutations__roll">
        <div>
          <span>Открыто мутаций</span>
          <strong>{purchasedCount} выпадений</strong>
          <small>{canBuyMutation ? mutationFeedback : `Нужно ${mutationCost} мутагенов`}</small>
        </div>
        <button type="button" className="organizm-mutations__mutate" onClick={onBuyMutation} disabled={!canBuyMutation}>
          <Sparkles className="organizm-button-icon" aria-hidden="true" />
          <span>Мутация</span>
          <strong>{mutationCost}</strong>
        </button>
      </div>

      <div className="organizm-mutations__actions">
        <button type="button" onClick={onNextSector}>
          <Play className="organizm-button-icon" aria-hidden="true" />
          Следующий сектор
        </button>
        <button type="button" onClick={onNewSession}>
          <RotateCcw className="organizm-button-icon" aria-hidden="true" />
          Новая сессия
        </button>
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

export function OrganizmGame() {
  const [mode, setMode] = useState<GameMode>("prep");
  const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
  const [boardPatches, setBoardPatches] = useState<BoardPatches>({});
  const [stashItems, setStashItems] = useState<PatchInstance[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [health, setHealth] = useState(BASE_HEALTH);
  const [battle, setBattle] = useState<BattleState>(() => createBattleState(WAVE_CONFIGS[0]));
  const [feedback, setFeedback] = useState("Подготовка к волне 1: Сектор 01.");
  const [sectorIndex, setSectorIndex] = useState(1);
  const [mutagens, setMutagens] = useState(0);
  const [sectorMutagens, setSectorMutagens] = useState(0);
  const [mutationCounts, setMutationCounts] = useState<MutationCounts>({});
  const [lastMutationId, setLastMutationId] = useState<MutationId | null>(null);
  const [mutationFeedback, setMutationFeedback] = useState("Мутагены появятся за уничтожение вирусов.");
  const [tooltipItem, setTooltipItem] = useState<SelectedItem | null>(null);
  const [battleEnding, setBattleEnding] = useState<BattleEndingState>(null);

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
  const longPressRef = useRef<number | null>(null);
  const longPressOpenedRef = useRef(false);
  const battleEndTimerRef = useRef<number | null>(null);
  const battleEndKeyRef = useRef<string | null>(null);
  const bootstrappedRef = useRef(false);

  const currentWave = useMemo(() => getScaledWaveConfig(WAVE_CONFIGS[currentWaveIndex], sectorIndex), [currentWaveIndex, sectorIndex]);
  const sectorTitle = getSectorTitle(sectorIndex);
  const mutationStats = useMemo(() => getMutationStats(mutationCounts), [mutationCounts]);
  const unlockedCells = useMemo(() => getUnlockedCellSet(mutationStats.unlockedCells), [mutationStats.unlockedCells]);
  const passiveStats = useMemo(() => getPassiveStats(getBoardEntries(boardPatches)), [boardPatches]);
  const maxHealth = Math.round((BASE_HEALTH + passiveStats.maxHealthBonus) * (1 + mutationStats.maxHealthPercent / 100));
  const now = typeof performance === "undefined" ? 0 : performance.now();
  const boardCount = getBoardEntries(boardPatches).length;
  const canStartWave = mode === "prep" && battleEnding === null;
  const resultMode = mode === "level-cleared" || mode === "defeat";
  const purchasedMutationCount = getPurchasedMutationCount(mutationCounts);
  const mutationCost = getMutationCost(purchasedMutationCount);
  const selectedResolved = resolveSelectedItem(selectedItem, boardPatches, stashItems);
  const tooltipResolved = resolveSelectedItem(tooltipItem, boardPatches, stashItems);
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

  function createStarterStash(targetSectorIndex = sectorIndex) {
    return getStarterPatchIdsForSector(targetSectorIndex).map((patchId) => createPatchInstance(patchId));
  }

  function createWaveRewards(completedWaveIndex: number, targetSectorIndex = sectorIndex) {
    const rewardCount = WAVE_CONFIGS[completedWaveIndex].rewardCount;
    return getWaveRewardPatchIds(targetSectorIndex, completedWaveIndex, rewardCount).map((patchId) => createPatchInstance(patchId));
  }

  function clearLongPressTimer() {
    if (longPressRef.current !== null) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }

  function clearBattleEndTransition(resetState = true) {
    if (battleEndTimerRef.current !== null) {
      window.clearTimeout(battleEndTimerRef.current);
      battleEndTimerRef.current = null;
    }

    battleEndKeyRef.current = null;
    if (resetState) {
      setBattleEnding(null);
    }
  }

  function scheduleBattleEndTransition(key: string, state: Exclude<BattleEndingState, null>, delayMs: number, complete: () => void) {
    if (battleEndKeyRef.current === key) {
      return;
    }

    clearBattleEndTransition();
    battleEndKeyRef.current = key;
    setBattleEnding(state);

    battleEndTimerRef.current = window.setTimeout(() => {
      battleEndTimerRef.current = null;
      battleEndKeyRef.current = null;
      setBattleEnding(null);
      complete();
    }, delayMs);
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

  useEffect(
    () => () => {
      clearLongPressTimer();
      clearBattleEndTransition(false);
    },
    [],
  );

  useEffect(() => {
    if (bootstrappedRef.current) {
      return;
    }

    bootstrappedRef.current = true;
    resetPrototype("prep", true);
  }, []);

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
      scheduleBattleEndTransition(`defeat-${sectorIndex}-${currentWaveIndex}`, "defeat", DEFEAT_DELAY_MS, () => {
        setMode("defeat");
        setFeedback("Ядро заражено: вирусы прорвали защиту.");
      });
    }
  }, [currentWaveIndex, health, mode, sectorIndex]);

  useEffect(() => {
    if (mode !== "battle") {
      return;
    }

    const waveFinished = battle.spawnedCount >= battle.wave.enemyCount && battle.enemies.length === 0;

    if (!waveFinished) {
      return;
    }

    if (health <= 0) {
      scheduleBattleEndTransition(`defeat-${sectorIndex}-${currentWaveIndex}`, "defeat", DEFEAT_DELAY_MS, () => {
        setMode("defeat");
        setFeedback("Ядро заражено: вирусы прорвали защиту.");
      });
      return;
    }

    if (currentWaveIndex >= WAVE_CONFIGS.length - 1) {
      const bossWave = hasBossInWave(battle.wave);
      scheduleBattleEndTransition(
        `level-${sectorIndex}-${currentWaveIndex}`,
        bossWave ? "boss" : "level",
        bossWave ? BOSS_END_DELAY_MS : LEVEL_END_DELAY_MS,
        () => {
          setMode("level-cleared");
          setFeedback("Сектор очищен. Все 5 волн подавлены.");
        },
      );
      return;
    }

    scheduleBattleEndTransition(`wave-${sectorIndex}-${currentWaveIndex}`, "wave", WAVE_END_DELAY_MS, () => {
      const rewards = createWaveRewards(currentWaveIndex, sectorIndex);
      const nextWaveIndex = currentWaveIndex + 1;

      setStashItems(rewards);
      setCurrentWaveIndex(nextWaveIndex);
      setMode("prep");
      setFeedback(`Подготовка к волне ${nextWaveIndex + 1}: заражение подавлено, новые патчи: ${rewards.length}.`);
    });
  }, [battle.enemies.length, battle.spawnedCount, battle.wave, currentWaveIndex, health, mode, sectorIndex]);

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
      mutationStats,
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
    if (result.mutagensEarned > 0) {
      setMutagens((current) => current + result.mutagensEarned);
      setSectorMutagens((current) => current + result.mutagensEarned);
    }
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
    setTooltipItem(null);
    setFeedback(`${getPatchConfig(targetItem!).title}: слияние до уровня ${levelToRoman(upgradedTarget.level)}.`);
  }

  function placeItemOnBoard(item: PatchInstance, origin: PatchZone, position: BoardPosition) {
    const validation = getPlacementValidation(item, position, boardRefState.current, origin === "board" ? item.uid : undefined, unlockedCells);

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

    setTooltipItem(null);
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
    setTooltipItem(null);
    setFeedback(`${getPatchConfig(item).title} утилизирован.`);
  }

  function moveSelectedToStash() {
    if (!selectedResolved || selectedResolved.origin !== "board") {
      setFeedback("Выбранный патч уже находится в Новых патчах.");
      return;
    }

    const boardItem = boardRefState.current[selectedResolved.item.uid];

    if (!boardItem) {
      return;
    }

    setBoardPatches((current) => {
      const next = { ...current };
      delete next[boardItem.uid];
      return next;
    });
    setStashItems((current) => [...current, { uid: boardItem.uid, patchId: boardItem.patchId, level: boardItem.level }]);
    setSelectedItem({ origin: "stash", uid: boardItem.uid });
    setTooltipItem(null);
    setFeedback(`${getPatchConfig(boardItem).title} снят в Новые патчи.`);
  }

  function resetPrototype(nextMode: GameMode = "prep", resetSession = false, sectorOverride?: number) {
    uidRef.current = 1;
    const targetSectorIndex = resetSession ? 1 : sectorOverride ?? sectorIndex;
    const starterStash = createStarterStash(targetSectorIndex);
    const targetMutationStats = resetSession ? getMutationStats({}) : mutationStats;
    const targetMaxHealth = Math.round(BASE_HEALTH * (1 + targetMutationStats.maxHealthPercent / 100));
    const nextBattle = createBattleState(getScaledWaveConfig(WAVE_CONFIGS[0], targetSectorIndex));
    clearBattleEndTransition();

    if (resetSession || sectorOverride) {
      setSectorIndex(targetSectorIndex);
    }

    if (resetSession) {
      setMutagens(0);
      setMutationCounts({});
      setLastMutationId(null);
      setMutationFeedback("Мутагены появятся за уничтожение вирусов.");
    }

    setSectorMutagens(0);
    setCurrentWaveIndex(0);
    setBoardPatches({});
    setStashItems(starterStash);
    setSelectedItem(starterStash[0] ? { origin: "stash", uid: starterStash[0].uid } : null);
    dragRef.current = null;
    setDrag(null);
    previousMaxHealthRef.current = targetMaxHealth;
    maxHealthRef.current = targetMaxHealth;
    healthRef.current = targetMaxHealth;
    setHealth(targetMaxHealth);
    battleRef.current = nextBattle;
    setBattle(nextBattle);
    setTooltipItem(null);
    clearLongPressTimer();
    longPressOpenedRef.current = false;
    setFeedback(`Подготовка к волне 1: ${getSectorTitle(targetSectorIndex)}.`);
    cooldownsRef.current = {};
    setMode(nextMode);
  }

  function handleStartWave() {
    if (!canStartWave) {
      return;
    }

    clearBattleEndTransition();
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
    setTooltipItem(null);
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

    setTooltipItem(null);
    setSelectedItem({ origin, uid });
  }

  function beginPatchDrag(event: PointerEvent<HTMLElement>, item: PatchInstance, origin: PatchZone) {
    if (mode !== "prep") {
      setFeedback("Во время боя патчи заблокированы.");
      return;
    }

    event.stopPropagation();
    clearLongPressTimer();
    longPressOpenedRef.current = false;

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
    const validation = getPlacementValidation(item, candidate, boardPatches, origin === "board" ? item.uid : undefined, unlockedCells);

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

    if (event.pointerType !== "mouse") {
      longPressRef.current = window.setTimeout(() => {
        const activeDrag = dragRef.current;

        if (!activeDrag || activeDrag.pointerId !== event.pointerId || activeDrag.hasMoved) {
          return;
        }

        longPressOpenedRef.current = true;
        setSelectedItem({ origin, uid: item.uid });
        setTooltipItem({ origin, uid: item.uid });
        setFeedback(`${getPatchConfig(item).title}: описание патча открыто.`);
      }, 560);
    }
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
      unlockedCells,
    );

    const hasMoved =
      activeDrag.hasMoved || Math.hypot(event.clientX - activeDrag.startX, event.clientY - activeDrag.startY) > 6;

    if (hasMoved) {
      clearLongPressTimer();
    }

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

    const keepTooltipOpen = longPressOpenedRef.current;
    clearLongPressTimer();

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
        if (!keepTooltipOpen) {
          setTooltipItem(null);
        }
        setFeedback(`${getPatchConfig(activeDrag.item).title} ${levelToRoman(activeDrag.item.level)} выбран.`);
      }

      dragRef.current = null;
      setDrag(null);
      longPressOpenedRef.current = false;
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
      longPressOpenedRef.current = false;
      return;
    }

    if (isPointerInsideElement(event, deleteRef.current)) {
      deleteItem({ origin: activeDrag.origin, uid: activeDrag.item.uid });
      dragRef.current = null;
      setDrag(null);
      longPressOpenedRef.current = false;
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
        setTooltipItem(null);
        setFeedback(`${getPatchConfig(boardItem).title} снят в запас.`);
        dragRef.current = null;
        setDrag(null);
        longPressOpenedRef.current = false;
        return;
      }
    }

    if (activeDrag.valid && activeDrag.candidate) {
      placeItemOnBoard(activeDrag.item, activeDrag.origin, activeDrag.candidate);
      dragRef.current = null;
      setDrag(null);
      longPressOpenedRef.current = false;
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
    longPressOpenedRef.current = false;
  }

  function handlePointerCancel(event: PointerEvent<HTMLElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      clearLongPressTimer();
      longPressOpenedRef.current = false;
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

  function handleTooltipInstall() {
    if (!tooltipResolved) {
      return;
    }

    setSelectedItem({ origin: tooltipResolved.origin, uid: tooltipResolved.item.uid });
    setTooltipItem(null);

    if (tooltipResolved.origin === "stash") {
      setFeedback(`${getPatchConfig(tooltipResolved.item).title}: выбери клетку Матрицы для установки.`);
    } else {
      setFeedback(`${getPatchConfig(tooltipResolved.item).title}: патч уже установлен в Матрице.`);
    }
  }

  function handleOpenMutations() {
    setMode("mutations");
    setTooltipItem(null);
    setMutationFeedback(mutagens >= mutationCost ? "Мутационная колода готова к новому выпадению." : "Недостаточно мутагенов");
  }

  function handleRetrySector() {
    resetPrototype("prep", false);
  }

  function handleBuyMutation() {
    const currentPurchasedCount = getPurchasedMutationCount(mutationCounts);
    const currentCost = getMutationCost(currentPurchasedCount);

    if (mutagens < currentCost) {
      setMutationFeedback("Недостаточно мутагенов");
      return;
    }

    const mutationId = MUTATION_ORDER[Math.floor(Math.random() * MUTATION_ORDER.length)];
    const currentCount = mutationCounts[mutationId] ?? 0;
    const mutation = getMutationConfig(mutationId);

    setMutagens((current) => current - currentCost);
    setMutationCounts((current) => ({
      ...current,
      [mutationId]: (current[mutationId] ?? 0) + 1,
    }));
    setLastMutationId(mutationId);
    setMutationFeedback(`${mutation.title}: ${currentCount === 0 ? mutation.firstBonus : mutation.repeatBonus}`);
  }

  function handleNextSector() {
    const nextSectorIndex = sectorIndex + 1;
    resetPrototype("prep", false, nextSectorIndex);
    setMutationFeedback(`Мутации применены. ${getSectorTitle(nextSectorIndex)} готов к запуску.`);
  }

  const resultTitle = mode === "level-cleared" ? "Сектор очищен" : "Ядро заражено";
  const resultText =
    mode === "level-cleared"
      ? `${sectorTitle}. Оставшееся здоровье: ${health}/${maxHealth}.`
      : `${sectorTitle}. Достигнута волна ${currentWave.waveNumber}.`;

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
      <>
          <div className="organizm-game__header">
            <div>
              <p className="organizm-game__eyebrow">Pixel autobattler</p>
              <h3>Organizm</h3>
              <p>{sectorTitle}. Размещай патчи, объединяй уровни и переживи растущую вирусную волну.</p>
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

          <GameHUD
            health={health}
            maxHealth={maxHealth}
            waveNumber={currentWave.waveNumber}
            sectorIndex={sectorIndex}
            mutagens={mutagens}
          />

          {mode === "mutations" ? (
            <MutationScreen
              sectorIndex={sectorIndex}
              mutagens={mutagens}
              mutationCost={mutationCost}
              mutationCounts={mutationCounts}
              lastMutationId={lastMutationId}
              mutationFeedback={mutationFeedback}
              onBuyMutation={handleBuyMutation}
              onNextSector={handleNextSector}
              onNewSession={() => resetPrototype("prep", true)}
            />
          ) : (
            <div ref={layoutRef} className={`organizm-game__layout organizm-game__layout--${mode}`}>
              <div className="organizm-battle-shell">
                <div className="organizm-section-title">
                  <Crosshair aria-hidden="true" />
                  <span>{sectorTitle}</span>
                  <strong>
                    {battle.spawnedCount}/{currentWave.enemyCount} вирусов
                  </strong>
                </div>
                <Battlefield
                  battle={battle}
                  health={health}
                  maxHealth={maxHealth}
                  mode={mode}
                  now={now}
                  sectorTitle={sectorTitle}
                  endingState={battleEnding}
                />
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
                  unlockedCells={unlockedCells}
                  onPatchPointerDown={beginPatchDrag}
                  onPatchSelect={handlePatchSelect}
                  onCellClick={handleBoardCellClick}
                />
                {mode === "prep" ? (
                  <PatchStash
                    stashRef={stashRef}
                    stashItems={stashItems}
                    selectedItem={selectedItem}
                    mergeCandidateUid={stashMergeTarget?.uid ?? null}
                    mode={mode}
                    onSelect={handlePatchSelect}
                    onPatchPointerDown={beginPatchDrag}
                  />
                ) : null}
              </div>
            </div>
          )}

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
                <div className="organizm-result__stats">
                  <span>Мутагены за сектор</span>
                  <strong>{sectorMutagens}</strong>
                  <span>Всего в сессии</span>
                  <strong>{mutagens}</strong>
                </div>
                <div className="organizm-result__actions">
                  <button type="button" onClick={handleOpenMutations}>
                    <Sparkles className="organizm-button-icon" aria-hidden="true" />
                    Эволюция
                  </button>
                  <button type="button" onClick={handleRetrySector}>
                    <RotateCcw className="organizm-button-icon" aria-hidden="true" />
                    Повторить сектор
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>

      {drag ? (
        <div
          className={`organizm-drag-ghost organizm-drag-ghost--${getPatchConfig(drag.item).tone}`}
          style={{ left: drag.screenX, top: drag.screenY }}
          aria-hidden="true"
        >
          <PatchModule item={drag.item} variant="ghost" />
        </div>
      ) : null}

      <PatchTooltip
        selected={tooltipResolved}
        boardMergeTarget={boardMergeTarget}
        stashMergeTarget={stashMergeTarget}
        mode={mode}
        onInstall={handleTooltipInstall}
        onMergeBoard={handleMergeBoard}
        onMergeStash={handleMergeStash}
        onMoveToStash={moveSelectedToStash}
        onDelete={handleDeleteSelected}
        onClose={() => setTooltipItem(null)}
      />
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
