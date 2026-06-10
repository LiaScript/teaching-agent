# Task: create-logo

## Purpose

Generates a detailed logo prompt for the course based on the visual style guide, lecture outline, and didactic approach.
Creates a professional, actionable prompt that can be used with AI image generators (DALL-E, Midjourney, Stable Diffusion, etc.).

## Inputs

- Title from `project.md` → `## Outline` / `### Title`
- Abstract from `project.md` → `## Outline` / `### Abstract`
- Logo style guidelines from `project.md` → `## Visual Identity` / `### Logo Generation Guidelines`
- Logo color palette from `project.md` → `## Visual Identity` / `### Logo Color Palette`

## Output

- A detailed logo prompt (displayed as formatted text)
- Optionally saved to `assets/prompts/logo-prompt.md`

## Steps

1. Read the course title and abstract from `project.md` → `## Outline`.
2. Read the logo style guidelines from `project.md` → `## Visual Identity` / `### Logo Generation Guidelines`.
3. Read the logo color palette from `project.md` → `## Visual Identity` / `### Logo Color Palette`.
4. Extract key themes, concepts, or symbols from the abstract.
5. Combine style guidelines with course theme to create a detailed prompt.
6. Include specific elements:
   - Visual style (modern, minimalist, academic, etc.)
   - Format (flat design, line art, geometric, etc.)
   - Key symbols or metaphors from the course theme
   - Color palette (with HEX codes)
   - Mood and atmosphere
   - Technical specifications (scalable, suitable for digital/print)
7. Present the prompt in a clear, actionable format.
8. Optionally save to `assets/prompts/logo-prompt.md`.

## Output Format

The logo prompt should follow this structure:

```
Logo Prompt for [Course Title]
================================

Style: [style from style guide]
Format: [format from style guide]
Theme: [extracted from abstract]
Elements: [specific symbols, icons, or shapes]
Colors: [HEX codes from style guide]
Mood: [atmosphere from style guide]

Complete Prompt:
"[Full detailed prompt ready for image generator]"

Technical Notes:
- Resolution: Vector/high-res
- Format: SVG/PNG with transparency
- Usage: Course materials, website header, print materials
```

## Usage

This task is invoked when:
- A new course logo is needed
- The style guide has been updated
- Multiple logo variations are being explored
