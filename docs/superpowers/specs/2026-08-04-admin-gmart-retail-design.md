# Admin G-mart retail UI

## Goal
Restyle admin (login + dashboard) to match [nandilathgmart.com](https://nandilathgmart.com/) look-and-feel while keeping Nippon Toyota copy/logo assets. Public entry/confirmation/winners unchanged.

## Approach
Retail admin: white shell, G-mart red CTAs, navy accent rails, product-card panels.

## Tokens (from live WoodMart / logo)
- Primary: `#E50019` (rgb(229,0,25))
- Title: `#242424`
- Body muted: `#767676`
- Surface: `#FFFFFF` / page `#F5F5F5`
- Border: `#E5E5E5`
- Navy accent: `#0D0625`

## Scope
- `/admin/login`, dashboard layout, nav, Draw, Entries, admin components
- Scoped via `.admin-shell` so global festive tokens stay for public pages
