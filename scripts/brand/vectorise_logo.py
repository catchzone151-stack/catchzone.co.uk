#!/usr/bin/env python3
"""
Rebuilds the approved CatchZone logos as clean SVG masters.

The supplied PNG logos are AI-rendered rasters: the approved letterforms have
slightly lumpy outlines, smoky glow and speckling, which look soft on the
website. No stock typeface matches the lettering (best open-font match ~0.88
shape overlap, with a visibly different "t"), so instead of substituting a
font this script vectorises the APPROVED artwork itself:

  1. separate each element by colour (dark/white lettering, gradient "Zone",
     slogan, orbit arcs, orbit ball; Voice: lettering + waveform);
  2. build a soft mask, upsample x4, smooth away raster wobble/speckle;
  3. fit smooth Bezier outlines with corner detection (potrace algorithm);
  4. re-apply clean SVG gradients sampled from the approved references, plus
     a restrained glow on the orbit ball only.

The Voice waveform is a dense multi-strand photographic texture that cannot
be faithfully expressed as a handful of vector paths, so it is kept as a
cleaned raster (haze/speckle removed) embedded under the vector lettering.

Usage: python3 scripts/brand/vectorise_logo.py <references dir> <output dir> [all|company|voice|school-hr]
(School HR: the output dir must already contain catchzone-icon.svg for the product icon.)
Requires: numpy, Pillow, potracer (pure-Python potrace port).
"""
import base64
import io
import sys
from collections import deque

import numpy as np
import potrace
from PIL import Image, ImageFilter

UP = 4  # supersampling factor for smoothing / fitting


def load(path):
    return np.array(Image.open(path).convert("RGBA")).astype(np.float32)


def channels(A):
    r, g, b, a = (A[..., i] for i in range(4))
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    sat = np.max(A[..., :3], axis=2) - np.min(A[..., :3], axis=2)
    return r, g, b, a / 255.0, lum, sat


def components(mask, min_px):
    """4-connected components of a boolean mask -> list of (ys, xs)."""
    H, W = mask.shape
    lab = np.zeros((H, W), np.int32)
    out = []
    ys0, xs0 = np.nonzero(mask)
    for y0, x0 in zip(ys0, xs0):
        if lab[y0, x0]:
            continue
        q = deque([(y0, x0)])
        lab[y0, x0] = len(out) + 1
        pts = []
        while q:
            y, x = q.popleft()
            pts.append((y, x))
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = len(out) + 1
                    q.append((ny, nx))
        if len(pts) >= min_px:
            p = np.array(pts)
            out.append((p[:, 0], p[:, 1]))
    return out


def comp_mask(shape, comps):
    m = np.zeros(shape, bool)
    for ys, xs in comps:
        m[ys, xs] = True
    return m


def smooth_trace(soft, blur=2.6, threshold=0.5, turd=60, alphamax=1.0, opttol=0.35):
    """soft: float mask 0..1 at original resolution -> SVG path data (original coords)."""
    h, w = soft.shape
    img = Image.fromarray(np.clip(soft * 255, 0, 255).astype(np.uint8), "L")
    img = img.resize((w * UP, h * UP), Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur))
    bm = np.array(img) > threshold * 255
    # potracer treats True as background (it inverts its input), so pass the inverse.
    path = potrace.Bitmap(~bm).trace(turdsize=turd, alphamax=alphamax, opticurve=True, opttolerance=opttol)
    s = 1.0 / UP
    f = lambda p: f"{p.x * s:.1f} {p.y * s:.1f}"
    parts = []
    for curve in path:
        parts.append(f"M{f(curve.start_point)}")
        for seg in curve:
            if seg.is_corner:
                parts.append(f"L{f(seg.c)}L{f(seg.end_point)}")
            else:
                parts.append(f"C{f(seg.c1)} {f(seg.c2)} {f(seg.end_point)}")
        parts.append("Z")
    return "".join(parts)


def hexc(rgb):
    return "#%02x%02x%02x" % tuple(int(round(v)) for v in rgb)


