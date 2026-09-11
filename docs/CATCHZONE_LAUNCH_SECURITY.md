# CatchZone — Production Launch Security Upgrade

This is the final production-launch blocker for the CatchZone redesign.

The visual/product work is approved. **Do not redesign the site.** This pass exists only because Replit's Package Firewall refuses to install the current `next@14.2.35` due Critical CVEs.

## Current launch state

- The completed CatchZone V1 redesign is merged to `main`.
- Replit production workspace is intended to run the exact GitHub `main` source.
- `.replit` is already configured for Autoscale with:
  - build: `npm run build`
  - run: `npm run start`
- Resend environment variables already exist in the Replit workspace.
- `catchzone.co.uk` is verified in Resend for sending.
- The only current launch blocker is dependency security / installability.

## Required upgrade target

Prefer the smallest supported migration path:

- `next`: `15.5.24` (Maintenance LTS / patched line)
- `react`: `19.2.8`
- `react-dom`: `19.2.8`
- `eslint-config-next`: `15.5.24`
- `@react-three/fiber`: `9.7.0` (React 19-compatible major)
- `@react-three/drei`: `10.7.8` (current stable line compatible with R3F 9 / React 19)

Update React type packages as required by React 19.

Do **not** upgrade to Next 16 unless the tested 15.5.24 path is genuinely blocked.

## Critical constraints

1. **No visual redesign.** Preserve the approved CatchZone pages, content, layout, motion direction, logo treatment, Work page, client-system pages, Product Lab, IslamQuest presentation, forms and routes.
2. Do not remove 3D/motion features merely to make the upgrade easier unless an actual incompatibility cannot be fixed safely.
3. Keep the current Next App Router architecture.
4. Keep the project configurator / `/api/start-a-project` email route working.
5. Keep all current redirects, headers, metadata, sitemap and robots behaviour.
6. Do not use `npm audit fix --force` as a shortcut.
7. Do not bypass Replit's package firewall.
8. Regenerate and commit `package-lock.json` normally from the reviewed dependency upgrade.

## React Three Fiber migration

R3F 8 pairs with React 18; R3F 9 pairs with React 19. Upgrade R3F deliberately and inspect the v9 migration implications.

Fix only real compatibility/type issues introduced by the dependency migration. Preserve the rendered scenes and interaction behaviour.

## Validation sequence

After the dependency update:

1. clean install from lockfile (`npm ci`)
2. typecheck
3. lint (adjust the lint script only if required by Next 15.5 tooling; do not weaken lint rules)
4. production build
5. run production server locally
6. browser QA at minimum:
   - `/`
   - `/work`
   - Foundry Lane client-system page
   - IslamQuest work page
   - Services
   - About
   - Start a Project
   - one Product Lab route
7. check desktop, tablet and mobile
8. verify no horizontal overflow, broken images, console errors or failed runtime requests
9. verify reduced-motion behaviour still works
10. verify `/api/start-a-project` still handles configured production env vars correctly (do not expose secret values)

## Replit compatibility check

The final lockfile must install successfully under Replit's package security policy. If Replit still blocks a package, identify the exact package/advisory and move only to a supported patched version; do not circumvent the policy.

## Delivery

Once all checks pass:

- commit the security upgrade
- push it to GitHub
- report the exact commit SHA
- report dependency versions used
- report typecheck/lint/build results
- report any compatibility changes made
- explicitly confirm that no intentional visual redesign was performed

Do not deploy or change DNS from Claude. Deployment is handled separately after this commit is verified.
