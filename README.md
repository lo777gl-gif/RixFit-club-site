# RixFit — web site

Web Technologies 1 Project.     
The Real RixFit has no real own web Site, Address: **Turan Avenue 37/9**.

## Authors
* **Auyelkhan Nuraly, Yeren Yedige, Anuar Muratov From SE-2534** — `index.html`, `base.css`
* **Auyelkhan Nuraly** — `programs-and-trainers.html`, `rules.html`, `register.html`, `nuraly.css`
* **Yeren Yedige** — `gym-equipment.html`, `reviews.html`, `account.html`, `yeren-yedige.css`
* **Anuar Muratov** — `nutrition-and-supplements.html`, `services.html`, `login.html`, `anuar.css`

## Project Structure
* `index.html` — main page of RixFit.
* `programs-and-trainers.html` — page of programs and coaches.
* `rules.html` — page of how to behave in pool and gym.
* `nutrition-and-supplements.html` — page of healthy snacks.
* `services.html` — page of all services like pool, gym, sauna etc.
* `gym-equipment.html` — page of guide to the gym equipment.
* `reviews.html` — page of current evaluation of RixFit and form for feedback.
* `login.html` — page of Logining.
* `register.html` — page of Registration.
* `account.html` — page of User Profile.
* `images/` — real images from the RixFit.
* `css/base.css` — main css file, that is the common stylesheet
* `css/nuraly.css` — personal css file, implements Nuraly's web pages
* `css/yeren-yedige.css` — personal css file, implements Yeren's web pages
* `css/anuar.css` — personal css file, implements Anuar's web pages

## Notes to the project
* Pages are written in HTML5 and CSS; behaviour is added with JavaScript and jQuery 4.0.0 (CDN) from separate `.js` files, no inline handlers.
* Texts and contact information are completely real, without fish text (Lorem ipsum).
* Each page has been validated through the W3C validator and is error-free.

## Assignment 6 - jQuery
* `js/jq-helpers.js` - shared jQuery form helpers (field errors, messages, labeled controls) for the equipment, reviews and account pages.
* `js/equipment.js`, `js/reviews.js`, `js/account.js` - rewritten with jQuery (delegated events, effects with duration and callbacks, per-field validation). Nutrition and services use `js/nutrition.js` and `js/services.js`.
* `old-js-version.js` - the previous plain-JavaScript versions kept for comparison (not linked to any page). Each jQuery section carries a `COMPARISON` comment.

## Endterm - JavaScript and jQuery

Plain JavaScript and jQuery are kept in separate files; a feature uses one or the other, never both.

| Feature | Page | Technology | File | Author |
| --- | --- | --- | --- | --- |
| Shared value checks (email, phone, name, time helpers) | all pages | plain JavaScript | `js/main.js` | team |
| Home page, programs, register, rules | `index.html`, `programs-and-trainers.html`, `register.html`, `rules.html` | plain JavaScript | `js/index.js`, `js/programs.js`, `js/register.js`, `js/rules.js`, `js/nuraly-common.js` | Auyelkhan Nuraly |
| Nutrition and services | `nutrition-and-supplements.html`, `services.html` | jQuery | `js/nutrition.js`, `js/services.js` | Anuar Muratov |
| Login form (validation, show/hide password, attempt limit) | `login.html` | plain JavaScript | `js/login.js` | Yeren Yedige |
| Equipment inventory and session builder | `gym-equipment.html` | jQuery | `js/equipment.js`, `js/jq-helpers.js` | Yeren Yedige |
| Reviews list, filters and feedback form | `reviews.html` | jQuery | `js/reviews.js`, `js/jq-helpers.js` | Yeren Yedige |
| Weekly visit planner | `account.html` | jQuery | `js/account.js`, `js/jq-helpers.js` | Yeren Yedige |

### Added since the jQuery assignment (Yeren Yedige's pages)
* **Equipment:** the "Build your session" block can now be collapsed and expanded with `slideToggle` (click or Enter/Space, with `aria-expanded`); focus returns to its heading after a removal.
* **Reviews / account:** no new functionality in this pass; both were re-tested with empty and wrong values (per-field errors, confirmation only when every check passes, empty-list messages, no console errors).