def gradient_stops(A, mask, axis, n=7, sat_min=60):
    """Median colour of strongly-coloured opaque pixels in `mask`, in n bands along axis (0=y,1=x)."""
    r, g, b, a, lum, sat = channels(A)
    good = mask & (a > 0.9) & (sat > sat_min)
    ys, xs = np.nonzero(good)
    coord = ys if axis == 0 else xs
    lo, hi = coord.min(), coord.max()
    stops = []
    for i in range(n):
        c0 = lo + (hi - lo) * i / n
        c1 = lo + (hi - lo) * (i + 1) / n
        sel = (coord >= c0) & (coord <= c1)
        if sel.sum() < 5:
            continue
        rgb = np.median(A[ys[sel], xs[sel], :3], axis=0)
        stops.append(((c0 + c1) / 2, hexc(rgb)))
    return lo, hi, stops


def grad_def(gid, axis, lo, hi, stops):
    x1, y1, x2, y2 = (0, lo, 0, hi) if axis == 0 else (lo, 0, hi, 0)
    st = "".join(
        f'<stop offset="{(c - lo) / max(1, hi - lo):.3f}" stop-color="{col}"/>' for c, col in stops
    )
    return (
        f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" '
        f'x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}">{st}</linearGradient>'
    )


# --------------------------------------------------------------------------
# Company logo
# --------------------------------------------------------------------------

