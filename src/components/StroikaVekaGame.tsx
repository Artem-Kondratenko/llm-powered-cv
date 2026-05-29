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
};

type Selection = {
  pointerId: number;
  start: CellCoord;
  end: CellCoord;
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

type SelectionAnalysis = {
  rect: Rect;
  area: number;
  hasBlockedCell: boolean;
  availablePlan: PlanItem | undefined;
  overlappedIds: Set<string>;
  tone: "success" | "warning" | "danger";
  marker: string;
  label: string;
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
      { x: 2, y: 0, width: 2, height: 2 },
      { x: 4, y: 0, width: 2, height: 3 },
      { x: 0, y: 2, width: 2, height: 3 },
      { x: 2, y: 2, width: 2, height: 3 },
      { x: 4, y: 3, width: 2, height: 2 },
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
      { x: 0, y: 0, width: 2, height: 3 },
      { x: 2, y: 0, width: 3, height: 2 },
      { x: 5, y: 0, width: 2, height: 3 },
      { x: 2, y: 2, width: 3, height: 2 },
      { x: 0, y: 3, width: 2, height: 3 },
      { x: 2, y: 4, width: 3, height: 2 },
      { x: 5, y: 3, width: 2, height: 3 },
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

function rectsIntersect(a: Rect, b: Rect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function rectContainsCell(rect: Rect, cell: CellCoord) {
  return cell.x >= rect.x && cell.x < rect.x + rect.width && cell.y >= rect.y && cell.y < rect.y + rect.height;
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

function getHint(rect: Rect): CellCoord {
  return {
    x: rect.x,
    y: rect.y,
  };
}

function createLevelFromRects(width: number, height: number, rects: Rect[], blocked: CellCoord[] = []): Level {
  const plan = shuffle(
    rects.map((rect, index) => ({
      id: `plan-${index + 1}-${rect.x}-${rect.y}`,
      area: rectArea(rect),
      hint: getHint(rect),
    })),
  );

  return {
    width,
    height,
    plan,
    blocked,
  };
}

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

function generateLevel(levelNumber: number, difficulty: number, forceGenerated = false): Level {
  if (!forceGenerated && levelNumber <= PRESET_LEVELS.length) {
    const preset = PRESET_LEVELS[levelNumber - 1];

    return createLevelFromRects(preset.width, preset.height, preset.rects, preset.blocked);
  }

  const shape = getDifficultyShape(difficulty);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const base = createBaseRects(shape.width, shape.height, shape.blockedCount);
    const rects = splitRects(base.rects, shape.targetRects, shape.maxArea);
    const validRects = rects.filter((rect) => rectArea(rect) >= 2 && rectArea(rect) <= shape.maxArea);
    const accessibleArea = shape.width * shape.height - base.blocked.length;
    const generatedArea = validRects.reduce((sum, rect) => sum + rectArea(rect), 0);

    if (validRects.length >= 4 && validRects.length <= 8 && generatedArea === accessibleArea) {
      return createLevelFromRects(shape.width, shape.height, validRects, base.blocked);
    }
  }

  const fallback = PRESET_LEVELS[Math.min(PRESET_LEVELS.length - 1, Math.max(0, difficulty - 1))];

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

function getAccessibleCellCount(level: Level) {
  return level.width * level.height - level.blocked.length;
}

function isLevelComplete(level: Level, placements: PlacedBuilding[]) {
  const placedPlanIds = new Set(placements.map((building) => building.planId));

  if (placedPlanIds.size !== level.plan.length) {
    return false;
  }

  const occupiedCells = new Set<string>();

  placements.forEach((building) => {
    for (let y = building.y; y < building.y + building.height; y += 1) {
      for (let x = building.x; x < building.x + building.width; x += 1) {
        occupiedCells.add(cellKey({ x, y }));
      }
    }
  });

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

export function StroikaVekaGame() {
  const [levelNumber, setLevelNumber] = useState(1);
  const [difficulty, setDifficulty] = useState(1);
  const [level, setLevel] = useState(() => generateLevel(1, 1));
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
  const boardRef = useRef<HTMLDivElement | null>(null);
  const failureTimerRef = useRef<number | null>(null);

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
    },
    [],
  );

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
    const occupiedCells = new Set<string>();

    placements.forEach((building) => {
      for (let y = building.y; y < building.y + building.height; y += 1) {
        for (let x = building.x; x < building.x + building.width; x += 1) {
          occupiedCells.add(cellKey({ x, y }));
        }
      }
    });

    return occupiedCells.size;
  }, [placements]);

  const builtCount = placedPlanIds.size;
  const readiness = Math.round((occupiedCellCount / getAccessibleCellCount(level)) * 100);
  const threatTone = getThreatTone(longBuilds);

  function analyzeSelection(activeSelection: Selection): SelectionAnalysis {
    const rect = normalizeSelection(activeSelection.start, activeSelection.end);
    const overlapped = placements.filter((building) => rectsIntersect(rect, building));
    const overlappedIds = new Set(overlapped.map((building) => building.id));
    const hasBlockedCell = level.blocked.some((cell) => rectContainsCell(rect, cell));
    const area = rectArea(rect);
    const availablePlan = findAvailablePlan(level, placements, overlappedIds, area);
    const tone = hasBlockedCell ? "danger" : availablePlan ? (overlapped.length > 0 ? "warning" : "success") : "warning";
    const marker = hasBlockedCell ? "ПУСТЫРЬ" : romanize(area);
    const label = hasBlockedCell
      ? "Стройка запрещена"
      : !availablePlan
        ? "Не по плану"
        : overlapped.length > 0
          ? "Под снос"
          : `Фундамент: ${romanize(area)}`;

    return {
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

  function startLevel(nextLevelNumber: number, nextDifficulty: number, message = FEEDBACK_IDLE, forceGenerated = false) {
    setLevelNumber(nextLevelNumber);
    setDifficulty(nextDifficulty);
    setLevel(generateLevel(nextLevelNumber, nextDifficulty, forceGenerated));
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
    startLevel(1, 1, { text: "Новая пятилетка утверждена", tone: "neutral" });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (result || gameOver || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    const cell = getCellFromPointer(event, level, boardRef.current);

    if (!cell) {
      return;
    }

    event.preventDefault();
    boardRef.current?.setPointerCapture(event.pointerId);
    setSelection({
      pointerId: event.pointerId,
      start: cell,
      end: cell,
    });
    setFailedSelection(null);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!selection || selection.pointerId !== event.pointerId) {
      return;
    }

    const cell = getCellFromPointer(event, level, boardRef.current, true);

    if (!cell) {
      return;
    }

    event.preventDefault();
    setSelection((current) => (current && current.pointerId === event.pointerId ? { ...current, end: cell } : current));
  }

  function finishSelection(finalSelection = liveSelection) {
    if (!finalSelection) {
      setSelection(null);
      return;
    }

    const { rect, area, hasBlockedCell, availablePlan, overlappedIds } = finalSelection;

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

    setPlacements(nextPlacements);
    setSelection(null);
    setFeedback({
      text: removedCount > 0 ? `Под снос. Корпус ${romanize(area)} сдан` : `Корпус ${romanize(area)} сдан`,
      tone: removedCount > 0 ? "warning" : "success",
    });

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
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (boardRef.current?.hasPointerCapture(event.pointerId)) {
      boardRef.current.releasePointerCapture(event.pointerId);
    }

    setSelection(null);
  }

  function handleLostPointerCapture(event: PointerEvent<HTMLDivElement>) {
    setSelection((current) => (current?.pointerId === event.pointerId ? null : current));
  }

  function handleResetLevel() {
    startLevel(levelNumber, difficulty, { text: "Генплан возвращен на стол", tone: "neutral" });
  }

  function handleLongBuild() {
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
    aspectRatio: `${level.width} / ${level.height}`,
  } as CSSProperties;
  const progressStyle = {
    "--stroika-progress": `${readiness}%`,
  } as CSSProperties;
  const shouldReserveTutorial = levelNumber === 1 && !result && !gameOver;
  const shouldShowTutorial = shouldReserveTutorial && placements.length === 0;
  const tutorialTargetPlan = shouldShowTutorial
    ? (level.plan.find((item) => item.area === 4 && item.hint.x === 0 && item.hint.y === 0) ??
      level.plan.find((item) => item.area === 4) ??
      level.plan[0])
    : null;

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
          Уровень <strong>{levelNumber}</strong>
        </span>
        <span>
          План <strong>{builtCount}/{level.plan.length}</strong>
        </span>
        <span className={`stroika-mobile-threat stroika-mobile-threat--${threatTone}`}>
          Долгострои <strong>{Math.min(longBuilds, MAX_LONG_BUILDS)}/{MAX_LONG_BUILDS}</strong>
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
          {shouldReserveTutorial ? (
            <div className={`stroika-tutorial${shouldShowTutorial ? "" : " stroika-tutorial--hidden"}`} role="note">
              <strong>Первый приказ</strong>
              <span>Повтори образец: зажми старт и протяни фундамент 2x2. IV = 4 клетки.</span>
            </div>
          ) : null}
          <div
            ref={boardRef}
            className="stroika-board"
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
                    role="gridcell"
                    aria-label={isBlocked ? "Пустырь" : hint ? `Подсказка ${romanize(hint.area)}` : "Свободная клетка"}
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

            {shouldShowTutorial ? (
              <div
                className="stroika-tutorial-ghost"
                style={{
                  gridColumn: "1 / span 2",
                  gridRow: "1 / span 2",
                }}
                aria-hidden="true"
              >
                <span className="stroika-tutorial-ghost__label">IV</span>
                <span className="stroika-tutorial-ghost__start">Зажми здесь</span>
                <span className="stroika-tutorial-ghost__end">Протяни сюда</span>
              </div>
            ) : null}

            {placements.map((building) => {
              const isMarkedForDemolition =
                Boolean(liveSelection?.availablePlan) &&
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

            {level.blocked.map((cell) => (
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

            {liveSelection ? (
              <div
                className={`stroika-selection stroika-selection--${liveSelection.tone}${
                  liveSelection.hasBlockedCell ? " stroika-selection--blocked" : ""
                }`}
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
              <span>Уровень</span>
              <strong>{levelNumber}</strong>
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
              className="stroika-actions__danger"
              onClick={handleLongBuild}
              disabled={Boolean(result || gameOver)}
            >
              <TimerReset className="stroika-button-icon" aria-hidden="true" />
              Долгострой
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
