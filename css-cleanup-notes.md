# CSS cleanup notes — Assignment 3 (Bootstrap)

What we removed from `base.css` and `nuraly.css` (Assignment 2 versions) because
Bootstrap now does the same job, and which Bootstrap class replaced each rule.

## base.css

| Removed rule | Replaced by |
|---|---|
| `* { box-sizing: border-box; margin: 0; padding: 0; }` reset | Bootstrap's own reset (part of `bootstrap.min.css`) |
| `.site-header` flex row (display:flex, justify-content, gap...) | `.navbar`, `.navbar-expand-lg`, `.container-fluid` |
| `.site-header nav > ul.nav-list` flex row | `.navbar-nav`, `.navbar-collapse` |
| `nav[aria-label="auth-nav"] > ul.nav-list { justify-content: flex-end }` | second `.navbar-nav` placed after `me-lg-auto` on the first |
| `.nav-list a`, `.nav-list a:hover` | `.nav-link`, Bootstrap's `navbar-dark` link colours |
| `main { max-width: 1100px; margin: 0 auto; padding: 1.5rem; }` | `.container` |
| `main section { padding-top: 2rem; }` / `:first-child` exception | `.py-4`, `.pb-4` utilities per section |
| `main section ul { padding-left: 1rem; }` | Bootstrap's default list padding |
| `.btn`, `.btn:hover`, `.btn-primary`, `.btn-primary:hover`, `.btn-secondary` (hand-built button system) | `.btn`, `.btn-primary`, `.btn-outline-secondary`, `.btn-outline-danger`, `.btn-lg`/`.btn-sm`, `disabled` — only the accent-colour override (`--bs-btn-bg` etc.) stayed |
| `label + input`, `label + select`, `label + textarea` (block/width/padding) | `.form-control`, `.form-select`, `.form-label`, `.mb-3` |
| `fieldset`, `legend` full styling | left as plain `<fieldset>`/`<legend class="h5">`; Bootstrap doesn't style these, so only what's still needed stayed |
| `.socials-list` flex row + `flex-direction` | `d-flex` utility class added directly on the `<ul>` |
| `a[target="_blank"]::after { content: " ↗" }` | removed as a layout/behaviour rule Bootstrap-era pages don't need; kept out of scope of the correction layer |

## nuraly.css

| Removed rule | Replaced by |
|---|---|
| `.coach-list` (flexbox container) + `.coach-list .trainer-card { flex: 1 1 240px }` + `.coach-list h3 { flex: 1 1 100% }` | `.row.row-cols-1.row-cols-sm-2.row-cols-lg-4.g-4` |
| `.aqua-list` (CSS Grid container) + `grid-template-columns` | `.row.row-cols-1.row-cols-sm-2.row-cols-lg-4.g-4` |
| `.aqua-list .trainer-card:first-child { grid-column: span 2; grid-row: span 2 }` | `.col-lg-6` on that one card |
| `.trainer-card` background/border/radius/padding | Bootstrap `.card` + `bg-dark text-white h-100` |
| `.trainer-card img` (display/max-width/radius/margin) | `.card-img-top` |
| `.price-table` width/margin/border-collapse | `.table` (Bootstrap sets these) |
| `.price-table th, .price-table td` border/padding/text-align | `.table-bordered`, `.align-middle` |
| `.price-table tbody tr:nth-child(even)` zebra striping | `.table-striped` |
| `#testimonials` grid/place-items centring + padding | `.text-center` on the section, Bootstrap's default block flow |
| `#testimonials blockquote` max-width/font styling | `.blockquote` |
| `.float-img` (float/width/margin/radius) | `.float-start`, `.me-3`, `.mb-2`, `.rounded` utilities |
| `#club-rules { clear: both }` | `.clearfix` utility on `.membership-tip` instead |
| `.auth-form` (max-width/margin/background/padding/radius) | `.col-md-6.col-lg-5.mx-auto` on the wrapping column; only the dark-input colour correction stayed |
| `.auth-form label` | `.form-label` |
| `.auth-form input` sizing | `.form-control` (only the dark-mode colour correction stayed, under `.auth-form .form-control`) |
| `.auth-form button` margin | `.d-flex.gap-2` on the button row |
| `#register-align-text { text-align: center }` | `.text-center` (also fixed a duplicate `id` bug from Assignment 2 in the same pass) |
| `#book-trial button { margin-right: 0.5rem }` | `.d-flex.gap-2` on the button row |

Total custom CSS across `base.css` + `nuraly.css` is well under 100 lines, and
everything left is either a brand-colour/font correction or a detail Bootstrap
doesn't provide out of the box (the fixed back-to-top button, the absolutely
positioned cert badge, the dark-input colour fix).
