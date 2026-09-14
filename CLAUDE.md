# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm start` — start the Expo dev server
- `npm run ios` / `npm run android` / `npm run web` — start the dev server targeting a specific platform
- `npm run lint` — run `expo lint` (ESLint via `eslint-config-expo`, flat config in [eslint.config.js](eslint.config.js))
- `npm run reset-project` — moves the starter `app/` code to `app-example/` and creates a blank `app/` (one-time, destructive; don't run unless asked)

There is no test runner configured in this project.

## Architecture

This is an Expo Router (v6, file-based routing) app on Expo SDK 57 / React Native 0.86 / React 19.2, styled with NativeWind v5 (Tailwind for RN). The New Architecture is mandatory as of this SDK (no `newArchEnabled` config option anymore) and Android edge-to-edge is always on (no `edgeToEdgeEnabled` option). **Expo's APIs changed significantly for this SDK version** — per [AGENTS.md](AGENTS.md), consult the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing Expo-related code instead of relying on older/general Expo knowledge.

### Routing

- `app/_layout.tsx` is the root layout: loads the Plus Jakarta Sans font family via `expo-font`, holds the splash screen until fonts are ready, and renders a `Stack` with two groups: `(tabs)` and `(auth)`.
- `app/(tabs)/` is the authenticated tab group (`index` = Home, `subscriptions`, `insights`, `settings`). The tab bar itself is data-driven from `tabs` in [constants/data.ts](constants/data.ts) and styled via `constants/theme.ts` (`components.tabBar`) — add a new tab by adding an entry to that array plus an icon, not by hand-wiring a `Tabs.Screen`.
- `app/(auth)/` holds `sign-in` / `sign-up`, under their own `Stack` layout.
- `app/onboarding.tsx` is a standalone route outside both groups.
- Routing is typed (`experiments.typedRoutes` in [app.json](app.json)).

### Styling (NativeWind)

- Global styles/tokens live in [global.css](global.css), imported once per root layout (`app/_layout.tsx` and `app/(auth)/_layout.tsx`). Tailwind theme tokens (colors, spacing, fonts) are defined there under `@theme` using CSS custom properties, and largely mirror [constants/theme.ts](constants/theme.ts) — when changing a color/spacing value, update both, or check whether the JS constant can just read from theme instead of duplicating it.
- Most UI is styled with custom semantic class names (e.g. `sub-card`, `home-header`, `upcoming-row`) defined via `@apply` in `global.css`, rather than inlining Tailwind utility classes directly in components. Follow this pattern for new components: define a named class in `global.css`, then reference it via `className`.
- `nativewind`'s `styled()` HOC is used where a third-party component (e.g. `SafeAreaView` from `react-native-safe-area-context`) needs `className` support.

### Data & types

- There is no backend/API yet — all data is static/mock, defined in [constants/data.ts](constants/data.ts) (`HOME_USER`, `HOME_BALANCE`, `UPCOMING_SUBSCRIPTIONS`, `HOME_SUBSCRIPTIONS`, `tabs`). Screens import directly from this file.
- Icons and images are centralized in [constants/icons.ts](constants/icons.ts) and [constants/images.ts](constants/images.ts) as static `require`/import maps, re-exported as `icons` / `images` objects — add new assets there rather than requiring images ad hoc in components.
- Shared domain/UI types (`Subscription`, `AppTab`, `SubscriptionCardProps`, etc.) are declared as **global** ambient interfaces in [type.d.ts](type.d.ts) (`declare global { ... }`), not imported — components reference types like `SubscriptionCardProps` directly with no import statement. Add new shared prop/data shapes here following the same pattern.
- Formatting helpers (currency, dates, status labels) live in [lib/utils.ts](lib/utils.ts) and use `dayjs` for date parsing/formatting.
- Path alias `@/*` maps to the project root (see [tsconfig.json](tsconfig.json)).