def company(ref_dark, ref_light, out_dir):
    A = load(ref_light)
    r, g, b, a, lum, sat = channels(A)
    H, W = a.shape

    ink = a * np.clip((150 - lum) / 70, 0, 1) * (sat < 70)  # dark lettering (soft)
    ink_bool = ink > 0.5
    yy = np.arange(H)[:, None] * np.ones((1, W))
    catch_soft = ink * (yy < 470)
    slogan_soft = ink * (yy >= 470)

    colour = (a > 0.35) & (sat > 70) & ~ink_bool
    comps = components(colour, 400)
    # Zone letters: large components whose centre lies in the lettering band
    zone, rest = [], []
    for ys, xs in comps:
        cy, cx = ys.mean(), xs.mean()
        if 200 < cy < 450 and 1030 < cx < 1790 and len(ys) > 6000:
            zone.append((ys, xs))
        else:
            rest.append((ys, xs))
    zone_m = comp_mask(a.shape, zone)

    # Orbit ball: brightest near-white cluster in the top-right
    bright = (lum > 205) & (a > 0.8) & (yy < 200)
    bys, bxs = np.nonzero(bright)
    bx, by = float(np.median(bxs)), float(np.median(bys))
    br = float(np.sqrt(((bxs - bx) ** 2 + (bys - by) ** 2)).max())

    orbit_m = comp_mask(a.shape, rest)
    orbit_m &= ~(((np.arange(W)[None, :] - bx) ** 2 + (yy - by) ** 2) < (br * 1.9) ** 2)
    # split into the upper and lower arcs
    oc = components(orbit_m, 300)
    upper = [c for c in oc if c[0].mean() < 330]
    lower = [c for c in oc if c[0].mean() >= 330]
    up_m, lo_m = comp_mask(a.shape, upper), comp_mask(a.shape, lower)

    soft = lambda m: (Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)))
    as_soft = lambda m: np.array(soft(m)).astype(np.float32) / 255 * np.maximum(a, m * 0.0)

    zone_sorted = sorted(zone, key=lambda c: c[1].min())
    z_m = comp_mask(a.shape, zone_sorted[:1])  # the "Z" glyph alone (favicon source)

    paths = {
        "z": smooth_trace(z_m.astype(np.float32) * a),
        "catch": smooth_trace(catch_soft),
        "slogan": smooth_trace(slogan_soft, blur=1.6, turd=12),
        "zone": smooth_trace(zone_m.astype(np.float32) * a),
        "orbitUpper": smooth_trace(up_m.astype(np.float32) * a, blur=3.0),
        "orbitLower": smooth_trace(lo_m.astype(np.float32) * a, blur=3.0),
    }

    # bounding box for the viewBox (with glow margin)
    allm = ink_bool | zone_m | up_m | lo_m | bright
    ys, xs = np.nonzero(allm)
    pad = 26
    vb = (xs.min() - pad, ys.min() - pad, xs.max() - xs.min() + 2 * pad, ys.max() - ys.min() + 2 * pad)

    for variant, ref in (("dark", ref_dark), ("light", ref_light)):
        R = load(ref)
        # Gradients sampled from the variant's own approved reference, using the
        # geometry masks (references share the layout closely enough for colour sampling).
        Rr, Rg, Rb, Ra, Rlum, Rsat = channels(R)
        z = gradient_stops(R, (Ra > 0.9) & (Rsat > 120) & (yy > 200) & (yy < 450) & (np.arange(W)[None, :] > 1030), 0, 6, 120)
        ou = gradient_stops(R, (Ra > 0.6) & (Rsat > 80) & (yy < 300) & ~((np.arange(W)[None, :] - bx) ** 2 + (yy - by) ** 2 < (br * 2) ** 2), 1, 7)
        ol = gradient_stops(R, (Ra > 0.6) & (Rsat > 80) & (yy > 450), 1, 7)
        ink_col = "#ffffff" if variant == "dark" else "#0b1015"
        glow = 0.5 if variant == "dark" else 0.22
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb[0]} {vb[1]} {vb[2]} {vb[3]}" width="{vb[2]}" height="{vb[3]}" role="img" aria-label="CatchZone — Built for what's next">
<title>CatchZone — Built for what's next</title>
<defs>
{grad_def("cz-zone-" + variant, 0, *z)}
{grad_def("cz-orbit-u-" + variant, 1, *ou)}
{grad_def("cz-orbit-l-" + variant, 1, *ol)}
<radialGradient id="cz-ball-{variant}" cx="0.4" cy="0.38" r="0.62"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#e9fff9"/><stop offset="1" stop-color="#7ff5d6"/></radialGradient>
<radialGradient id="cz-ballglow-{variant}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#3cf0c0" stop-opacity="{glow}"/><stop offset="1" stop-color="#3cf0c0" stop-opacity="0"/></radialGradient>
</defs>
<path fill="url(#cz-orbit-u-{variant})" d="{paths["orbitUpper"]}"/>
<path fill="url(#cz-orbit-l-{variant})" d="{paths["orbitLower"]}"/>
<path fill="{ink_col}" fill-rule="evenodd" d="{paths["catch"]}"/>
<path fill="url(#cz-zone-{variant})" fill-rule="evenodd" d="{paths["zone"]}"/>
<path fill="{ink_col}" fill-rule="evenodd" d="{paths["slogan"]}"/>
<circle cx="{bx:.1f}" cy="{by:.1f}" r="{br * (2.2 if variant == "dark" else 1.7):.1f}" fill="url(#cz-ballglow-{variant})"/>
<circle cx="{bx:.1f}" cy="{by:.1f}" r="{br:.1f}" fill="url(#cz-ball-{variant})"/>
</svg>
'''
        with open(f"{out_dir}/catchzone-logo-{variant}.svg", "w") as fh:
            fh.write(svg)
        # Compact wordmark (lettering only) for small mobile headers, where the
        # slogan cannot be read: same approved letter paths, tight viewBox.
        lys, lxs = np.nonzero((catch_soft > 0.5) | zone_m)
        cvb = (int(lxs.min() - 6), int(lys.min() - 6), int(lxs.max() - lxs.min() + 12), int(lys.max() - lys.min() + 12))
        compact = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{cvb[0]} {cvb[1]} {cvb[2]} {cvb[3]}" width="{cvb[2]}" height="{cvb[3]}" role="img" aria-label="CatchZone">
<title>CatchZone</title>
<defs>{grad_def("czc-zone-" + variant, 0, *z)}</defs>
<path fill="{ink_col}" fill-rule="evenodd" d="{paths["catch"]}"/>
<path fill="url(#czc-zone-{variant})" fill-rule="evenodd" d="{paths["zone"]}"/>
</svg>
'''
        with open(f"{out_dir}/catchzone-wordmark-{variant}.svg", "w") as fh:
            fh.write(compact)
        if variant == "dark":
            zys, zxs = np.nonzero(z_m)
            side = max(zxs.max() - zxs.min(), zys.max() - zys.min())
            cx, cy = (zxs.max() + zxs.min()) / 2, (zys.max() + zys.min()) / 2
            half = side * 0.5 / 0.64  # Z occupies ~64% of the tile
            icon = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{cx - half:.1f} {cy - half:.1f} {2 * half:.1f} {2 * half:.1f}">
