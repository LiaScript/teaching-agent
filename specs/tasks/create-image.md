# Task: create-image

## Purpose

Generates a detailed image prompt for course materials based on a user description, aligned with the visual style guide.
Creates professional, actionable prompts for AI image generators that maintain visual consistency with the course identity.

## Inputs

- User description: what should be visualized (provided as command parameter)
- Image style guidelines from `project.md` → `## Visual Identity` / `### Course Image Generation Guidelines`
- Website color palette from `project.md` → `## Visual Identity` / `### Website Color Palette`
- Course context from `project.md` → `## Outline` / `### Abstract` (for thematic alignment)
- Course language from `project.md` → `## Course Context` (Language field — for in-image text language)

## Output

- A detailed image prompt (displayed as formatted text)
- Always saved to `assets/prompts/image-{slug}.md` (created automatically if folder does not exist)

## Steps

1. Receive user description of what should be visualized.
2. Read image style guidelines from `project.md` → `## Visual Identity` / `### Course Image Generation Guidelines`.
3. Read color palette from `project.md` → `## Visual Identity` / `### Website Color Palette`.
4. Read course theme from `project.md` → `## Outline` / `### Abstract` for context.
5. Read course language from `project.md` → `## Course Context` (Language field, e.g., `de`, `en`). If `project.md` → `## Course Context` is unavailable, infer the language from the user's description as fallback.
6. Analyze user description and extract:
   - Main subject/concept
   - Required elements or details
   - Intended use (diagram, illustration, header, etc.)
7. Combine user description with style guide parameters:
   - Visual style (photorealistic, illustrated, flat, etc.)
   - Color scheme (using palette from style guide)
   - Composition approach
   - Lighting and mood
   - Educational context
   - **In-image text language:** if the image may contain any visible text (labels, headings, titles, UI elements, captions), explicitly specify in the prompt that all such text must be in the course language (e.g., `"All text visible in the image must be written in German."`)
8. Generate a detailed, actionable prompt.
9. Include accessibility considerations (alt text suggestion).
10. Present the prompt in a clear format.
11. Save to `assets/prompts/image-{slug}.md` — always, without asking.
    Create the folder if it does not exist.
    Confirm: "Prompt saved: `assets/prompts/image-{slug}.md`"

## Output Format

The image prompt should follow this structure:

```
Image Prompt: [Brief Title]
============================

Description: [User's original description]
Context: [Course theme alignment]
Intended Use: [Diagram/Illustration/Header/etc.]

Visual Parameters:
- Style: [from style guide]
- Color scheme: [specific colors from palette]
- Composition: [layout approach]
- Lighting: [lighting style]
- Mood: [atmosphere]
- In-image text language: [language from `project.md` → `## Course Context`, e.g., "German" / "English"]

Complete Prompt:
"[Full detailed prompt ready for image generator. If the image contains visible text, end with: 'All text visible in the image (labels, headings, UI elements) must be written in [language].']" 

Accessibility:
Alt text suggestion: "[Descriptive alt text for the image]"

Technical Specifications:
- Aspect ratio: [16:9/4:3/1:1/custom]
- Format: PNG/JPG/SVG
- Usage: [Slide/Handout/Web/etc.]
```

## Special Features

- Suggests diagram alternatives (Mermaid, ASCII art) if appropriate
- Offers multiple prompt variations for different styles
- Can generate prompts for image series (maintaining consistency)
- Considers educational context and pedagogical goals

## Usage

This task is invoked when:
- Creating images for lecture materials (`/coauthor-materials`)
- Designing diagrams or illustrations
- Generating visual aids for specific concepts
- Creating consistent imagery across sessions
