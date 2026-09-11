# CatchZone — Final Visual Polish

This file is the latest focused correction for the current CatchZone redesign branch.

Read it after:

- `CLAUDE.md`
- `docs/CATCHZONE_MASTER_BUILD.md`
- `docs/CATCHZONE_SHOWCASE_DROP.md`
- `docs/CATCHZONE_REFINEMENT_BRIEF.md`

Where this file conflicts with an older note, **this file wins**.

This is a small final polish pass. Do not redesign approved areas.

---

# 1. IslamQuest — stop iterating on the current pseudo-3D composition

The current homepage and `/work` IslamQuest 3-phone composition is still not approved.

The issue is not simply position anymore. The three phones still feel like thin floating panels and the composition is visually awkward.

Do **not** keep adding more perspective, more orbiting, more thickness tricks or more complex stock-mockup simulation to the existing version.

Reset the visual presentation to a simpler, cleaner CatchZone-native device composition.

---

# 2. IslamQuest screenshots — use the ORIGINAL repo assets only

The IslamQuest screen content must remain authentic.

Use the existing original IslamQuest screenshots already in the repository:

- centre/main phone: `/assets/images/islamquest/1_SS.png`
- left support phone: `/assets/images/islamquest/8_SS.png`
- right support phone: `/assets/images/islamquest/3_SS.png`

Do not use the generated/cropped `hero-phones` images as the final screen source if they contain altered copy or reconstructed content.

In particular:

- do **not** add, rewrite or regenerate any greeting such as `Assalamu Alaikum, Mohammed`, `Assalamu Alaikum, Muhammed`, or any other personalised name/text
- do **not** rewrite UI copy inside the screenshot
- do **not** AI-edit the screenshots
- do **not** redraw the app screen
- preserve the original screenshot pixels/content

If cropping is needed to fit the phone screen, use normal CSS/image cropping only. Do not change the actual UI content.

If the temporary files under `public/assets/images/islamquest/hero-phones/` are no longer used anywhere, they may be removed after verifying no other route depends on them.

---

# 3. New IslamQuest visual direction — premium CatchZone device fan

Use exactly three recognisable smartphone frames, but simplify the composition.

The final state should be a **compact three-phone fan**, not a stock-photo recreation and not three widely separated floating objects.

## Desktop composition

- centre/Home phone: largest and front-most
- left/Boss Level phone: behind-left, about 80–85% of centre size, rotated slightly inward
- right/Leaderboard phone: behind-right, about 80–85% of centre size, rotated slightly inward
- side phones should overlap the centre phone slightly
- the full cluster should read as one single visual object
- keep enough of each supporting screen visible to understand there are three different parts of IslamQuest

The phones should be visibly real devices, but the design should stay clean:

- graphite/dark device body
- obvious but restrained bezel
- visible side rail/edge on the angled support phones
- screen inset inside the device body
- subtle edge highlight
- soft contact shadows where phones overlap
- one shared soft shadow/glow beneath/behind the cluster

Do not exaggerate thickness. Do not create bulky/cartoon phones.

## CatchZone integration

The device cluster must feel native to the existing CatchZone page:

- dark background remains
- use a very restrained teal/cyan/blue-violet radial glow behind the cluster
- optional thin atmospheric/orbit arc behind the phones is allowed if extremely subtle
- no bright poster background
- no white studio floor
- no generic stock-product backdrop

The result should feel like a polished CatchZone product showcase, not a cut-out mockup pasted on the page.

---

# 4. IslamQuest motion — simpler and more reliable

Do not use the previous complicated flying/orbit sequence.

Use one controlled **fan-open entrance**:

1. all three phones begin close together / slightly stacked near the centre phone
2. centre phone rises forward slightly and fades/sharpens into place
3. left phone fans out behind-left with a small rotation
4. right phone fans out behind-right with a complementary small rotation
5. all three settle together with a restrained ease/overshoot

Recommended scale of movement:

- side-phone travel: roughly 40–70px at desktop depending on layout
- side-phone final rotation: roughly 8–14 degrees, not extreme 3D turns
- centre-phone rise: roughly 10–24px
- no full spins
- no continuous orbit
- no dramatic Z-axis carnival movement

After settling:

- either remain still, or use only a tiny 1–2px drift / 1–2 degree group pointer response
- treat the three phones as one product cluster rather than three independently bobbing objects
- reduced-motion mode should simply show the final assembled fan with a gentle fade

The animation should be elegant and predictable first, impressive second.

---

# 5. Homepage IslamQuest placement

On the homepage, the three-phone fan must sit comfortably in the right-hand side of the IslamQuest featured-build section.

Requirements:

- move the whole cluster sufficiently **up and left** from the current placement
- vertically centre it against the IslamQuest heading/body/features/CTA area
- keep the cluster comfortably above the lower `Also live on Google Play` row
- do not let the cluster hang toward the bottom boundary
- do not pin it to the right browser edge
- keep a balanced two-column composition: copy/CTA on the left, product fan on the right

---

# 6. `/work` IslamQuest placement

On `/work`, reuse the same approved three-phone fan style.

- centre the cluster within its assigned visual column
- do not pin it to the far right
- align it vertically with the IslamQuest copy and CTA
- maintain the same screen order and proportions as the homepage
- responsive implementation can scale the cluster, but should not invent a different visual style

---

# 7. `/work` Client Systems intro — shorten to two lines maximum

The current supporting paragraph is too long.

Keep:

**CLIENT SYSTEMS**

and the heading:

**Platforms, dashboards and connected systems built for clients.**

Replace the paragraph with this concise approved copy:

> Seven client systems across events, education, training, hospitality, recruitment and logistics — built around each client's real workflow.

At normal desktop width this supporting copy should remain approximately **two lines maximum**.

Do not add another explanatory paragraph underneath it.

Foundry Lane Events remains immediately below as the first/lead client system.

---

# 8. Preserve everything else approved

Do not redesign or materially change:

- Foundry Lane ordering or treatment
- the six supporting client-system cards
- CatchZone Products content apart from the IslamQuest phone visual described above
- Client Websites section
- Product Lab routing/pages
- CatchZone logo/header treatment
- client-system detail pages
- global theme/motion system

Only make changes required by this final polish brief.

---

# 9. Responsive QA

Verify at minimum:

- 1440
- 1280
- 1024
- 768
- 430
- 390
- 360

Check both homepage and `/work` IslamQuest sections for:

- no horizontal overflow
- no overlap with text/buttons
- no collision with the lower app row/next section
- centre phone remains dominant
- supporting phones remain recognisable
- original screenshots remain unaltered

On mobile, simplify to a compact fan with centre dominant and partial side-phone peeks rather than trying to reproduce the full desktop spread.

---

# 10. Completion

Before declaring complete:

- confirm original `1_SS.png`, `8_SS.png`, `3_SS.png` are the actual three IslamQuest screen sources
- confirm no personalised greeting or other generated copy was added to the screenshots
- visually verify homepage product fan positioning
- visually verify `/work` product fan centring
- confirm Client Systems paragraph uses the approved concise copy
- run typecheck
- run lint
- run production build
- perform visual breakpoint QA

Do not push or deploy unless explicitly asked.
