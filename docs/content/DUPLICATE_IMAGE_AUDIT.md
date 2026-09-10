# Duplicate Image Audit

This audit identifies all local image assets that were being reused inappropriately across the public website.

### 1. `developer-workspace.jpg`
**Used:**
- `src/components/about/AboutHero.tsx`
- `src/data/blog-posts.ts` (Blog 1: How to Choose Website & App Development Company)

**Decision:**
REPLACE IN BLOG 1. Retain in AboutHero for company culture visual.

### 2. `office-workspace.jpg`
**Used:**
- `src/components/about/OurStory.tsx`
- `src/data/blog-posts.ts` (Blog 2: AI, IoT, Custom Software Growth)

**Decision:**
REPLACE IN BLOG 2. Retain in OurStory to show the office workspace environment.

### 3. `agency/team-collaboration.jpg`
**Used:**
- `src/components/IndustriesWeServe.tsx`
- `src/components/WhyChooseUs.tsx`

**Decision:**
REPLACE in one of the locations to ensure each section has a distinct visual hook.

### 4. `tech-circuit.jpg`
**Used:**
- `src/data/blog-posts.ts` (Blog 3: Robotics Projects)

**Decision:**
The `tech-circuit.jpg` is generic. REPLACE with a specific robotics/IoT graphic for Blog 3.

---
**Summary:**
Multiple structural images were being reused as generic "technology" placeholders for blog content and service blocks. This practice dilutes the visual identity of the pages. All blog posts and service pages will be mapped to dedicated custom technical illustrations.