<defs>{grad_def("czi-zone", 0, *z)}</defs>
<rect x="{cx - half:.1f}" y="{cy - half:.1f}" width="{2 * half:.1f}" height="{2 * half:.1f}" rx="{half * 0.44:.1f}" fill="#040406"/>
<path fill="url(#czi-zone)" d="{paths["z"]}"/>
</svg>
'''
            with open(f"{out_dir}/catchzone-icon.svg", "w") as fh:
                fh.write(icon)
        print("wrote", variant, "viewBox", vb, "ball", (round(bx), round(by), round(br)), "zone stops", z[2])


# --------------------------------------------------------------------------
# CatchZone Voice logo
# --------------------------------------------------------------------------

def dilate(m, r):
    img = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(2 * r + 1))
    return np.array(img) > 0


def voice_letters(A, dark_text):
    """Lettering masks (ink words + Zone) for one Voice reference."""
    r, g, b, a, lum, sat = channels(A)
    H, W = a.shape
    if dark_text:
        ink = a * np.clip((150 - lum) / 70, 0, 1) * (sat < 70)
    else:
        ink = a * np.clip((lum - 170) / 60, 0, 1) * (sat < 60)
    ink_b = ink > 0.5
    # The lettering band is the longest run of rows dense with ink (letters fill many
    # pixels per row; the waveform's thin neon core does not). No descenders, so the
    # end of that run is the baseline.
    dense = ink_b.sum(axis=1) > 60
    runs, start = [], None
    for y, d in enumerate(dense):
        if d and start is None:
            start = y
        if not d and start is not None:
            runs.append((start, y - 1))
            start = None
    top, base = max(runs, key=lambda r: r[1] - r[0])
    yy = np.arange(H)[:, None] * np.ones((1, W))
    colour = (a > 0.5) & (sat > 90) & (yy <= base + 1) & (yy >= top - 2)
    zone = [c for c in components(colour, 2500)]
    zone_m = comp_mask(a.shape, zone)
    # keep only the large lettering components (drops waveform highlights in the band)
    letters = comp_mask(a.shape, components(ink_b & (yy <= base + 2) & (yy >= top - 3), 800))
    ink_soft = ink * dilate(letters, 2)
    return ink_soft, zone_m, top, base


def voice(ref_dark, ref_light, out_dir):
    L = load(ref_light)
    ink_soft, zone_m, top, base = voice_letters(L, dark_text=True)
    a = L[..., 3] / 255.0
    paths = {
        "ink": smooth_trace(ink_soft),
        "zone": smooth_trace(zone_m.astype(np.float32) * a),
    }
    letters_bool = (ink_soft > 0.5) | zone_m
    lys, lxs = np.nonzero(letters_bool)

    for variant, ref, dark_text in (("dark", ref_dark, False), ("light", ref_light, True)):
        R = load(ref)
        r_ink, r_zone, r_top, r_base = voice_letters(R, dark_text=dark_text)
        r_letters = (r_ink > 0.5) | r_zone
        rys, rxs = np.nonzero(r_letters)
        # shift so this reference's lettering aligns with the master lettering geometry
        dx = int(round(lxs.min() - rxs.min()))
        dy = int(round(lys.max() - rys.max()))
        # Waveform layer: the reference minus its lettering (and the lettering's glow halo),
        # with low-alpha haze and isolated speckles removed.
        Rr, Rg, Rb, Ra, Rlum, Rsat = channels(R)
        halo = dilate(r_letters, 7) & (Rsat < 70)
        wave = R.copy()
        # dim, unsaturated grey = leftover lettering shadow/haze (the waveform itself is
        # strongly coloured, and its neon core is bright white, so both are kept)
        grey = (Rsat < 50) & (Rlum < 200)
        kill = dilate(r_letters, 2) | halo | (Ra < 0.09) | grey
        wave[..., 3] = np.where(kill, 0, wave[..., 3])
        # remove speckles: tiny isolated alpha islands
        wb = wave[..., 3] > 20
        keep = comp_mask(wb.shape, components(wb, 400))
        wave[..., 3] = np.where(keep, wave[..., 3], 0)
        wimg = Image.fromarray(wave.astype(np.uint8), "RGBA")
        wimg = Image.fromarray(np.roll(np.roll(np.array(wimg), dy, axis=0), dx, axis=1), "RGBA")
        bb = wimg.getchannel("A").point(lambda v: 255 if v > 0 else 0).getbbox()
        crop = wimg.crop(bb)
        buf = io.BytesIO()
        crop.save(buf, "WEBP", quality=90, alpha_quality=100, method=6)
        crop.save(f"{out_dir}/catchzone-voice-wave-{variant}.webp", "WEBP", quality=90, alpha_quality=100, method=6)
        data = base64.b64encode(buf.getvalue()).decode()

        z = gradient_stops(R, r_zone, 0, 6, 90)
        z = (z[0] + dy, z[1] + dy, [(c + dy, col) for c, col in z[2]])
        ink_col = "#ffffff" if variant == "dark" else "#0b1015"
        x0 = min(lxs.min(), bb[0]) - 20
        y0 = min(lys.min(), bb[1]) - 20
        x1 = max(lxs.max(), bb[2]) + 20
        y1 = max(lys.max(), bb[3]) + 20
        vb = (int(x0), int(y0), int(x1 - x0), int(y1 - y0))
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="{vb[0]} {vb[1]} {vb[2]} {vb[3]}" width="{vb[2]}" height="{vb[3]}" role="img" aria-label="CatchZone Voice">
<title>CatchZone Voice</title>
<defs>{grad_def("czv-zone-" + variant, 0, *z)}</defs>
<image x="{bb[0]}" y="{bb[1]}" width="{crop.width}" height="{crop.height}" href="data:image/webp;base64,{data}"/>
<path fill="{ink_col}" fill-rule="evenodd" d="{paths["ink"]}"/>
<path fill="url(#czv-zone-{variant})" fill-rule="evenodd" d="{paths["zone"]}"/>
</svg>
'''
        with open(f"{out_dir}/catchzone-voice-logo-{variant}.svg", "w") as fh:
            fh.write(svg)
        print("voice", variant, "viewBox", vb, "shift", (dx, dy), "wave bytes", len(buf.getvalue()))


