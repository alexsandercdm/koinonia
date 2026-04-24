# UI Specification - Koinonia Dashboard

> Source: Stitch AI Generated Designs (Project ID: 6022596809973417466)
> Generated: 2026-03-10 | Updated: 2026-04-12
> Type: TEXT_TO_UI_PRO | Agent: Gemini 3.0 Flash (PRO)

## 1. Design System Reference

### Theme Configuration
| Token | Value |
|---|---|
| **Color Mode** | DARK |
| **Primary Color** | `#4d0085` (Spiritual Violet) |
| **Font Family** | Inter |
| **Border Radius** | ROUND_TWELVE (12px/full) |
| **Saturation** | 3 (High) |

### Asset Location
All Stitch-generated assets are stored in:
```
.planning/stitch-assets/
├── screenshots/     # 14 PNG screenshots
├── html/            # 14 HTML prototypes
└── README.md        # Full index with screen mappings
```

## 2. Screen Inventory

### 2.1 Authentication Screens

#### Login Mobile
| Property | Value |
|---|---|
| **Screen ID** | `91019aa68e8d4ae7a95d2bfd477976a6` |
| **Device** | MOBILE (780×1768) |
| **Screenshot** | `screenshots/14-login.png` |
| **HTML** | `html/14-login.html` |
| **Key Elements** | Logo Koinonia, Email input, Password input, Login button, Forgot password link |

#### Login Web
| Property | Value |
|---|---|
| **Screen ID** | `5599ea8364c146caa3ec9739cad48e8a` |
| **Device** | DESKTOP (2560×2048) |
| **Screenshot** | `screenshots/13-login-web.png` |
| **HTML** | `html/13-login-web.html` |
| **Key Elements** | Centered login card, branding, email/password fields, remember me checkbox |

---

### 2.2 Dashboard Screens

#### Koinonia Dashboard (Mobile)
| Property | Value |
|---|---|
| **Screen ID** | `cbe297672e4a437f9e9ba6e7ac8a1a4a` |
| **Device** | MOBILE (780×2372) |
| **Screenshot** | `screenshots/01-koinonia-dashboard.png` |
| **HTML** | `html/01-koinonia-dashboard.html` |
| **Key Elements** | Stats cards, navigation menu, quick actions, recent activity |

#### Dashboard Web
| Property | Value |
|---|---|
| **Screen ID** | `94eefd5549b84ecf9575184955cc9482` |
| **Device** | DESKTOP (2560×2048) |
| **Screenshot** | `screenshots/02-dashboard-web.png` |
| **HTML** | `html/02-dashboard-web.html` |
| **Key Elements** | Sidebar navigation, KPI cards, charts, recent registrations table |

---

### 2.3 Participant Management Screens

#### Cadastro de Participante (Mobile)
| Property | Value |
|---|---|
| **Screen ID** | `f05d47a1d6214dff99f62260704a8ff2` |
| **Device** | MOBILE (780×2718) |
| **Screenshot** | `screenshots/06-cadastro-participante.png` |
| **HTML** | `html/06-cadastro-participante.html` |
| **Key Elements** | Form with personal data, health info, emergency contacts, submit button |

#### Cadastro de Participante Web
| Property | Value |
|---|---|
| **Screen ID** | `ad7dea7c834640c3b2189d422a00f36a` |
| **Device** | DESKTOP (2560×2048) |
| **Screenshot** | `screenshots/03-cadastro-participante-web.png` |
| **HTML** | `html/03-cadastro-participante-web.html` |
| **Key Elements** | Multi-step form, progress indicator, validation states |

#### Lista de Participantes (Mobile)
| Property | Value |
|---|---|
| **Screen ID** | `cd8207fd0afb4dc1a89625869f0b8dde` |
| **Device** | MOBILE (780×1768) |
| **Screenshot** | `screenshots/04-lista-participantes.png` |
| **HTML** | `html/04-lista-participantes.html` |
| **Key Elements** | Search bar, participant cards, filter chips, FAB for new registration |

#### Lista de Participantes Web
| Property | Value |
|---|---|
| **Screen ID** | `ecbfd8b928db4815996c14d3a87e0b00` |
| **Device** | DESKTOP (2560×2048) |
| **Screenshot** | `screenshots/05-lista-participantes-web.png` |
| **HTML** | `html/05-lista-participantes-web.html` |
| **Key Elements** | Data table, pagination, bulk actions, export buttons |

---

### 2.4 Accommodation Management Screens

#### Gestão de Acomodações - Cama-a-Cama (Mobile)
| Property | Value |
|---|---|
| **Screen ID** | `05dacb63fc6644d5b7822536b71253f1` |
| **Device** | MOBILE (780×1908) |
| **Screenshot** | `screenshots/07-gestao-acomodacoes.png` |
| **HTML** | `html/07-gestao-acomodacoes.html` |
| **Key Elements** | Room/bed visual map, availability indicators, drag-and-drop assignment |

