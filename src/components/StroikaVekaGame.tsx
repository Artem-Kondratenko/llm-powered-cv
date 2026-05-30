import { AlertTriangle, CheckCircle2, RotateCcw, TimerReset } from "lucide-react";
import { type CSSProperties, type PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import "./StroikaVekaGame.css";

type CellCoord = {
  x: number;
  y: number;
};

type Rect = CellCoord & {
  width: number;
  height: number;
};

type PlanItem = {
  id: string;
  area: number;
  hint: CellCoord;
};

type Level = {
  width: number;
  height: number;
  plan: PlanItem[];
  blocked: CellCoord[];
  solutionRects?: Rect[];
};

type SelectionMode = "build" | "demolish";
type GamePhase = "tutorial" | "main";
type BoardBlueprintVariant = "basic" | "sector" | "industrial" | "residential" | "restricted";

type Selection = {
  pointerId: number;
  start: CellCoord;
  end: CellCoord;
  mode: SelectionMode;
  targetBuildingId?: string;
};

type PlacedBuilding = Rect & {
  id: string;
  planId: string;
  area: number;
  visualType: BuildingVisualType;
  roofVariant: RoofVariant;
  surfaceVariant: SurfaceVariant;
};

type BuildingVisualType = "tower" | "panel" | "institute" | "combinat" | "module";
type RoofVariant = "core" | "radar" | "vents";
type SurfaceVariant = "concrete" | "mint" | "ochre" | "graphite";

type FeedbackTone = "neutral" | "success" | "warning" | "danger";

type Feedback = {
  text: string;
  tone: FeedbackTone;
};

type LevelResult = {
  seconds: number;
  errors: number;
  previousDifficulty: number;
  nextDifficulty: number;
  verdict: "good" | "normal" | "hard";
};

type FailedSelection = {
  rect: Rect;
  tone: "warning" | "danger";
};

type BoardMetrics = {
  cellSize: number;
  gap: number;
  padding: number;
  width: number;
  height: number;
};

type SelectionAnalysis = {
  mode: SelectionMode;
  rect: Rect;
  area: number;
  hasBlockedCell: boolean;
  availablePlan: PlanItem | undefined;
  overlappedIds: Set<string>;
  targetBuildingId?: string;
  tone: "success" | "warning" | "danger";
  marker: string;
  label: string;
};

type TutorialStep = {
  title: string;
  description: string;
  level: Level;
  ghost: Rect;
  targetArea: number;
};

const MAX_DIFFICULTY = 5;
const MAX_LONG_BUILDS = 3;

const PRESET_LEVELS: Array<{
  width: number;
  height: number;
  rects: Rect[];
  blocked?: CellCoord[];
}> = [
  {
    width: 5,
    height: 4,
    rects: [
      { x: 0, y: 0, width: 2, height: 2 },
      { x: 2, y: 0, width: 3, height: 2 },
      { x: 0, y: 2, width: 1, height: 2 },
      { x: 1, y: 2, width: 2, height: 2 },
      { x: 3, y: 2, width: 2, height: 2 },
    ],
  },
  {
    width: 5,
    height: 5,
    rects: [
      { x: 0, y: 0, width: 2, height: 2 },
      { x: 2, y: 0, width: 3, height: 1 },
      { x: 2, y: 1, width: 3, height: 2 },
      { x: 0, y: 2, width: 2, height: 3 },
      { x: 2, y: 3, width: 3, height: 2 },
    ],
  },
  {
    width: 6,
    height: 5,
    rects: [
      { x: 0, y: 0, width: 2, height: 2 },
      { x: 2, y: 0, width: 4, height: 2 },
      { x: 0, y: 2, width: 1, height: 3 },
      { x: 1, y: 2, width: 2, height: 3 },
      { x: 3, y: 2, width: 3, height: 3 },
    ],
  },
  {
    width: 6,
    height: 6,
    rects: [
      { x: 0, y: 0, width: 3, height: 2 },
      { x: 3, y: 0, width: 3, height: 2 },
      { x: 0, y: 2, width: 2, height: 4 },
      { x: 2, y: 2, width: 2, height: 2 },
      { x: 4, y: 2, width: 2, height: 2 },
      { x: 2, y: 4, width: 4, height: 2 },
    ],
  },
  {
    width: 6,
    height: 6,
    rects: [
      { x: 0, y: 0, width: 3, height: 3 },
      { x: 3, y: 0, width: 3, height: 2 },
      { x: 3, y: 2, width: 3, height: 1 },
      { x: 0, y: 3, width: 2, height: 3 },
      { x: 2, y: 3, width: 2, height: 3 },
      { x: 4, y: 3, width: 2, height: 3 },
    ],
  },
  {
    width: 7,
    height: 6,
    rects: [
      { x: 0, y: 0, width: 2, height: 2 },
      { x: 2, y: 0, width: 3, height: 2 },
      { x: 5, y: 0, width: 2, height: 4 },
      { x: 0, y: 2, width: 3, height: 2 },
      { x: 3, y: 2, width: 2, height: 2 },
      { x: 0, y: 4, width: 4, height: 2 },
      { x: 4, y: 4, width: 3, height: 2 },
    ],
  },
];

const FEEDBACK_IDLE: Feedback = {
  text: "Генплан открыт",
  tone: "neutral",
};

function rectArea(rect: Rect) {
  return rect.width * rect.height;
}

function cellKey(cell: CellCoord) {
  return `${cell.x}:${cell.y}`;
}

function getBlockedSignature(blocked: CellCoord[]) {
  return blocked
    .map((cell) => `${cell.x}:${cell.y}`)
    .sort()
    .join("|");
}

function assertBlockedStableBeforeAfterAction(before: Level, after: Level) {
  return getBlockedSignature(before.blocked) === getBlockedSignature(after.blocked);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeSelection(start: CellCoord, end: CellCoord): Rect {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);

  return {
    x,
    y,
    width: Math.abs(start.x - end.x) + 1,
    height: Math.abs(start.y - end.y) + 1,
  };
}

function clampCellToLevel(cell: CellCoord, level: Level): CellCoord {
  return {
    x: clamp(cell.x, 0, level.width - 1),
    y: clamp(cell.y, 0, level.height - 1),
  };
}

function normalizeSelectionForLevel(selection: Selection, level: Level): Rect {
  return normalizeSelection(clampCellToLevel(selection.start, level), clampCellToLevel(selection.end, level));
}

function rectsIntersect(a: Rect, b: Rect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function rectContainsCell(rect: Rect, cell: CellCoord) {
  return cell.x >= rect.x && cell.x < rect.x + rect.width && cell.y >= rect.y && cell.y < rect.y + rect.height;
}

function cloneCell(cell: CellCoord): CellCoord {
  return { x: cell.x, y: cell.y };
}

function cloneRect(rect: Rect): Rect {
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}

function romanize(value: number) {
  const symbols: Array<[number, string]> = [
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let remaining = value;
  let result = "";

  symbols.forEach(([amount, symbol]) => {
    while (remaining >= amount) {
      result += symbol;
      remaining -= amount;
    }
  });

  return result;
}

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function getHintForRect(rect: Rect, blocked: CellCoord[]): CellCoord {
  const blockedKeys = new Set(blocked.map(cellKey));

  for (let y = rect.y; y < rect.y + rect.height; y += 1) {
    for (let x = rect.x; x < rect.x + rect.width; x += 1) {
      const candidate = { x, y };

      if (!blockedKeys.has(cellKey(candidate))) {
        return candidate;
      }
    }
  }

  throw new Error("Cannot create a plan hint for a fully blocked rect.");
}

function createLevelFromRects(
  width: number,
  height: number,
  rects: Rect[],
  blocked: CellCoord[] = [],
  shufflePlan = true,
): Level {
  const blockedCopy = blocked.map(cloneCell);
  const rectCopies = rects.map(cloneRect);
  const solutionRects = rectsFormAccessiblePartition(width, height, rectCopies, blockedCopy)
    ? rectCopies.map(cloneRect)
    : undefined;
  const planItems = rectCopies.map((rect, index) => ({
    id: `plan-${index + 1}-${rect.x}-${rect.y}`,
    area: rectArea(rect),
    hint: getHintForRect(rect, blockedCopy),
  }));
  const plan = shufflePlan ? shuffle(planItems) : planItems;

  return {
    width,
    height,
    plan,
    blocked: blockedCopy,
    ...(solutionRects ? { solutionRects } : {}),
  };
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Учебный приказ 1/3",
    description: "Протяни первый фундамент на III клетки.",
    level: createLevelFromRects(4, 3, [{ x: 0, y: 1, width: 3, height: 1 }], [], false),
    ghost: { x: 0, y: 1, width: 3, height: 1 },
    targetArea: 3,
  },
  {
    title: "Учебный приказ 2/3",
    description: "Закрой два проекта из плана: IV и VI.",
    level: createLevelFromRects(
      4,
      4,
      [
        { x: 0, y: 0, width: 2, height: 2 },
        { x: 2, y: 0, width: 2, height: 3 },
      ],
      [],
      false,
    ),
    ghost: { x: 0, y: 0, width: 2, height: 2 },
    targetArea: 4,
  },
  {
    title: "Учебный приказ 3/3",
    description: "Пустырь не застраивать. Обведи корпус рядом с ним.",
    level: createLevelFromRects(
      4,
      4,
      [
        { x: 0, y: 0, width: 2, height: 2 },
        { x: 0, y: 2, width: 3, height: 1 },
      ],
      [{ x: 2, y: 1 }],
      false,
    ),
    ghost: { x: 0, y: 0, width: 2, height: 2 },
    targetArea: 4,
  },
];

function getDifficultyShape(difficulty: number) {
  if (difficulty <= 1) {
    return { width: 5, height: 5, targetRects: 5, maxArea: 8, blockedCount: 0 };
  }

  if (difficulty === 2) {
    return { width: 6, height: 5, targetRects: 6, maxArea: 9, blockedCount: 0 };
  }

  if (difficulty === 3) {
    return { width: 6, height: 6, targetRects: 7, maxArea: 10, blockedCount: 0 };
  }

  if (difficulty === 4) {
    return { width: 7, height: 6, targetRects: 7, maxArea: 12, blockedCount: 1 };
  }

  return { width: 7, height: 6, targetRects: 8, maxArea: 12, blockedCount: 2 };
}

function createBaseRects(width: number, height: number, blockedCount: number) {
  if (blockedCount <= 0) {
    return {
      blocked: [],
      rects: [{ x: 0, y: 0, width, height }],
    };
  }

  if (blockedCount === 1) {
    return {
      blocked: [{ x: 3, y: 2 }],
      rects: [
        { x: 0, y: 0, width, height: 2 },
        { x: 0, y: 2, width: 3, height: 1 },
        { x: 4, y: 2, width: 3, height: 1 },
        { x: 0, y: 3, width, height: height - 3 },
      ],
    };
  }

  return {
    blocked: [
      { x: 2, y: 2 },
      { x: 4, y: 3 },
    ],
    rects: [
      { x: 0, y: 0, width, height: 2 },
      { x: 0, y: 2, width: 2, height: 1 },
      { x: 3, y: 2, width: 4, height: 1 },
      { x: 0, y: 3, width: 4, height: 1 },
      { x: 5, y: 3, width: 2, height: 1 },
      { x: 0, y: 4, width, height: height - 4 },
    ],
  };
}

function getSplitCandidates(rect: Rect, minArea: number, maxArea: number) {
  const candidates: Array<{ first: Rect; second: Rect }> = [];

  for (let cut = 1; cut < rect.width; cut += 1) {
    const first = { x: rect.x, y: rect.y, width: cut, height: rect.height };
    const second = {
      x: rect.x + cut,
      y: rect.y,
      width: rect.width - cut,
      height: rect.height,
    };

    if (
      rectArea(first) >= minArea &&
      rectArea(second) >= minArea &&
      (rectArea(first) <= maxArea || rectArea(second) <= maxArea)
    ) {
      candidates.push({ first, second });
    }
  }

  for (let cut = 1; cut < rect.height; cut += 1) {
    const first = { x: rect.x, y: rect.y, width: rect.width, height: cut };
    const second = {
      x: rect.x,
      y: rect.y + cut,
      width: rect.width,
      height: rect.height - cut,
    };

    if (
      rectArea(first) >= minArea &&
      rectArea(second) >= minArea &&
      (rectArea(first) <= maxArea || rectArea(second) <= maxArea)
    ) {
      candidates.push({ first, second });
    }
  }

  return candidates;
}

function splitRects(baseRects: Rect[], targetRects: number, maxArea: number) {
  const minArea = 2;
  let rects = [...baseRects];
  let guard = 0;

  while ((rects.length < targetRects || rects.some((rect) => rectArea(rect) > maxArea)) && guard < 80) {
    guard += 1;
    const splitOptions = rects
      .map((rect, index) => ({
        index,
        area: rectArea(rect),
        candidates: getSplitCandidates(rect, minArea, maxArea),
      }))
      .filter((option) => option.candidates.length > 0)
      .sort((a, b) => b.area - a.area);

    const target = splitOptions[0];

    if (!target) {
      break;
    }

    const candidate = target.candidates[Math.floor(Math.random() * target.candidates.length)];
    rects = rects.flatMap((rect, index) => (index === target.index ? [candidate.first, candidate.second] : [rect]));
  }

  return rects;
}

function rectWithinBounds(rect: Rect, width: number, height: number) {
  return rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= width && rect.y + rect.height <= height;
}

function cellWithinBounds(cell: CellCoord, width: number, height: number) {
  return rectWithinBounds({ ...cell, width: 1, height: 1 }, width, height);
}

function rectIncludesBlockedCell(rect: Rect, blocked: CellCoord[]) {
  return blocked.some((cell) => rectContainsCell(rect, cell));
}

function rectsOverlapBlockedCells(rects: Rect[], blocked: CellCoord[]) {
  return rects.some((rect) => rectIncludesBlockedCell(rect, blocked));
}

function placementOverlapsBlockedCell(placement: PlacedBuilding, blocked: CellCoord[]) {
  return rectIncludesBlockedCell(placement, blocked);
}

function getOccupiedCells(rects: Rect[]) {
  const occupiedCells = new Set<string>();

  rects.forEach((rect) => {
    for (let y = rect.y; y < rect.y + rect.height; y += 1) {
      for (let x = rect.x; x < rect.x + rect.width; x += 1) {
        occupiedCells.add(cellKey({ x, y }));
      }
    }
  });

  return occupiedCells;
}

function getLevelVarietyStats(rects: Rect[]) {
  const areaCounts = new Map<number, number>();
  const shapeSet = new Set<string>();

  rects.forEach((rect) => {
    const area = rectArea(rect);
    areaCounts.set(area, (areaCounts.get(area) ?? 0) + 1);
    shapeSet.add(`${rect.width}x${rect.height}`);
  });

  const maxSameAreaShare = rects.length > 0 ? Math.max(...areaCounts.values()) / rects.length : 1;

  return {
    areaCount: areaCounts.size,
    shapeCount: shapeSet.size,
    maxSameAreaShare,
  };
}

function isVariedEnough(rects: Rect[], difficulty: number) {
  const stats = getLevelVarietyStats(rects);
  const requiredAreaCount = difficulty <= 1 ? 2 : 3;
  const achievableAreaCount = Math.min(requiredAreaCount, rects.length);

  return stats.areaCount >= achievableAreaCount && stats.shapeCount >= 2 && stats.maxSameAreaShare <= 0.7;
}

function validateBlockedCells(width: number, height: number, blocked: CellCoord[]): { ok: boolean; reason?: string } {
  const blockedKeys = new Set(blocked.map(cellKey));

  if (blockedKeys.size !== blocked.length) {
    return { ok: false, reason: "Повторяющийся пустырь" };
  }

  if (!blocked.every((cell) => cellWithinBounds(cell, width, height))) {
    return { ok: false, reason: "Пустырь вне поля" };
  }

  return { ok: true };
}

function validatePartitionCoverage(
  width: number,
  height: number,
  rects: Rect[],
  blocked: CellCoord[],
): { ok: boolean; reason?: string } {
  const blockedValidation = validateBlockedCells(width, height, blocked);

  if (!blockedValidation.ok) {
    return blockedValidation;
  }

  const blockedKeys = new Set(blocked.map(cellKey));
  const accessibleArea = width * height - blockedKeys.size;
  const occupiedCells = new Set<string>();

  if (rects.length < 1) {
    return { ok: false, reason: "Нет прямоугольников разбиения" };
  }

  for (const rect of rects) {
    if (!rectWithinBounds(rect, width, height) || rectArea(rect) < 1) {
      return { ok: false, reason: "Rect вне поля" };
    }

    if (rectIncludesBlockedCell(rect, blocked)) {
      return { ok: false, reason: "Rect пересекает пустырь" };
    }

    for (let y = rect.y; y < rect.y + rect.height; y += 1) {
      for (let x = rect.x; x < rect.x + rect.width; x += 1) {
        const key = cellKey({ x, y });

        if (occupiedCells.has(key) || blockedKeys.has(key)) {
          return { ok: false, reason: "Клетка покрыта больше одного раза" };
        }

        occupiedCells.add(key);
      }
    }
  }

  if (occupiedCells.size !== accessibleArea) {
    return { ok: false, reason: "Доступная область покрыта не полностью" };
  }

  return { ok: true };
}

function rectsFormAccessiblePartition(width: number, height: number, rects: Rect[], blocked: CellCoord[]) {
  return validatePartitionCoverage(width, height, rects, blocked).ok;
}

function planAreasMatchSolution(plan: PlanItem[], solutionRects: Rect[]) {
  const planAreas = plan.map((item) => item.area).sort((a, b) => a - b);
  const solutionAreas = solutionRects.map(rectArea).sort((a, b) => a - b);

  return planAreas.length === solutionAreas.length && planAreas.every((area, index) => area === solutionAreas[index]);
}

function validateRectPartition(width: number, height: number, rects: Rect[], blocked: CellCoord[], difficulty: number) {
  const partition = validatePartitionCoverage(width, height, rects, blocked);

  return partition.ok && isVariedEnough(rects, difficulty);
}

function validateLevelIntegrity(
  level: Level,
  options: { requireFullCoverage?: boolean } = {},
): { ok: boolean; reason?: string } {
  const requireFullCoverage = options.requireFullCoverage ?? Boolean(level.solutionRects);
  const blockedKeys = new Set(level.blocked.map(cellKey));
  const plannedArea = level.plan.reduce((sum, item) => sum + item.area, 0);
  const accessibleArea = getAccessibleCellCount(level);
  const blockedValidation = validateBlockedCells(level.width, level.height, level.blocked);

  if (!blockedValidation.ok) {
    return blockedValidation;
  }

  for (const item of level.plan) {
    if (!cellWithinBounds(item.hint, level.width, level.height)) {
      return { ok: false, reason: "Подсказка вне поля" };
    }

    if (blockedKeys.has(cellKey(item.hint))) {
      return { ok: false, reason: "Подсказка попала на пустырь" };
    }
  }

  if (requireFullCoverage && plannedArea !== accessibleArea) {
    return { ok: false, reason: "План не равен доступной площади" };
  }

  if (requireFullCoverage && !level.solutionRects) {
    return { ok: false, reason: "Нет скрытого разбиения уровня" };
  }

  if (level.solutionRects) {
    const partition = validatePartitionCoverage(level.width, level.height, level.solutionRects, level.blocked);
    const solutionArea = level.solutionRects.reduce((sum, rect) => sum + rectArea(rect), 0);

    if (!partition.ok) {
      return partition;
    }

    if (solutionArea !== accessibleArea) {
      return { ok: false, reason: "Скрытое разбиение не равно доступной площади" };
    }

    if (plannedArea !== solutionArea || !planAreasMatchSolution(level.plan, level.solutionRects)) {
      return { ok: false, reason: "План не совпадает со скрытым разбиением" };
    }
  } else if (plannedArea > accessibleArea) {
    return { ok: false, reason: "План больше доступной площади" };
  }

  return { ok: true };
}

function generateLevel(levelNumber: number, difficulty: number, forceGenerated = false): Level {
  if (!forceGenerated && levelNumber <= PRESET_LEVELS.length) {
    const preset = PRESET_LEVELS[levelNumber - 1];

    if (validateRectPartition(preset.width, preset.height, preset.rects, preset.blocked ?? [], difficulty)) {
      return createLevelFromRects(preset.width, preset.height, preset.rects, preset.blocked);
    }
  }

  const shape = getDifficultyShape(difficulty);

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const base = createBaseRects(shape.width, shape.height, shape.blockedCount);
    const rects = splitRects(base.rects, shape.targetRects, shape.maxArea);
    const validRects = rects.filter((rect) => rectArea(rect) >= 2 && rectArea(rect) <= shape.maxArea);
    const accessibleArea = shape.width * shape.height - base.blocked.length;
    const generatedArea = validRects.reduce((sum, rect) => sum + rectArea(rect), 0);

    if (
      validRects.length >= 4 &&
      validRects.length <= 8 &&
      generatedArea === accessibleArea &&
      validateRectPartition(shape.width, shape.height, validRects, base.blocked, difficulty)
    ) {
      const level = createLevelFromRects(shape.width, shape.height, validRects, base.blocked);

      if (validateLevelIntegrity(level).ok) {
        return level;
      }
    }
  }

  const fallback =
    PRESET_LEVELS.find((preset) =>
      validateRectPartition(preset.width, preset.height, preset.rects, preset.blocked ?? [], difficulty),
    ) ?? PRESET_LEVELS[0];

  return createLevelFromRects(fallback.width, fallback.height, fallback.rects, fallback.blocked);
}

function getBuildingVisualType(rect: Rect): BuildingVisualType {
  const ratio = rect.width / rect.height;
  const area = rectArea(rect);

  if (rect.height >= rect.width * 2 || rect.width === 1) {
    return "tower";
  }

  if (ratio >= 2) {
    return "panel";
  }

  if (area >= 9 && Math.abs(rect.width - rect.height) <= 1) {
    return "institute";
  }

  if (area >= 8) {
    return "combinat";
  }

  return "module";
}

function hashText(value: string) {
  return Array.from(value).reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

function getRoofVariant(rect: Rect, planId: string): RoofVariant {
  const variants: RoofVariant[] = rectArea(rect) <= 3 ? ["radar", "core", "vents"] : ["core", "vents", "radar"];

  return variants[hashText(`${planId}-${rect.width}-${rect.height}`) % variants.length];
}

function getSurfaceVariant(rect: Rect, planId: string): SurfaceVariant {
  const variants: SurfaceVariant[] = ["concrete", "mint", "ochre", "graphite"];

  if (rectArea(rect) >= 10) {
    return variants[(hashText(planId) + 2) % variants.length];
  }

  return variants[(hashText(planId) + rect.width + rect.height) % variants.length];
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getCellWord(area: number) {
  const lastDigit = area % 10;
  const lastTwoDigits = area % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return "клетка";
  }

  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return "клетки";
  }

  return "клеток";
}

function getCellFromPointer(
  event: PointerEvent<HTMLElement>,
  level: Level,
  board: HTMLElement | null,
  clampOutside = false,
): CellCoord | null {
  if (!board) {
    return null;
  }

  const bounds = board.getBoundingClientRect();

  if (bounds.width <= 0 || bounds.height <= 0) {
    return null;
  }

  const rawX = (event.clientX - bounds.left) / bounds.width;
  const rawY = (event.clientY - bounds.top) / bounds.height;

  if (!clampOutside && (rawX < 0 || rawX > 1 || rawY < 0 || rawY > 1)) {
    return null;
  }

  return {
    x: clamp(Math.floor(rawX * level.width), 0, level.width - 1),
    y: clamp(Math.floor(rawY * level.height), 0, level.height - 1),
  };
}

function findAvailablePlan(
  level: Level,
  placements: PlacedBuilding[],
  overlappedBuildingIds: Set<string>,
  area: number,
) {
  const stillPlacedPlanIds = new Set(
    placements.filter((building) => !overlappedBuildingIds.has(building.id)).map((building) => building.planId),
  );

  return level.plan.find((item) => item.area === area && !stillPlacedPlanIds.has(item.id));
}

function findBuildingAtCell(placements: PlacedBuilding[], cell: CellCoord) {
  return placements.find((building) => rectContainsCell(building, cell));
}

function getBuildingsIntersectingRect(placements: PlacedBuilding[], rect: Rect) {
  return placements.filter((building) => rectsIntersect(rect, building));
}

function getAccessibleCellCount(level: Level) {
  return level.width * level.height - level.blocked.length;
}

function isLevelComplete(level: Level, placements: PlacedBuilding[]) {
  const placedPlanIds = new Set(placements.map((building) => building.planId));
  const occupiedCells = new Set<string>();
  const blockedCells = new Set(level.blocked.map(cellKey));

  if (placedPlanIds.size !== level.plan.length) {
    return false;
  }

  for (let index = 0; index < placements.length; index += 1) {
    const building = placements[index];

    if (
      !rectWithinBounds(building, level.width, level.height) ||
      placementOverlapsBlockedCell(building, level.blocked)
    ) {
      return false;
    }

    for (let otherIndex = index + 1; otherIndex < placements.length; otherIndex += 1) {
      if (rectsIntersect(building, placements[otherIndex])) {
        return false;
      }
    }

    for (let y = building.y; y < building.y + building.height; y += 1) {
      for (let x = building.x; x < building.x + building.width; x += 1) {
        const key = cellKey({ x, y });

        if (blockedCells.has(key) || occupiedCells.has(key)) {
          return false;
        }

        occupiedCells.add(key);
      }
    }
  }

  return occupiedCells.size === getAccessibleCellCount(level);
}

function adaptDifficulty(difficulty: number, errors: number, seconds: number) {
  const quickLimit = 45 + difficulty * 18;

  if (errors <= 1 && seconds <= quickLimit) {
    return {
      verdict: "good" as const,
      nextDifficulty: clamp(difficulty + 1, 1, MAX_DIFFICULTY),
    };
  }

  if (errors >= 4 || seconds > quickLimit * 2) {
    return {
      verdict: "hard" as const,
      nextDifficulty: clamp(difficulty - 1, 1, MAX_DIFFICULTY),
    };
  }

  return {
    verdict: "normal" as const,
    nextDifficulty: difficulty,
  };
}

function getVerdictText(result: LevelResult) {
  if (result.verdict === "good") {
    return "Норматив перевыполнен";
  }

  if (result.verdict === "hard") {
    return "Темп снижен";
  }

  return "План идет по графику";
}

function getPlanStatus(item: PlanItem, placedPlanIds: Set<string>) {
  return placedPlanIds.has(item.id) ? "ПРИНЯТО" : "В ПЛАНЕ";
}

function getPlanCardLabel(item: PlanItem) {
  return `${romanize(item.area)} · ${item.area} ${getCellWord(item.area)}`;
}

function getThreatTone(longBuilds: number) {
  if (longBuilds >= 2) {
    return "danger";
  }

  if (longBuilds === 1) {
    return "warning";
  }

  return "calm";
}

function getBoardBlueprintVariant(levelNumber: number, difficulty: number, blockedCount: number): BoardBlueprintVariant {
  if (blockedCount > 0) {
    return "restricted";
  }

  if (difficulty >= 5) {
    return "industrial";
  }

  if (difficulty >= 4) {
    return "residential";
  }

  if (levelNumber % 2 === 0) {
    return "sector";
  }

  return "basic";
}

export function StroikaVekaGame() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("tutorial");
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  const [levelNumber, setLevelNumber] = useState(1);
  const [difficulty, setDifficulty] = useState(1);
  const [level, setLevel] = useState(() => TUTORIAL_STEPS[0].level);
  const [placements, setPlacements] = useState<PlacedBuilding[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [failedSelection, setFailedSelection] = useState<FailedSelection | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(FEEDBACK_IDLE);
  const [errors, setErrors] = useState(0);
  const [longBuilds, setLongBuilds] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<LevelResult | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [boardMetrics, setBoardMetrics] = useState<BoardMetrics | null>(null);
  const boardViewportRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const failureTimerRef = useRef<number | null>(null);
  const tutorialTimerRef = useRef<number | null>(null);
  const blockedSignature = useMemo(() => getBlockedSignature(level.blocked), [level.blocked]);
  const currentBlockedSignature = getBlockedSignature(level.blocked);
  const lastBlockedSignatureRef = useRef(currentBlockedSignature);
  const allowedBlockedChangeRef = useRef<{ signature: string; reason: string } | null>(null);
  const pointerInteractionLevelRef = useRef<Level | null>(null);
  const pointerInteractionBlockedSignatureRef = useRef<string | null>(null);
  const levelIntegrity = useMemo(
    () => validateLevelIntegrity(level, { requireFullCoverage: gamePhase === "main" }),
    [gamePhase, level],
  );
  const renderableBlockedCells = useMemo(
    () => level.blocked.filter((cell) => cellWithinBounds(cell, level.width, level.height)),
    [level.blocked, level.height, level.width],
  );

  useEffect(() => {
    if (result || gameOver) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [gameOver, result, startedAt]);

  useEffect(
    () => () => {
      if (failureTimerRef.current !== null) {
        window.clearTimeout(failureTimerRef.current);
      }
      if (tutorialTimerRef.current !== null) {
        window.clearTimeout(tutorialTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const previousSignature = lastBlockedSignatureRef.current;
    const allowedChange = allowedBlockedChangeRef.current;

    if (import.meta.env.DEV && blockedSignature !== currentBlockedSignature) {
      console.error("Blocked cells were mutated in place.", {
        memoizedSignature: blockedSignature,
        currentSignature: currentBlockedSignature,
      });
    }

    if (
      previousSignature !== currentBlockedSignature &&
      import.meta.env.DEV &&
      allowedChange?.signature !== currentBlockedSignature
    ) {
      console.error("Blocked cells changed outside a level transition.", {
        previousSignature,
        nextSignature: currentBlockedSignature,
        allowedChange,
      });
    }

    allowedBlockedChangeRef.current = null;
    lastBlockedSignatureRef.current = currentBlockedSignature;
  }, [blockedSignature, currentBlockedSignature, level]);

  useEffect(() => {
    if (gamePhase !== "main" || levelIntegrity.ok) {
      return;
    }

    if (import.meta.env.DEV) {
      console.error("Invalid Stroika Veka level regenerated.", levelIntegrity);
    }

    startLevel(levelNumber, difficulty, { text: "Генплан пересобран", tone: "warning" }, true);
  }, [difficulty, gamePhase, levelIntegrity, levelNumber]);

  useEffect(() => {
    const viewport = boardViewportRef.current;

    if (!viewport || typeof window === "undefined" || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    let animationFrameId = 0;
    const mobileQuery = window.matchMedia("(max-width: 720px)");

    const updateBoardMetrics = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        if (!mobileQuery.matches) {
          setBoardMetrics(null);
          return;
        }

        const bounds = viewport.getBoundingClientRect();

        if (bounds.width <= 0 || bounds.height <= 0) {
          return;
        }

        const gap = level.width >= 7 ? 3 : 4;
        const padding = 4;
        const availableWidth = bounds.width - padding * 2 - gap * (level.width - 1);
        const availableHeight = bounds.height - padding * 2 - gap * (level.height - 1);
        const rawCellSize = Math.floor(Math.min(availableWidth / level.width, availableHeight / level.height));
        const cellSize = clamp(rawCellSize, 28, 76);
        const width = cellSize * level.width + gap * (level.width - 1) + padding * 2;
        const height = cellSize * level.height + gap * (level.height - 1) + padding * 2;

        setBoardMetrics((current) => {
          if (
            current?.cellSize === cellSize &&
            current.gap === gap &&
            current.padding === padding &&
            current.width === width &&
            current.height === height
          ) {
            return current;
          }

          return { cellSize, gap, padding, width, height };
        });
      });
    };

    const resizeObserver = new ResizeObserver(updateBoardMetrics);
    resizeObserver.observe(viewport);
    mobileQuery.addEventListener("change", updateBoardMetrics);
    window.addEventListener("orientationchange", updateBoardMetrics);
    window.addEventListener("resize", updateBoardMetrics);
    updateBoardMetrics();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      mobileQuery.removeEventListener("change", updateBoardMetrics);
      window.removeEventListener("orientationchange", updateBoardMetrics);
      window.removeEventListener("resize", updateBoardMetrics);
    };
  }, [level.height, level.width]);

  const blockedCells = useMemo(() => new Set(level.blocked.map(cellKey)), [level.blocked]);
  const placedPlanIds = useMemo(() => new Set(placements.map((building) => building.planId)), [placements]);
  const hintByCell = useMemo(() => {
    const hints = new Map<string, PlanItem>();

    level.plan.forEach((item) => {
      if (!placedPlanIds.has(item.id)) {
        hints.set(cellKey(item.hint), item);
      }
    });

    return hints;
  }, [level.plan, placedPlanIds]);

  const occupiedCellCount = useMemo(() => {
    return getOccupiedCells(placements).size;
  }, [placements]);

  const builtCount = placedPlanIds.size;
  const requiredCellCount =
    gamePhase === "tutorial" ? level.plan.reduce((sum, item) => sum + item.area, 0) : getAccessibleCellCount(level);
  const readiness = Math.min(100, Math.round((occupiedCellCount / Math.max(1, requiredCellCount)) * 100));
  const threatTone = getThreatTone(longBuilds);
  const currentTutorial = gamePhase === "tutorial" ? TUTORIAL_STEPS[tutorialStepIndex] : null;
  const levelLabel = gamePhase === "tutorial" ? `${tutorialStepIndex + 1}/${TUTORIAL_STEPS.length}` : String(levelNumber);

  function setLevelWithAllowedBlockedChange(nextLevel: Level, reason: string) {
    allowedBlockedChangeRef.current = {
      signature: getBlockedSignature(nextLevel.blocked),
      reason,
    };
    setLevel(nextLevel);
  }

  function assertBlockedSignatureStable(stage: string) {
    if (!import.meta.env.DEV) {
      return;
    }

    const pointerStartLevel = pointerInteractionLevelRef.current ?? level;
    const pointerStartSignature = pointerInteractionBlockedSignatureRef.current ?? lastBlockedSignatureRef.current;
    const latestSignature = getBlockedSignature(level.blocked);

    if (
      pointerStartSignature !== latestSignature ||
      !assertBlockedStableBeforeAfterAction(pointerStartLevel, level)
    ) {
      console.error("Blocked cells changed during pointer interaction.", {
        stage,
        previousSignature: pointerStartSignature,
        currentSignature: latestSignature,
      });
    }
  }

  function analyzeSelection(activeSelection: Selection): SelectionAnalysis {
    const rect = normalizeSelectionForLevel(activeSelection, level);
    const area = rectArea(rect);

    if (activeSelection.mode === "demolish") {
      const target = placements.find((building) => building.id === activeSelection.targetBuildingId);
      const overlappedIds = new Set(target ? [target.id] : []);

      return {
        mode: activeSelection.mode,
        rect,
        area,
        hasBlockedCell: false,
        availablePlan: undefined,
        overlappedIds,
        targetBuildingId: target?.id,
        tone: "danger",
        marker: "СНОС",
        label: "Снести корпус",
      };
    }

    const overlapped = getBuildingsIntersectingRect(placements, rect);
    const overlappedIds = new Set(overlapped.map((building) => building.id));
    const hasBlockedCell = rectIncludesBlockedCell(rect, level.blocked);
    const availablePlan = hasBlockedCell ? undefined : findAvailablePlan(level, placements, overlappedIds, area);
    const tone = hasBlockedCell ? "danger" : availablePlan ? (overlapped.length > 0 ? "warning" : "success") : "warning";
    const marker = hasBlockedCell ? "!" : romanize(area);
    const label = hasBlockedCell
      ? "Нельзя через пустырь"
      : !availablePlan
        ? "Не по плану"
        : overlapped.length > 0
          ? "Под снос"
          : `Фундамент: ${romanize(area)}`;

    return {
      mode: activeSelection.mode,
      rect,
      area,
      hasBlockedCell,
      availablePlan,
      overlappedIds,
      tone,
      marker,
      label,
    };
  }

  const liveSelection = useMemo(() => (selection ? analyzeSelection(selection) : null), [level, placements, selection]);

  function showFailedSelection(rect: Rect, tone: "warning" | "danger") {
    setFailedSelection({ rect, tone });

    if (failureTimerRef.current !== null) {
      window.clearTimeout(failureTimerRef.current);
    }

    failureTimerRef.current = window.setTimeout(() => {
      setFailedSelection(null);
      failureTimerRef.current = null;
    }, 520);
  }

  function startTutorialStep(nextStepIndex: number, message: Feedback = { text: "Учебный приказ выдан", tone: "neutral" }) {
    const safeStepIndex = clamp(nextStepIndex, 0, TUTORIAL_STEPS.length - 1);
    const nextLevel = TUTORIAL_STEPS[safeStepIndex].level;

    setGamePhase("tutorial");
    setTutorialStepIndex(safeStepIndex);
    setLevelWithAllowedBlockedChange(nextLevel, "startTutorialStep");
    setLevelNumber(1);
    setDifficulty(1);
    setPlacements([]);
    setSelection(null);
    setFailedSelection(null);
    setErrors(0);
    setStartedAt(Date.now());
    setElapsed(0);
    setResult(null);
    setGameOver(false);
    setFeedback(message);
  }

  function startLevel(nextLevelNumber: number, nextDifficulty: number, message = FEEDBACK_IDLE, forceGenerated = false) {
    const nextLevel = generateLevel(nextLevelNumber, nextDifficulty, forceGenerated);

    setGamePhase("main");
    setLevelNumber(nextLevelNumber);
    setDifficulty(nextDifficulty);
    setLevelWithAllowedBlockedChange(nextLevel, "startLevel");
    setPlacements([]);
    setSelection(null);
    setFailedSelection(null);
    setErrors(0);
    setStartedAt(Date.now());
    setElapsed(0);
    setResult(null);
    setGameOver(false);
    setFeedback(message);
  }

  function resetSession() {
    setLongBuilds(0);
    startTutorialStep(0, { text: "Новая пятилетка утверждена", tone: "neutral" });
  }

  function startMainAfterTutorial(message: Feedback = { text: "Генплан открыт", tone: "neutral" }) {
    startLevel(1, 1, message);
  }

  function handleSkipTutorial() {
    startMainAfterTutorial({ text: "Обучение закрыто. Генплан открыт", tone: "neutral" });
  }

  function isTutorialStepComplete(nextPlacements: PlacedBuilding[]) {
    const nextPlacedPlanIds = new Set(nextPlacements.map((building) => building.planId));

    return level.plan.every((item) => nextPlacedPlanIds.has(item.id));
  }

  function scheduleTutorialAdvance() {
    if (tutorialTimerRef.current !== null) {
      window.clearTimeout(tutorialTimerRef.current);
    }

    tutorialTimerRef.current = window.setTimeout(() => {
      tutorialTimerRef.current = null;

      if (tutorialStepIndex + 1 < TUTORIAL_STEPS.length) {
        startTutorialStep(tutorialStepIndex + 1, { text: "План принят. Следующий приказ", tone: "success" });
        return;
      }

      startMainAfterTutorial({ text: "Учебка завершена. Генплан открыт", tone: "success" });
    }, 620);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    assertBlockedSignatureStable("pointerdown:start");

    if (result || gameOver || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    const cell = getCellFromPointer(event, level, boardRef.current);

    if (!cell) {
      return;
    }

    event.preventDefault();
    boardRef.current?.setPointerCapture(event.pointerId);
    pointerInteractionLevelRef.current = level;
    pointerInteractionBlockedSignatureRef.current = getBlockedSignature(level.blocked);
    const isBlockedCell = blockedCells.has(cellKey(cell));
    const targetBuilding = isBlockedCell ? undefined : findBuildingAtCell(placements, cell);

    setSelection({
      pointerId: event.pointerId,
      start: cell,
      end: cell,
      mode: targetBuilding ? "demolish" : "build",
      targetBuildingId: targetBuilding?.id,
    });
    setFailedSelection(null);
    assertBlockedSignatureStable("pointerdown:end");
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    assertBlockedSignatureStable("pointermove:start");

    if (!selection || selection.pointerId !== event.pointerId) {
      return;
    }

    const cell = getCellFromPointer(event, level, boardRef.current, true);

    if (!cell) {
      return;
    }

    event.preventDefault();
    setSelection((current) => (current && current.pointerId === event.pointerId ? { ...current, end: cell } : current));
    assertBlockedSignatureStable("pointermove:end");
  }

  function finishSelection(finalSelection = liveSelection) {
    assertBlockedSignatureStable("finishSelection:start");

    if (!finalSelection) {
      setSelection(null);
      return;
    }

    const { rect, area, hasBlockedCell, availablePlan, overlappedIds } = finalSelection;

    if (finalSelection.mode === "demolish") {
      const targetBuildingId = finalSelection.targetBuildingId;
      const target = placements.find((building) => building.id === targetBuildingId);

      if (!target) {
        setSelection(null);
        return;
      }

      setPlacements((current) => current.filter((building) => building.id !== target.id));
      setResult(null);
      setSelection(null);
      setFeedback({ text: `Корпус ${romanize(target.area)} списан`, tone: "warning" });
      return;
    }

    if (hasBlockedCell) {
      setErrors((current) => current + 1);
      setFeedback({ text: "Нельзя строить на пустыре", tone: "danger" });
      showFailedSelection(rect, "danger");
      setSelection(null);
      return;
    }

    if (!availablePlan) {
      setErrors((current) => current + 1);
      setFeedback({ text: "Площадь не по плану", tone: "warning" });
      showFailedSelection(rect, "warning");
      setSelection(null);
      return;
    }

    const nextPlacements = [
      ...placements.filter((building) => !overlappedIds.has(building.id)),
      {
        ...rect,
        id: `building-${availablePlan.id}-${Date.now()}`,
        planId: availablePlan.id,
        area,
        visualType: getBuildingVisualType(rect),
        roofVariant: getRoofVariant(rect, availablePlan.id),
        surfaceVariant: getSurfaceVariant(rect, availablePlan.id),
      },
    ];
    const removedCount = overlappedIds.size;
    const finalSeconds = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
    const buildFeedback: Feedback = {
      text: removedCount > 0 ? `Под снос. Корпус ${romanize(area)} сдан` : `Корпус ${romanize(area)} сдан`,
      tone: removedCount > 0 ? "warning" : "success",
    };

    setPlacements(nextPlacements);
    setSelection(null);
    setFeedback(buildFeedback);

    if (gamePhase === "tutorial") {
      if (isTutorialStepComplete(nextPlacements)) {
        setFeedback({ text: "Фундамент принят", tone: "success" });
        scheduleTutorialAdvance();
      }

      return;
    }

    if (isLevelComplete(level, nextPlacements)) {
      const adaptation = adaptDifficulty(difficulty, errors, finalSeconds);

      setElapsed(finalSeconds);
      setDifficulty(adaptation.nextDifficulty);
      setResult({
        seconds: finalSeconds,
        errors,
        previousDifficulty: difficulty,
        nextDifficulty: adaptation.nextDifficulty,
        verdict: adaptation.verdict,
      });
      setFeedback({ text: "Пятилетка выполнена", tone: "success" });
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    assertBlockedSignatureStable("pointerup:start");

    if (!selection || selection.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();

    const cell = getCellFromPointer(event, level, boardRef.current, true);
    const finalSelection = cell ? { ...selection, end: cell } : selection;
    const finalAnalysis = analyzeSelection(finalSelection);

    if (boardRef.current?.hasPointerCapture(event.pointerId)) {
      boardRef.current.releasePointerCapture(event.pointerId);
    }

    finishSelection(finalAnalysis);
    assertBlockedSignatureStable("pointerup:end");
    pointerInteractionLevelRef.current = null;
    pointerInteractionBlockedSignatureRef.current = null;
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (boardRef.current?.hasPointerCapture(event.pointerId)) {
      boardRef.current.releasePointerCapture(event.pointerId);
    }

    setSelection(null);
    pointerInteractionLevelRef.current = null;
    pointerInteractionBlockedSignatureRef.current = null;
  }

  function handleLostPointerCapture(event: PointerEvent<HTMLDivElement>) {
    setSelection((current) => (current?.pointerId === event.pointerId ? null : current));
    pointerInteractionLevelRef.current = null;
    pointerInteractionBlockedSignatureRef.current = null;
  }

  function handleResetLevel() {
    if (gamePhase === "tutorial") {
      startTutorialStep(tutorialStepIndex, { text: "Учебный приказ повторен", tone: "neutral" });
      return;
    }

    startLevel(levelNumber, difficulty, { text: "Генплан возвращен на стол", tone: "neutral" });
  }

  function handleLongBuild() {
    if (gamePhase === "tutorial") {
      handleSkipTutorial();
      return;
    }

    const nextLongBuilds = longBuilds + 1;

    if (nextLongBuilds >= MAX_LONG_BUILDS) {
      setLongBuilds(nextLongBuilds);
      setGameOver(true);
      setResult(null);
      setSelection(null);
      setFeedback({ text: "Пятилетка провалена", tone: "danger" });
      return;
    }

    const easierDifficulty = clamp(difficulty - 1, 1, MAX_DIFFICULTY);
    setLongBuilds(nextLongBuilds);
    startLevel(levelNumber, easierDifficulty, { text: "Долгострой списан. Выдан план проще", tone: "warning" }, true);
  }

  function handleNextLevel() {
    const nextDifficulty = result?.nextDifficulty ?? difficulty;
    startLevel(levelNumber + 1, nextDifficulty, { text: "Следующий генплан выдан", tone: "neutral" });
  }

  const boardStyle = {
    "--stroika-cols": level.width,
    "--stroika-rows": level.height,
    "--stroika-board-aspect": `${level.width} / ${level.height}`,
    ...(boardMetrics
      ? {
          "--stroika-cell-size": `${boardMetrics.cellSize}px`,
          "--stroika-board-gap": `${boardMetrics.gap}px`,
          "--stroika-board-padding": `${boardMetrics.padding}px`,
          "--stroika-board-width": `${boardMetrics.width}px`,
          "--stroika-board-height": `${boardMetrics.height}px`,
        }
      : {}),
    aspectRatio: `${level.width} / ${level.height}`,
  } as CSSProperties;
  const progressStyle = {
    "--stroika-progress": `${readiness}%`,
  } as CSSProperties;
  const boardBlueprint = getBoardBlueprintVariant(levelNumber, difficulty, level.blocked.length);
  const tutorialTargetPlan = currentTutorial
    ? (level.plan.find((item) => !placedPlanIds.has(item.id) && item.area === currentTutorial.targetArea) ??
      level.plan.find((item) => !placedPlanIds.has(item.id)) ??
      null)
    : null;
  const tutorialGhost = currentTutorial && placements.length === 0 ? currentTutorial.ghost : null;

  return (
    <section className="stroika-game" aria-label="Игровой прототип Стройка века">
      <div className="stroika-game__header">
        <span className="stroika-game__ribbon" aria-hidden="true" />
        <div className="stroika-game__header-copy">
          <p className="stroika-game__eyebrow">Проектный институт будущего</p>
          <h3>Стройка века</h3>
          <p>Разметь участки, заложи фундамент и построй город будущего.</p>
        </div>
        <div className="stroika-game__header-stamps">
          <span className="stroika-game__approval">ГЕНПЛАН УТВЕРЖДЕН</span>
          <div className={`stroika-stamp stroika-stamp--${feedback.tone}`} role="status" aria-live="polite">
            {feedback.text}
          </div>
        </div>
      </div>

      <div className="stroika-mobile-status" aria-label="Короткая сводка уровня">
        <span>
          {gamePhase === "tutorial" ? "Уч." : "Ур."} <strong>{levelLabel}</strong>
        </span>
        <span>
          План <strong>{builtCount}/{level.plan.length}</strong>
        </span>
        <span className={`stroika-mobile-threat stroika-mobile-threat--${threatTone}`}>
          Долг.{" "}
          <strong>
            {Array.from({ length: MAX_LONG_BUILDS })
              .map((_, index) => (index < longBuilds ? "●" : "○"))
              .join("")}
          </strong>
        </span>
        <span>
          {formatTime(elapsed)} · {errors} ош.
        </span>
      </div>

      <div className="stroika-game__layout">
        <div className="stroika-board-shell">
          <div className="stroika-board-meta" aria-hidden="true">
            <span>ГЕНПЛАН</span>
            <span>ГОРОД ГОТОВ НА {readiness}%</span>
          </div>
          <div className="stroika-progress" style={progressStyle} aria-label={`Выполнение генплана ${readiness}%`}>
            <div className="stroika-progress__top">
              <span>Выполнение генплана</span>
              <strong>{readiness}%</strong>
            </div>
            <div className="stroika-progress__track">
              <span />
            </div>
            <div className="stroika-progress__marks" aria-hidden="true">
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
          {currentTutorial ? (
            <div className="stroika-tutorial" role="note">
              <div>
                <strong>{currentTutorial.title}</strong>
                <span>{currentTutorial.description}</span>
              </div>
              <div className="stroika-tutorial__dots" aria-hidden="true">
                {TUTORIAL_STEPS.map((_, index) => (
                  <span
                    key={index}
                    className={index === tutorialStepIndex ? "is-active" : index < tutorialStepIndex ? "is-done" : ""}
                  />
                ))}
              </div>
            </div>
          ) : null}
          <div ref={boardViewportRef} className="stroika-board-viewport">
            <div
              ref={boardRef}
              className={`stroika-board stroika-board--blueprint-${boardBlueprint}`}
              style={boardStyle}
              role="grid"
              aria-label={`Генплан ${level.width} на ${level.height}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onLostPointerCapture={handleLostPointerCapture}
            >
              {Array.from({ length: level.height }).flatMap((_, y) =>
                Array.from({ length: level.width }).map((__, x) => {
                  const key = cellKey({ x, y });
                  const hint = hintByCell.get(key);
                  const isBlocked = blockedCells.has(key);

                  return (
                    <div
                      key={key}
                      className={`stroika-cell${isBlocked ? " stroika-cell--blocked" : ""}`}
                      style={{
                        gridColumn: `${x + 1} / span 1`,
                        gridRow: `${y + 1} / span 1`,
                      }}
                      role="gridcell"
                      aria-label={
                        isBlocked ? "Пустырь" : hint ? `Подсказка ${romanize(hint.area)}` : "Свободная клетка"
                      }
                    >
                      {hint && !isBlocked ? (
                        <span className="stroika-cell__hint" aria-hidden="true">
                          <strong>{romanize(hint.area)}</strong>
                          <small>проект</small>
                        </span>
                      ) : null}
                    </div>
                  );
                }),
              )}

              {tutorialGhost && currentTutorial ? (
                <div
                  className="stroika-tutorial-ghost"
                  style={{
                    gridColumn: `${tutorialGhost.x + 1} / span ${tutorialGhost.width}`,
                    gridRow: `${tutorialGhost.y + 1} / span ${tutorialGhost.height}`,
                  }}
                  aria-hidden="true"
                >
                  <span className="stroika-tutorial-ghost__label">{romanize(currentTutorial.targetArea)}</span>
                  <span className="stroika-tutorial-ghost__start">Зажми</span>
                  <span className="stroika-tutorial-ghost__end">Протяни</span>
                </div>
              ) : null}

              {placements.map((building) => {
                const isMarkedForDemolition =
                  liveSelection?.mode === "demolish"
                    ? liveSelection.targetBuildingId === building.id
                    : Boolean(liveSelection?.availablePlan) &&
                      !liveSelection?.hasBlockedCell &&
                      (liveSelection?.overlappedIds.has(building.id) ?? false);
                const detailCount = Math.min(10, Math.max(3, Math.ceil(building.area / 2)));

                return (
                  <div
                    key={building.id}
                    className={`stroika-building stroika-building--${building.visualType} stroika-building--roof-${building.roofVariant} stroika-building--surface-${building.surfaceVariant}${
                      isMarkedForDemolition ? " stroika-building--demolition" : ""
                    }`}
                    style={{
                      gridColumn: `${building.x + 1} / span ${building.width}`,
                      gridRow: `${building.y + 1} / span ${building.height}`,
                    }}
                  >
                    <span className="stroika-building__slab" aria-hidden="true" />
                    <span className="stroika-building__label">{romanize(building.area)}</span>
                    <span className="stroika-building__flag" aria-hidden="true" />
                    <span className="stroika-building__roof" aria-hidden="true">
                      <span className="stroika-building__core" />
                      <span className="stroika-building__antenna" />
                      <span className="stroika-building__dish" />
                      <span className="stroika-building__pipes" />
                      <span className="stroika-building__roof-grid">
                        {Array.from({ length: detailCount }).map((_, index) => (
                          <span key={index} />
                        ))}
                      </span>
                    </span>
                    <span className="stroika-building__edge-lights" aria-hidden="true">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span key={index} />
                      ))}
                    </span>
                  </div>
                );
              })}

              {liveSelection ? (
                <div
                  className={`stroika-selection stroika-selection--${liveSelection.tone}${
                    liveSelection.hasBlockedCell ? " stroika-selection--blocked" : ""
                  }${liveSelection.mode === "demolish" ? " stroika-selection--demolish" : ""}`}
                  style={{
                    gridColumn: `${liveSelection.rect.x + 1} / span ${liveSelection.rect.width}`,
                    gridRow: `${liveSelection.rect.y + 1} / span ${liveSelection.rect.height}`,
                  }}
                >
                  <span>
                    <strong>{liveSelection.marker}</strong>
                    <small>{liveSelection.label}</small>
                  </span>
                </div>
              ) : null}

              {failedSelection ? (
                <div
                  className={`stroika-failed-selection stroika-failed-selection--${failedSelection.tone}`}
                  style={{
                    gridColumn: `${failedSelection.rect.x + 1} / span ${failedSelection.rect.width}`,
                    gridRow: `${failedSelection.rect.y + 1} / span ${failedSelection.rect.height}`,
                  }}
                />
              ) : null}

              {renderableBlockedCells.map((cell) => (
                <div
                  key={`blocked-${cellKey(cell)}`}
                  className="stroika-blocked-overlay"
                  style={{
                    gridColumn: `${cell.x + 1} / span 1`,
                    gridRow: `${cell.y + 1} / span 1`,
                  }}
                  aria-hidden="true"
                >
                  <span>ПУСТЫРЬ</span>
                </div>
              ))}
            </div>
          </div>

          {result ? (
            <div className="stroika-end-overlay" role="status" aria-live="polite">
              <div className="stroika-end-card">
                <CheckCircle2 className="stroika-result__icon" aria-hidden="true" />
                <strong>Пятилетка выполнена</strong>
                <span>
                  {formatTime(result.seconds)}, ошибок: {result.errors}. {getVerdictText(result)}. Сложность{" "}
                  {result.previousDifficulty}
                  {" -> "}
                  {result.nextDifficulty}.
                </span>
                <button type="button" onClick={handleNextLevel}>
                  Следующий генплан
                </button>
              </div>
            </div>
          ) : null}

          {gameOver ? (
            <div className="stroika-end-overlay stroika-end-overlay--danger" role="status" aria-live="assertive">
              <div className="stroika-end-card">
                <AlertTriangle className="stroika-result__icon" aria-hidden="true" />
                <strong>Пятилетка провалена</strong>
                <span>Три долгостроя за сессию. Комиссия требует новый старт.</span>
                <button type="button" onClick={resetSession}>
                  Начать заново
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="stroika-panel" aria-label="Панель плана">
          <div className="stroika-stats">
            <div>
              <span>{gamePhase === "tutorial" ? "Обучение" : "Уровень"}</span>
              <strong>{levelLabel}</strong>
            </div>
            <div>
              <span>Сложность</span>
              <strong>{difficulty}</strong>
            </div>
            <div>
              <span>Ошибки</span>
              <strong>{errors}</strong>
            </div>
            <div>
              <span>Время</span>
              <strong>{formatTime(elapsed)}</strong>
            </div>
            <div className="stroika-stats__wide">
              <span>Прогресс</span>
              <strong>{builtCount}/{level.plan.length}</strong>
              <small>Город готов на {readiness}%</small>
            </div>
          </div>

          <div className={`stroika-threat stroika-threat--${threatTone}`}>
            <div className="stroika-threat__top">
              <span>Риск провала пятилетки</span>
              <strong>{Math.min(longBuilds, MAX_LONG_BUILDS)}/{MAX_LONG_BUILDS}</strong>
            </div>
            <div className="stroika-threat__segments" aria-hidden="true">
              {Array.from({ length: MAX_LONG_BUILDS }).map((_, index) => (
                <span key={index} className={index < longBuilds ? "is-filled" : ""} />
              ))}
            </div>
            <small>{longBuilds >= 2 ? "Комиссия близко" : "До провала пятилетки"}</small>
          </div>

          <div className="stroika-plan">
            <div className="stroika-panel__title">
              <span>План пятилетки</span>
              <small>План: {builtCount}/{level.plan.length} корпусов</small>
            </div>
            <div className="stroika-plan__list">
              {level.plan.map((item) => {
                const isBuilt = placedPlanIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={`stroika-plan-card${isBuilt ? " stroika-plan-card--built" : ""}${
                      tutorialTargetPlan?.id === item.id ? " stroika-plan-card--tutorial" : ""
                    }`}
                  >
                    <strong>{romanize(item.area)}</strong>
                    <span>{getPlanCardLabel(item)}</span>
                    <small>{getPlanStatus(item, placedPlanIds)}</small>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="stroika-actions">
            <button type="button" onClick={handleResetLevel} disabled={Boolean(result || gameOver)}>
              <RotateCcw className="stroika-button-icon" aria-hidden="true" />
              Сбросить
            </button>
            <button
              type="button"
              className={gamePhase === "tutorial" ? "stroika-actions__skip" : "stroika-actions__danger"}
              onClick={handleLongBuild}
              disabled={Boolean(result || gameOver)}
            >
              <TimerReset className="stroika-button-icon" aria-hidden="true" />
              {gamePhase === "tutorial" ? "Пропустить" : "Долгострой"}
            </button>
          </div>

          <div className={`stroika-mobile-stamp stroika-mobile-stamp--${feedback.tone}`} role="status" aria-live="polite">
            {feedback.text}
          </div>
        </aside>
      </div>
    </section>
  );
}
