# Contributing

## Code style

- `npm run lint` must pass. Run `npm run format` to fix formatting.
- Numbers with a meaning are named constants in `UPPER_SNAKE_CASE` at the top of the module (`EYE_HEIGHT`, not `1.7`).
  A value used in more than one place always comes from one constant.
- Colours come from `palette` in `src/theme.js`. In CSS, use its custom properties (`var(--background)`), not hex
  values.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, ...).
