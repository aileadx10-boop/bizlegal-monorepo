# packages/themes Operating Notes

Purpose: shared BizLegal theme tokens, FOUC script, and shell components.
Package name: @bizlegal/themes.
Deploy target: imported by Next.js apps; no standalone service.
Env surface: none.
Keep tokens backward compatible because multiple apps consume the package.
Avoid remote font dependencies in shared components; builds must work offline.
Theme changes must preserve accessibility contrast and keyboard navigation.
Do not add app-specific business logic here.
Prefer CSS variables and small typed React helpers.
Run downstream app builds when changing exported components.
