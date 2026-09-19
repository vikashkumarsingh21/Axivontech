# Axivon Technologies: V3 Page Design Architecture

## Core Philosophy
1. **No Universal Templates:** Each major page (Home, About, Services, Industries, Portfolio, Contact) must have a unique architectural composition suited to its specific purpose. Avoid the temptation to reuse the exact same hero layout or card grid for everything.
2. **Preserve Brand Identity:** The existing dark mode palette (background `#0f0f0f` / `#0a0a0c`, primary text `#ffffff` / `#f4f4f5`, muted text `#a1a1aa`, brand accents `#e8a064`, `#d4915c`, `#c9922a`) is strictly maintained.
3. **Real Media First:** Abstract CSS blobs, generic animated SVGs, and AI-generated fake faces are banned. Use actual product screenshots, real workspace photography, or high-quality contextual videos (e.g., Unsplash/Pexels).
4. **Cinematic & Editorial Layouts:** Use varied grid structures (e.g., asymmetrical 2-column grids), high-quality typography (tracking, leading, font weights), and strategic whitespace.

## Specific Page Archetypes

### 1. Homepage (`/`)
*   **Hero:** Left-aligned strong typography with a right-aligned contextual video or real device mockup.
*   **Trust Building:** Highlight real metrics, client logos, and actual case study teasers early in the scroll.
*   **Flow:** Should feel like a continuous narrative of business value, not just a stack of disconnected feature blocks.

### 2. Services Hub (`/services`) & Sub-pages
*   **Hub Layout:** Interactive discovery components (e.g., "What are you trying to build?"), clear pricing/tier matrices, and real workspace imagery.
*   **Sub-pages:** Must use distinct real photography per service (e.g., Robotics gets hardware photos, Web gets code/UI photos) to avoid feeling like cloned templates.

### 3. Portfolio (`/portfolio`)
*   **Visuals:** Must use actual product thumbnails or hero images of the completed work. The use of abstract motif SVGs (e.g., animated lines for "AI") is prohibited.
*   **Case Studies:** Must be detailed, showing the context, problem, objective, architecture, and live results.

### 4. Industries (`/industries`)
*   **Structure:** A dedicated page with an editorial hero featuring cross-industry collaboration photography.
*   **Grid:** Clean, card-based layout specifying the domains (K-12, Healthcare, Retail) and the exact tech stack/solutions provided for each.

### 5. Contact / Lead Gen (`/contact`)
*   **Smart Planner:** The contact form is not just a message box. It is a multi-step "Smart Project Planner" that captures project intent (Service, Timeline, Budget) before asking for personal details.
*   **CRM Integration:** Directly posts to the internal CRM (`/api/v1/public/leads`).

### 6. Blog (`/blog`)
*   **Reference Point:** The Blog Detail page is the benchmark for typography (readable line length, standard font sizing, excellent leading) and spacing.

## Component Guidelines
*   **Motion:** Use Framer Motion for elegant, non-intrusive reveal animations. Provide fallback `useReducedMotion` where necessary.
*   **Images:** All images must use Next.js `<Image>` with proper `alt` tags and `priority` optimization on hero assets.
*   **Icons:** Use `lucide-react` with consistent sizing and stroke widths (typically 1.5 to 2).
