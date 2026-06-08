export type GameMode = "start" | "prep" | "battle" | "level-cleared" | "defeat" | "mutations";

export type PatchBaseId =
  | "impulse-node"
  | "laser-channel"
  | "plasma-burst"
  | "shard-discharge"
  | "membrane"
  | "armor-loop"
  | "regenerator"
  | "synchronizer"
  | "quarantine"
  | "double-shot";

export type PatchLevel = 1 | 2 | 3;
export type PatchKind = "active" | "passive";
export type PatchCategory = "attack" | "defense" | "special";
export type PatchTone = "pink" | "orange" | "cyan" | "green" | "purple" | "yellow" | "blue" | "teal";
export type PatchZone = "stash" | "board";
export type AttackVisual = "impulse" | "laser" | "plasma" | "shard" | "double" | "enemy-shot" | "parasite" | "boss";
export type PatchVisualMotif =
  | "impulse"
  | "laser"
  | "plasma"
  | "shards"
  | "membrane"
  | "armor"
  | "regen"
  | "sync"
  | "quarantine"
  | "double";

export type CellCoord = {
  x: number;
  y: number;
};

export type PatchStats = {
  cooldownMs?: number;
  damage?: number;
  heal?: number;
  hits?: number;
  splashTargets?: number;
  maxHealthBonus?: number;
  damageReduction?: number;
  hastePercent?: number;
  slowPercent?: number;
  slowDurationMs?: number;
  doubleShotChance?: number;
  effect: string;
};

export type PatchConfig = {
  id: PatchBaseId;
  title: string;
  shortTitle: string;
  category: PatchCategory;
  kind: PatchKind;
  tone: PatchTone;
  motif: PatchVisualMotif;
  shape: CellCoord[];
  labelAnchor?: CellCoord;
  iconAnchor?: CellCoord;
  cooldownAnchor?: CellCoord;
  role: string;
  levels: Record<PatchLevel, PatchStats>;
};

export type PatchInstance = {
  uid: string;
  patchId: PatchBaseId;
  level: PatchLevel;
};

export type BoardPosition = {
  x: number;
  y: number;
};

export type PlacedPatch = PatchInstance & {
  position: BoardPosition;
};

export type BoardPatches = Record<string, PlacedPatch>;

export type DragState = {
  item: PatchInstance;
  pointerId: number;
  pointerType: string;
  origin: PatchZone;
  anchor: CellCoord;
  startX: number;
  startY: number;
  screenX: number;
  screenY: number;
  candidate: BoardPosition | null;
  valid: boolean;
  reason: string;
  hasMoved: boolean;
};

export type SelectedItem = {
  origin: PatchZone;
  uid: string;
};

export type EnemyTypeId =
  | "triangular-swarm"
  | "square-brute"
  | "spiked-star"
  | "worm-parasite"
  | "glitch-shard"
  | "glitch-capsule";

export type EnemyAttackKind = "melee" | "ranged" | "moving";
export type BossVariant = "capsule" | "colony" | "corona";

export type EnemyConfig = {
  id: EnemyTypeId;
  title: string;
  shortTitle: string;
  tone: PatchTone;
  attackKind: EnemyAttackKind;
  hp: number;
  speed: number;
  damage: number;
  hitRadius: number;
  size: number;
  stopDistance?: number;
  attackIntervalMs?: number;
  firstAttackDelayMs?: number;
  swerve?: number;
  boss?: boolean;
  glitchIntervalMs?: number;
  mutagens: number;
  mutagenEveryKills?: number;
};

export type WaveEnemyGroup = {
  typeId: EnemyTypeId;
  count: number;
};

export type EnemyState = {
  id: number;
  typeId: EnemyTypeId;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  hitRadius: number;
  damage: number;
  speed: number;
  lastKnownX: number;
  lastKnownY: number;
  isVisible: boolean;
  isAlive: boolean;
  nextAttackAt: number;
  nextGlitchAt?: number;
  bossVariant?: BossVariant;
  pathSeed: number;
  damageFlashUntil: number;
};

export type BattleBeam = {
  id: number;
  source: "patch" | "enemy";
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  tone: PatchTone;
  targetId?: number;
  visual: AttackVisual;
  createdAt: number;
};

export type BattleEffect = {
  id: number;
  type: "heal" | "breach" | "spawn" | "slow" | "hit" | "shatter" | "enemy-shot" | "boss-glitch" | "boss-collapse";
  x: number;
  y: number;
  tone?: PatchTone;
  visual?: AttackVisual;
  createdAt: number;
};

export type BattleFloatNumber = {
  id: number;
  x: number;
  y: number;
  value: string;
  tone: PatchTone;
  kind: "damage" | "heal" | "mutagen";
  createdAt: number;
};

export type WaveConfig = {
  waveNumber: number;
  title: string;
  groups: WaveEnemyGroup[];
  enemyCount: number;
  spawnIntervalMs: number;
  rewardCount: number;
  sectorIndex?: number;
  bossVariant?: BossVariant;
  enemyHpMultiplier?: number;
  enemyDamageMultiplier?: number;
  enemySpeedMultiplier?: number;
};

export type BattleState = {
  wave: WaveConfig;
  loadout: PlacedPatch[];
  enemies: EnemyState[];
  beams: BattleBeam[];
  effects: BattleEffect[];
  floaters: BattleFloatNumber[];
  spawnedCount: number;
  killedCount: number;
  breachedCount: number;
  lastSpawnAt: number;
  slowUntil: number;
  slowMultiplier: number;
  patchFlashUntil: Partial<Record<string, number>>;
  patchReady: Partial<Record<string, boolean>>;
  patchChargeProgress: Partial<Record<string, number>>;
  tick: number;
};

export type PlacementValidation = {
  valid: boolean;
  reason: string;
};

export type PassiveStats = {
  maxHealthBonus: number;
  damageReduction: number;
  hastePercent: number;
  doubleShotChance: number;
};

export type MutationCombatStats = {
  maxHealthPercent: number;
  damagePercent: number;
  critChancePercent: number;
  critDamagePercent: number;
  armorBonus: number;
  doubleShotChancePercent: number;
  hastePercent: number;
  unlockedCells: number;
};

export type PatchCooldowns = Partial<Record<string, number>>;
