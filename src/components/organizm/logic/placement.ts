import { BOARD_COLS, BOARD_ROWS } from "../balance";
import { getPatchConfig } from "../patchCatalog";
import type { BoardPatches, BoardPosition, CellCoord, PatchInstance, PlacementValidation, PlacedPatch } from "../types";

export function cellKey(cell: CellCoord) {
  return `${cell.x}:${cell.y}`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getBoardEntries(boardPatches: BoardPatches) {
  return Object.values(boardPatches).sort((a, b) => a.uid.localeCompare(b.uid));
}

export function getAbsolutePatchCells(item: PatchInstance, position: BoardPosition) {
  return getPatchConfig(item).shape.map((cell) => ({
    x: position.x + cell.x,
    y: position.y + cell.y,
  }));
}

export function getPlacementValidation(
  item: PatchInstance,
  position: BoardPosition | null,
  boardPatches: BoardPatches,
  ignoreUid?: string,
): PlacementValidation {
  if (!position) {
    return { valid: false, reason: "Перетащи патч в матрицу адаптации." };
  }

  const cells = getAbsolutePatchCells(item, position);
  const isInside = cells.every((cell) => cell.x >= 0 && cell.x < BOARD_COLS && cell.y >= 0 && cell.y < BOARD_ROWS);

  if (!isInside) {
    return { valid: false, reason: "Форма выходит за границы поля 6 x 5." };
  }

  const occupiedCells = new Map<string, string>();

  getBoardEntries(boardPatches).forEach((placedPatch) => {
    if (placedPatch.uid === ignoreUid) {
      return;
    }

    getAbsolutePatchCells(placedPatch, placedPatch.position).forEach((cell) => {
      occupiedCells.set(cellKey(cell), placedPatch.uid);
    });
  });

  const overlaps = cells.some((cell) => occupiedCells.has(cellKey(cell)));

  if (overlaps) {
    return { valid: false, reason: "Ячейка занята. Доступно слияние, если патчи совпадают." };
  }

  return { valid: true, reason: "Патч можно установить." };
}

export function getOverlappingBoardPatch(
  item: PatchInstance,
  position: BoardPosition | null,
  boardPatches: BoardPatches,
  ignoreUid?: string,
): PlacedPatch | undefined {
  if (!position) {
    return undefined;
  }

  const draggedCells = new Set(getAbsolutePatchCells(item, position).map(cellKey));

  return getBoardEntries(boardPatches).find((patch) => {
    if (patch.uid === ignoreUid) {
      return false;
    }

    return getAbsolutePatchCells(patch, patch.position).some((cell) => draggedCells.has(cellKey(cell)));
  });
}
