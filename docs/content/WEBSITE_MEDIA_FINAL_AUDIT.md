# Media Audit & Guidelines (V3)

## Objective
Establish a definitive record of all media assets used in the Axivon Technologies public website to ensure compliance with the "Real Media First" V3 directive.

## Banned Media Types
- Abstract SVG motifs serving as placeholders
- AI-generated faces representing real staff or customers
- Generic "isometric" vector illustrations (unless explicitly used for technical diagrams)

## Approved Media Directories
- `/public/assets/images/team/` - Actual staff and founder photography
- `/public/assets/images/agency/` - Real workplace, collaboration, and office environments
- `/public/assets/images/portfolio/` - Authentic screenshots of completed client work
- `/public/assets/images/services/` - Contextual photography (e.g., robots for Robotics, screens for Web)
- `/public/assets/images/blog/` - Editorial photography for articles
- `/public/assets/video/` - High-quality background loop videos (e.g., `hero-developer.mp4`)

## File Naming Conventions
- All lowercase
- Kebab-case formatting (e.g., `team-collaboration.jpg`)
- Descriptive naming (e.g., `rokhiya-khanam-co-founder.jpg` instead of `img1.jpg`)

## Ongoing Audit Rules
Any new component added to the `src/components/` directory must utilize media from the approved directories and must NOT inline abstract SVG backgrounds. CSS gradients are permitted for overlays and subtle styling.
