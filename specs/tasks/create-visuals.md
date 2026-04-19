# Task: create-visuals

## Purpose

Creates the document **Visual Style Guide**.  
Defines logo generation guidelines, course image style, website color palette, typography, and visual consistency rules.  
Ensures all visual materials across courses maintain a consistent brand identity.

## Inputs

- Title from `docs/outline.md#title`
- Abstract from `docs/outline.md#abstract`
- Professor persona from `docs/didactics.md#professor-persona`
- Teaching style from `docs/didactics.md#teaching-style`
- Difficulty level from `docs/didactics.md#difficulty-level`
- Course type from `docs/didactics.md#course-type`
- Additional preferences (optional): color schemes, visual style, brand guidelines

## Output

- `docs/visuals.md` (Markdown file)
- Structure based on `templates/visuals.yaml`

## Steps

1. Read title and abstract from `docs/outline.md`.
2. Read professor persona, teaching style, difficulty level, and course type from `docs/didactics.md`.
3. Align visual identity with professor persona and teaching style.
   - Example: Playful persona → colorful, informal visuals
   - Example: Academic persona → formal, professional tones
   - Example: Technical style → clean, minimalist design
4. Define logo generation guidelines (style, format, elements, mood) aligned with persona.
5. Establish logo color palette (primary, secondary, accent, background with HEX codes).
6. Design course image generation guidelines (visual style, composition, lighting, mood).
7. Set image consistency rules to maintain visual coherence.
8. Define website color palette (primary, secondary, accent, neutral, semantic colors).
9. Specify typography (headings, body text, monospace fonts) matching the course style.
10. Create example prompts for logos, images, and diagrams based on course theme.
11. Fill the `templates/visuals.yaml` template with the results.
12. Save the file as `docs/visuals.md`.

## Usage

This style guide will be referenced by the Teaching-Agent when:
- Creating logos for courses (`/create-outline`)
- Generating image prompts during material co-authoring (`/coauthor-materials`)
- Designing visual elements for the course bundle
- Ensuring consistent branding across all course materials
