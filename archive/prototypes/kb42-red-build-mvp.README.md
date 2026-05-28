# KB-42: Red Build MVP Archive

This archive preserves the first playable prototype for the `Proof-of-work` section:
`КБ-42: Красный Билд`.

## Why It Is Archived

The prototype was useful as a proof-of-work experiment for the CV landing page, but it is no longer the main direction for future game prototypes. The active landing page now uses a neutral prototype hub instead of rendering this game directly.

## Preserved Files

- `src/components/ProofGame.tsx`
- `src/data/proofGameData.ts`
- `src/lib/proofGameRules.ts`
- `src/types/game.ts`

These files contain the full React component, static game content, pure rules, and TypeScript types for the MVP.

## Restore Notes

To restore this prototype later:

1. Extract the archived `src/...` files back into the project.
2. Import `ProofGame` in `src/App.tsx`.
3. Render `<ProofGame />` inside the `#proof-game` section or another target section.
4. Run `npm run build` to verify TypeScript and Vite.

The archived prototype has no backend, no `localStorage`, no routing, and no dependencies beyond the current React/Vite/Tailwind/Lucide stack.
