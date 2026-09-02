# foxy-embeds

Canonical copies of the custom code that lives in the **Foxy admin** (store checkout / template
configuration) for `the-candler-foundry.foxycart.com`. These are **not served from this repo** — Foxy
hosts them. Kept here for recoverability and version history (same idea as `webflow-embeds/`).
**Emily pastes these into the Foxy admin; nothing changes live until she does.**

- **`checkout-force-login.html`** — checkout custom footer. Forces account creation (`checkout_type:
  account_only`) when the cart contains a must-log-in item: category `On-Demand`/`Certificate`, or any
  Sunday School Simplified packet (product code starting `SSS-`). Store default is guest-allowed
  (`default_account`). ⚠ Client-side, so it can be bypassed (script blocker / JS off / express-checkout
  path) — a server-side **pre-payment webhook** is the bulletproof follow-up (not yet built).
- **`checkout-custom-fields.html`** — the "Candler alum?" checkbox, organization/church field, and the
  SSS optional-donation field (shown only when the cart has an `SSS-` item).

History: 2026-09-02 — added the `SSS-` code match to force-login (SSS was previously missing, so SSS
checkouts ran guest-allowed and the occasional shopper registered with no account/password).
