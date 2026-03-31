# Design System: Midnight Koinonia
**Project ID:** 6022596809973417466

## 1. Visual Theme & Atmosphere
**The Digital Sanctuary**: The design system blends spiritual solemnity with high-tech precision. It moves away from the clinical "SaaS" look by embracing deep, atmospheric gradients, high-contrast accents (Amber on Deep Violet), and an editorial layout that prioritizes focus and immersion. The system rejects the standard grid in favor of layered depth, where elements appear to float in a vast, dark space.

## 2. Color Palette & Roles
- **Spiritual Violet Primary** (`#4d0085`): Acts as the anchor, representing authority and community depth. Used for primary actions.
- **Sacred Amber Secondary** (`#ffbf00`): Used sparingly for critical CTAs and highlights, providing a warm, candle-like glow against the dark background.
- **Midnight Canvas Background** (`#1b0f23`): The base canvas.
- **Deep Violet Surface** (`#2d1345`): Floating cards and active areas.
- **Muted Lavender Text** (`#cec2d3`): Secondary text on dark surfaces.
- **Bright White Text** (`#f1eef4`): Primary text on dark surfaces.
- **Amber Text** (`#281d00`): Dark text used on top of Amber buttons.

## 3. Typography Rules
- **Font Family**: Inter. Bridging the gap between modern tech and legible communication.
- **Display**: 3rem (48px) - Extra bold, tracking-tight. Hero statements.
- **Headline**: 1.875rem (30px) / 1.5rem (24px) - Bold. Section titles.
- **Body L**: 1.25rem (20px) - Light/Regular for intro paragraphs.
- **Body M**: 0.875rem (14px) - Standard UI text and form labels.
- **Small/Label**: 0.75rem (12px) - Uppercase tracking-wide metadata and footer links.

## 4. Component Stylings
- **Buttons**:
    - *Primary:* Solid Amber (`#ffbf00`) with Deep Violet text. Bold typography.
    - *Ghost:* Transparent with an outline border and hover state that fills with a primary tint.
- **Input Fields**: Deep violet backgrounds with a subtle border. On focus, the border transitions to Amber with a soft outer glow.
- **Cards/Containers**: `backdrop-blur-xl` on containers to create a frosted glass effect that allows the underlying radial glow to peak through. Subtle violet border.
- **Chips/Badges**: High contrast Amber background with primary text and italicized font style.

## 5. Layout Principles
- **No-Line Sectioning**: Sectioning achieved through color blocks and radial gradients. Avoid 1px borders for structural separation; use background shifts instead.
- **Layered Depth**: Elevate content by moving from the base background to a backdrop-blur card.
- **Ambient Shadows**: Use `shadow-2xl` for main login containers and hero images to create a massive, soft lift. Use `shadow-lg` for primary buttons to suggest glowing objects.
- **Light Sources**: Absolute-positioned radial blurs (20% opacity, 120px blur) in corners to simulate environmental lighting.