#### Gestão de Acomodações Web
| Property | Value |
|---|---|
| **Screen ID** | `ee2480bab18e41cab2da7c72255d728f` |
| **Device** | DESKTOP (2560×2276) |
| **Screenshot** | `screenshots/12-gestao-acomodacoes-web.png` |
| **HTML** | `html/12-gestao-acomodacoes-web.html` |
| **Key Elements** | Floor plan view, room grid, bed status matrix, filter controls |

#### Cadastro de Acomodação (Mobile)
| Property | Value |
|---|---|
| **Screen ID** | `6157d119d5cb44e3a96eaeb027dbbb6a` |
| **Device** | MOBILE (1164×2268) |
| **Screenshot** | `screenshots/09-cadastro-acomodacao.png` |
| **HTML** | `html/09-cadastro-acomodacao.html` |
| **Key Elements** | Location name, room count, bed configuration, gender rules |

#### Cadastro de Acomodação Web
| Property | Value |
|---|---|
| **Screen ID** | `3a968e1935a344409ff8fee7ca09db0d` |
| **Device** | DESKTOP (2816×2252) |
| **Screenshot** | `screenshots/08-cadastro-acomodacao-web.png` |
| **HTML** | `html/08-cadastro-acomodacao-web.html` |
| **Key Elements** | Hierarchical form (local > quarto > cama), capacity settings, visual preview |

---

### 2.5 Financial Management Screens

#### Gestão Financeira (Mobile)
| Property | Value |
|---|---|
| **Screen ID** | `d3e2f0e806d94055bcd5f82e997b9128` |
| **Device** | MOBILE (780×2106) |
| **Screenshot** | `screenshots/11-gestao-financeira.png` |
| **HTML** | `html/11-gestao-financeira.html` |
| **Key Elements** | Balance summary, payment status list, quick actions |

#### Gestão Financeira Web
| Property | Value |
|---|---|
| **Screen ID** | `82f03fac3fe245cbb1bb1078e894ffb2` |
| **Device** | DESKTOP (2560×2048) |
| **Screenshot** | `screenshots/10-gestao-financeira-web.png` |
| **HTML** | `html/10-gestao-financeira-web.html` |
| **Key Elements** | Revenue/expense charts, payment pipeline, break-even indicator, transaction table |

---

## 3. Responsive Breakpoints

Based on Stitch-generated screen dimensions:

| Breakpoint | Width | Target |
|---|---|---|
| **Mobile** | 390px - 780px | Phones (primary operational device) |
| **Tablet** | 1164px | Large tablets (accommodation management) |
| **Desktop** | 1280px - 2816px | Admin workstations |

## 4. Implementation Guidelines

### 4.1 Mobile-First Priority
- All screens must work on 390px width minimum
- Touch targets >= 48px (per PROJECT.md constraints)
- Font size >= 16px for body text (Inter)

### 4.2 Component Mapping to Stitch Screens
| Koinonia Domain | Stitch Screens | Phase Reference |
|---|---|---|
| Auth | Login Mobile, Login Web | Phase 1 |
| Participants | Cadastro (M/W), Lista (M/W) | Phase 1 |
| Accommodations | Gestão (M/W), Cadastro (M/W) | Phase 3 |
| Finance | Gestão (M/W) | Phase 4 |
| Dashboard | Dashboard (M/W) | Phase 4 |

### 4.3 HTML Prototype Reference
Each screen has an HTML prototype generated by Stitch that can be used as visual reference:
- Open HTML files directly in browser to view Stitch's generated implementation
- HTML uses inline styles and Tailwind-like utility classes
- These are **prototypes**, not production code - adapt to project's React component patterns

## 5. Design System vs Implementation

### Current DESIGN.md Alignment
The existing `.planning/design/DESIGN.md` describes "Midnight Koinonia" theme:
- **Primary**: `#4d0085` ✓ Matches Stitch
- **Secondary/CTA**: `#ffbf00` (Sacred Amber) - **NOT present in Stitch theme** (Stitch uses single primary `#4d0085`)
- **Background**: `#1b0f23` - **NOT in Stitch** (Stitch relies on dark mode system colors)
- **Font**: Inter ✓ Matches Stitch

### Decision Needed
The team should decide:
1. **Keep Stitch's simpler theme** (single primary purple, system dark colors)
2. **Extend with Amber accent** as described in DESIGN.md for CTAs
3. **Use DESIGN.md full palette** and treat Stitch as layout reference only

**Recommendation**: Use Stitch for layout/structure reference, but apply the full Midnight Koinonia palette from `DESIGN.md` during React implementation for richer visual hierarchy.
