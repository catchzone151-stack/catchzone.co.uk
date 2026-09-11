# CatchZone — Final Layout Tweaks

This file is the latest focused visual correction for the current CatchZone redesign branch.

Read it after:

- `CLAUDE.md`
- `docs/CATCHZONE_MASTER_BUILD.md`
- `docs/CATCHZONE_SHOWCASE_DROP.md`
- `docs/CATCHZONE_REFINEMENT_BRIEF.md`

Where this file conflicts with an older refinement note, **this file wins**.

Do not redesign approved areas. This pass is only to correct the specific composition issues below.

---

# 1. Homepage IslamQuest — reposition the existing 3-phone cluster

The user is no longer asking for another redesign of the three phones.

Keep the current three-phone visual treatment broadly as it is, but correct its **placement and balance**.

Current issue:

- the 3-phone cluster sits too low and too far to the right
- visually it feels detached from the IslamQuest content
- the main phone drops too close to / below the lower section boundary
- the right support phone feels pushed toward the edge

Required correction on desktop:

- move the entire three-phone cluster **upward**
- move the entire cluster **leftward**
- keep it contained neatly within the IslamQuest featured-build section
- align it visually with the IslamQuest heading, feature copy and `View Case Study` area rather than the bottom edge of the section
- preserve the current three-phone layering/order and existing motion unless a tiny motion adjustment is required by the new position
- keep sufficient breathing room from the right viewport edge
- do not let any primary phone extend awkwardly into the next section

Target feeling:

The text block and phone cluster should read as one balanced two-column hero: IslamQuest information on the left, a compact premium three-phone product cluster on the right.

Do not restart the hardware mockup work. This is primarily a positioning/composition fix.

---

# 2. `/work` CatchZone Products — centre the IslamQuest phones properly

The same three-phone cluster is currently visually off-centre on the `/work` page.

Required correction:

- centre the cluster properly within the right-hand visual area of the IslamQuest featured product block
- move it left from the far-right edge
- keep it vertically balanced against the IslamQuest copy
- ensure the main phone does not feel cut off by the section boundary
- keep all three phones readable as one grouped composition
- preserve current phone order and overall treatment

The final composition should feel deliberately centred in its assigned visual column, not pinned to the browser edge.

---

# 3. `/work` page — remove the standalone introductory hero block

The current top-of-page `WORK` intro section with:

- `WORK`
- `Products taken from idea to working software.`
- the supporting paragraph

should be removed from the `/work` page.

Reason:

The page currently opens with too much text before showing any actual work. The user wants visitors to see a real project visual much sooner.

Required new opening flow:

1. global header/navigation
2. immediately into the **Client Systems** introduction
3. then **Foundry Lane Events** as the first featured client system, with its visual visible as early as practical in the first viewport / immediately below the intro copy

Do not leave a large empty text-only hero area above Client Systems.

The page should feel visually productive almost immediately after navigation.

---

# 4. Client Systems intro — make the client-work proof clearer

Keep the label:

**CLIENT SYSTEMS**

Keep the heading direction:

**Platforms, dashboards and connected systems built for clients.**

Strengthen the supporting paragraph so visitors understand that the project shown immediately below, plus the other six, are examples of systems CatchZone has built for clients.

Preferred copy:

> Operational software, internal platforms and business automation built for clients around how their businesses actually work — from live event operations and education to training, hospitality, recruitment and logistics.

A very close refinement is acceptable if typography/line length requires it, but it must clearly communicate:

- these are client systems
- CatchZone built them for clients
- Foundry Lane below is one example
- the other six are further examples
- CatchZone's capability is broader than only these seven industries

Do not reintroduce `Concept Showcase`, `Private System`, `Showpiece`, or similar wording.

---

# 5. Foundry Lane Events — must remain first and visually immediate

Foundry Lane Events remains the first featured Client System.

Do not move Brookmere back above it.

After removing the old `/work` hero, ensure Foundry's heading and device/dashboard visual appear quickly enough that a visitor immediately sees this is a portfolio/work page, not a text-only services page.

Preserve the approved Foundry Lane styling and project route.

---

# 6. Do not disturb approved later sections

Unless required by the layout changes above, do not redesign:

- the supporting six client-system cards that were just rebuilt
- CatchZone Products content
- Client Websites content
- Product Lab route fixes
- logo treatment
- system detail pages
- global motion system

This is a surgical composition pass.

---

# 7. Responsive requirements

Verify the changes at:

- 1440 desktop
- 1280 desktop
- 1024 tablet/compact desktop
- 768 tablet
- 430 mobile
- 390 mobile
- 360 mobile

For both homepage IslamQuest and `/work` IslamQuest:

- no horizontal overflow
- phones should not cover copy or buttons
- phone cluster should not fall into the next section
- supporting phones may compress/peek more on narrow screens
- keep the central phone visually dominant

For `/work` opening:

- removing the intro hero must not make the first section feel cramped
- Client Systems heading must still have comfortable spacing below the header
- Foundry visual should arrive early without colliding with the sticky navigation

---

# 8. Completion / QA

Before declaring this pass complete:

- visually confirm homepage IslamQuest cluster is higher and further left
- visually confirm `/work` IslamQuest cluster is properly centred
- confirm the old `/work` standalone `WORK / Products taken from idea...` intro is gone
- confirm Client Systems now becomes the opening content section
- confirm Foundry Lane is still first
- confirm strengthened client-systems paragraph is visible and accurate
- run typecheck
- run lint
- run production build
- check desktop/tablet/mobile for overflow or clipping

Do not push or deploy unless the user explicitly asks.
