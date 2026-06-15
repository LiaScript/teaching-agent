# Task: create-visuals

## Purpose

Creates the document **Visual Style Guide**.  
Defines logo generation guidelines, course image style, website color palette, typography, and visual consistency rules.  
Ensures all visual materials across courses maintain a consistent brand identity.

## Inputs

- Title from `journal.md` → `## Outline` (`__Title:__` bullet)
- Abstract from `journal.md` → `## Outline` (`__Abstract:__` bullet)
- Professor persona from `journal.md` → `## Didactics` (`__Professor Persona:__` bullet)
- Teaching style from `journal.md` → `## Didactics` (`__Teaching Style:__` bullet)
- Difficulty level from `journal.md` → `## Didactics` (`__Difficulty Level:__` bullet)
- Course type from `journal.md` → `## Didactics` (`__Course Type:__` bullet)
- Additional preferences (optional): color schemes, visual style, brand guidelines

## Output

- `journal.md` → `## Visual Identity`
- Structure based on `templates/visuals.yaml`

## Steps

1. Read title and abstract from `journal.md` → `## Outline`.
2. Read professor persona, teaching style, difficulty level, and course type from `journal.md` → `## Didactics`.
3. Align visual identity with professor persona and teaching style.
   - Example: Playful persona → colorful, informal visuals
   - Example: Academic persona → formal, professional tones
   - Example: Technical style → clean, minimalist design
4. Ensure `journal.md` contains the LiaScript `@color` macro in the header comment before `# ...`:
   ```
   <!--
   color: <span style="display:inline-block;width:1.5rem;height:1.5rem;background-color:@0;border:1px solid #ccc;border-radius:2px;vertical-align:middle;"></span> `@0`
   -->
   ```
   If the macro is missing, add it to the header. If it already exists, leave it unchanged.
5. Define logo generation guidelines (style, format, elements, mood) aligned with persona.
6. Establish logo color palette (primary, secondary, accent, background). Every HEX color shown in `## Visual Identity` must be wrapped as `@color(#HEXCODE)`, for example `@color(#129987)`.
7. Design course image generation guidelines (visual style, composition, lighting, mood).
8. Set image consistency rules to maintain visual coherence.
9. Define website color palette (primary, secondary, accent, neutral, semantic colors). Every HEX color shown in this palette must also use `@color(#HEXCODE)`.
10. Specify typography (headings, body text, monospace fonts) matching the course style.
11. Create example prompts for logos, images, and diagrams based on course theme.
12. Fill the `templates/visuals.yaml` template with the results.
13. Save the visual style guide by creating or replacing `journal.md` → `## Visual Identity`.
14. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.

## Usage

This style guide will be referenced by the Teaching-Agent when:
- Creating logos for courses (`/create-outline`)
- Generating image prompts during material co-authoring (`/coauthor-materials`)
- Designing visual elements for the course bundle
- Ensuring consistent branding across all course materials