# --------------------------------------------------------------------------
# CatchZone School HR product logo
# --------------------------------------------------------------------------

def inscribed_circle(m):
    """Centre/radius of the largest disc inside boolean mask m (coarse brute force)."""
    ys, xs = np.nonzero(m)
    y0, x0 = max(0, ys.min() - 60), max(0, xs.min() - 60)
    F = np.argwhere(~m[y0:ys.max() + 60, x0:xs.max() + 60]) + [y0, x0]
    best = (0.0, 0.0, 0.0)
    for y, x in zip(ys[::5], xs[::5]):
        d = float(np.sqrt(((F[:, 0] - y) ** 2 + (F[:, 1] - x) ** 2).min()))
        if d > best[2]:
            best = (float(x), float(y), d)
    return best


def school_hr_variant(ref, variant):
    """Trace one approved School HR reference (each file is traced from itself:
    the dark and light renders differ slightly in geometry)."""
    dark = variant == "dark"
    A = load(ref)
    r, g, b, a, lum, sat = channels(A)
    H, W = a.shape
    yy = np.arange(H)[:, None] * np.ones((1, W))
    xx = np.ones((H, 1)) * np.arange(W)[None, :]

    # Orbit ball: largest neutral disc in the top-right (white on dark, near-black on light)
    ballm = (a > 0.6) & (sat < 50) & ((lum > 225) if dark else (lum < 80)) & (xx > 1500) & (yy < 260)
    bx, by, br = inscribed_circle(ballm)
    br += 1.5  # the inscribed disc sits just inside the anti-aliased edge
    near_ball = np.hypot(xx - bx, yy - by) < br * 1.75

    # Lettering: neutral pixels that contrast with the intended background.
    # (The dark file's soft black halo is excluded by the luminance test.)
    if dark:
        ink = a * np.clip((lum - 150) / 60, 0, 1) * (sat < 60)
    else:
        ink = a * np.clip((150 - lum) / 70, 0, 1) * (sat < 70)
    ink = ink * (yy > 190) * (yy < 600) * ~near_ball
    split = 455 if dark else 462  # gap row between "CatchZone" and "School HR"
    catch_soft = ink * (yy < split)
    school_soft = ink * (yy >= split)

    colour = (a > 0.35) & (sat > 60) & ~(ink > 0.5)
    comps = components(colour, 400)
    zone, rest = [], []
    for ys, xs in comps:
        if 200 < ys.mean() < 450 and xs.mean() > 1040 and len(ys) > 6000:
            zone.append((ys, xs))
        else:
            rest.append((ys, xs))
    zone_m = comp_mask(a.shape, zone)
    orbit_m = comp_mask(a.shape, rest)
    if dark:
        # the upper arc has a white-hot core near the ball: keep it in the arc shape
        orbit_m |= (a > 0.5) & (lum > 200) & (sat < 60) & (yy < 200) & (xx > 600)
    orbit_m &= ~near_ball
    oc = components(orbit_m, 300)
    up_m = comp_mask(a.shape, [c for c in oc if c[0].mean() < 330])
    lo_m = comp_mask(a.shape, [c for c in oc if c[0].mean() >= 330])

    paths = {
        "catch": smooth_trace(catch_soft),
        "school": smooth_trace(school_soft, blur=1.8, turd=20),
        "zone": smooth_trace(zone_m.astype(np.float32) * a),
        "orbitUpper": smooth_trace(up_m.astype(np.float32) * a, blur=3.0),
        "orbitLower": smooth_trace(lo_m.astype(np.float32) * a, blur=3.0),
    }
    z = gradient_stops(A, zone_m & (sat > 100), 0, 6, 100)
    ou = gradient_stops(A, up_m & (a > 0.6), 1, 8, 25 if dark else 60)
    ol = gradient_stops(A, lo_m & (a > 0.6), 1, 8, 60)

    allm = (ink > 0.5) | zone_m | up_m | lo_m | near_ball
    ys, xs = np.nonzero(allm)
    pad = 24
    vb = (int(xs.min() - pad), int(ys.min() - pad), int(xs.max() - xs.min() + 2 * pad), int(ys.max() - ys.min() + 2 * pad))
    return dict(paths=paths, z=z, ou=ou, ol=ol, ball=(bx, by, br), vb=vb, zone_m=zone_m, catch=catch_soft)


def school_hr(ref_dark, ref_light, out_dir):
    for variant, ref in (("dark", ref_dark), ("light", ref_light)):
        t = school_hr_variant(ref, variant)
        p, (bx, by, br), vb = t["paths"], t["ball"], t["vb"]
        ink_col = "#ffffff" if variant == "dark" else "#14181d"
        if variant == "dark":
            ball = (
                f'<circle cx="{bx:.1f}" cy="{by:.1f}" r="{br * 2.3:.1f}" fill="url(#hr-ballglow-dark)"/>'
                f'<circle cx="{bx:.1f}" cy="{by:.1f}" r="{br:.1f}" fill="url(#hr-ball-dark)"/>'
            )
            defs_ball = (
                '<radialGradient id="hr-ball-dark" cx="0.42" cy="0.4" r="0.62"><stop offset="0" stop-color="#ffffff"/>'
                '<stop offset="0.6" stop-color="#f1fffb"/><stop offset="1" stop-color="#bff8ea"/></radialGradient>'
                '<radialGradient id="hr-ballglow-dark" cx="0.5" cy="0.5" r="0.5"><stop offset="0.38" stop-color="#5ff2d2" stop-opacity="0.85"/>'
                '<stop offset="0.6" stop-color="#3cf0c0" stop-opacity="0.32"/><stop offset="1" stop-color="#3cf0c0" stop-opacity="0"/></radialGradient>'
            )
        else:
            # approved light artwork: near-black ball inside a mint ring
            ball = (
                f'<circle cx="{bx:.1f}" cy="{by:.1f}" r="{br * 1.4:.1f}" fill="url(#hr-ring-light)"/>'
                f'<circle cx="{bx:.1f}" cy="{by:.1f}" r="{br:.1f}" fill="#16191d"/>'
            )
            defs_ball = (
                '<radialGradient id="hr-ring-light" cx="0.5" cy="0.5" r="0.5"><stop offset="0.68" stop-color="#7ff3d2"/>'
                '<stop offset="0.86" stop-color="#3fe3b8"/><stop offset="1" stop-color="#3fe3b8" stop-opacity="0.6"/></radialGradient>'
            )
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb[0]} {vb[1]} {vb[2]} {vb[3]}" width="{vb[2]}" height="{vb[3]}" role="img" aria-label="CatchZone School HR">
<title>CatchZone School HR</title>
<defs>
{grad_def("hr-zone-" + variant, 0, *t["z"])}
{grad_def("hr-orbit-u-" + variant, 1, *t["ou"])}
{grad_def("hr-orbit-l-" + variant, 1, *t["ol"])}
{defs_ball}
</defs>
<path fill="url(#hr-orbit-u-{variant})" d="{p["orbitUpper"]}"/>
<path fill="url(#hr-orbit-l-{variant})" d="{p["orbitLower"]}"/>
<path fill="{ink_col}" fill-rule="evenodd" d="{p["catch"]}"/>
<path fill="url(#hr-zone-{variant})" fill-rule="evenodd" d="{p["zone"]}"/>
<path fill="{ink_col}" fill-rule="evenodd" d="{p["school"]}"/>
{ball}
</svg>
'''
        with open(f"{out_dir}/catchzone-school-hr-logo-{variant}.svg", "w") as fh:
            fh.write(svg)
        print("school-hr", variant, "viewBox", vb, "ball", tuple(round(v) for v in (bx, by, br)), "zone", t["z"][2])
    school_hr_icon(f"{out_dir}/catchzone-icon.svg", f"{out_dir}/catchzone-school-hr-icon.svg")


def school_hr_icon(company_icon, out):
    """Compact School HR app icon. The "Z" in the School HR artwork touches the
    "o", so the icon reuses the identical approved "Z" vector from the company
    icon and adds the School HR orbit arc and ball."""
    import re
    src = open(company_icon).read()
    vx, vy, vw, vh = (float(v) for v in re.search(r'viewBox="([^"]+)"', src).group(1).split())
    grad = re.search(r"<linearGradient.*?</linearGradient>", src, re.S).group(0).replace("czi-zone", "hri-zone")
    zpath = re.search(r'<path fill="url\(#czi-zone\)" d="([^"]+)"', src).group(1)
    half = vw / 2
    cx, cy = vx + half, vy + half
    bx, by, r = cx + half * 0.6, cy - half * 0.6, half * 0.1
    icon = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vx} {vy} {vw} {vh}" role="img" aria-label="CatchZone School HR">
<title>CatchZone School HR</title>
<defs>{grad}<linearGradient id="hri-orbit" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#2563eb"/><stop offset="0.45" stop-color="#14e3e0"/><stop offset="1" stop-color="#3cf0c0"/></linearGradient></defs>
<rect x="{vx}" y="{vy}" width="{vw}" height="{vh}" rx="{half * 0.44:.1f}" fill="#040406"/>
<path d="M{cx - half * 0.82:.1f} {cy + half * 0.38:.1f}C{cx - half * 0.35:.1f} {cy + half * 0.95:.1f} {cx + half * 0.55:.1f} {cy + half * 0.25:.1f} {bx:.1f} {by:.1f}" fill="none" stroke="url(#hri-orbit)" stroke-width="{half * 0.06:.1f}" stroke-linecap="round"/>
<path fill="url(#hri-zone)" d="{zpath}"/>
<circle cx="{bx:.1f}" cy="{by:.1f}" r="{r * 2:.1f}" fill="#3cf0c0" fill-opacity="0.3"/>
<circle cx="{bx:.1f}" cy="{by:.1f}" r="{r:.1f}" fill="#f1fffb"/>
</svg>
'''
    with open(out, "w") as fh:
        fh.write(icon)


if __name__ == "__main__":
    refs, out = sys.argv[1], sys.argv[2]
    which = sys.argv[3] if len(sys.argv) > 3 else "all"
    if which in ("all", "company"):
        company(f"{refs}/8.webp", f"{refs}/9.webp", out)
    if which in ("all", "voice"):
        voice(f"{refs}/10.webp", f"{refs}/11.webp", out)
    if which in ("all", "school-hr"):
        school_hr(f"{refs}/12.webp", f"{refs}/13.webp", out)
