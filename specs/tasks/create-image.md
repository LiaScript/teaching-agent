# Task: create-image

## Purpose

Generates a detailed image prompt for course materials based on a user description, aligned with the visual style guide.
Creates professional, actionable prompts for AI image generators that maintain visual consistency with the course identity.

## Command

`:create-image {number} {type} {description}` — `{number} {type}` identify the target session; `{description}` is what should be visualized.

- If `{number} {type}` are omitted and exactly **one** session exists in `journal.md` → `## Sessions`, use that session without asking.
- If `{number} {type}` are omitted and **multiple** sessions exist, ask which session the image belongs to (numbered list).

## Inputs

- User description: what should be visualized (provided as command parameter)
- Target session: `{number} {type}` → the matching `### {number}. {title}` subsection in `journal.md` → `## Sessions`
- Image style guidelines from `journal.md` → `## Visual Identity` (`__Course Image Generation Guidelines:__` bullet)
- Website color palette from `journal.md` → `## Visual Identity` (`__Website Color Palette:__` bullet)
- Course context from `journal.md` → `## Outline` (`__Abstract:__` bullet) (for thematic alignment)
- Course language from `journal.md` → `## Course Context` (Language field — for in-image text language)

## Output

- A detailed image prompt (displayed as formatted text)
- Always saved as a `<section>` entry inside the target session's `#### Images` block in `journal.md` → `## Sessions` → `### {number}. {title}` (the `#### Images` block is created automatically if it does not exist)

## Steps

1. Receive user description of what should be visualized.
2. Read image style guidelines from `journal.md` → `## Visual Identity` (`__Course Image Generation Guidelines:__` bullet).
3. Read color palette from `journal.md` → `## Visual Identity` (`__Website Color Palette:__` bullet).
4. Read course theme from `journal.md` → `## Outline` (`__Abstract:__` bullet) for context.
5. Read course language from `journal.md` → `## Course Context` (Language field, e.g., `de`, `en`). If `journal.md` → `## Course Context` is unavailable, infer the language from the user's description as fallback.
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
11. Derive a `{slug}` from the description (kebab-case).
12. Save into the target session's `#### Images` block — always, without asking:
    - Locate the `### {number}. {title}` subsection in `journal.md` → `## Sessions`.
    - If it has no `#### Images` block, create one (placed after `**References:**`, before `#### Validation Report` if present).
    - Append a new `<section>` entry using the **Journal Entry Format** below. If a `<section>` with the same `#### {slug}` already exists, replace it.
    - Confirm: "Prompt saved: `journal.md` → `## Sessions` → `### {number}. {title}` → `#### Images` → `{slug}`"

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
- In-image text language: [language from `journal.md` → `## Course Context`, e.g., "German" / "English"]

Complete Prompt:
"[Full detailed prompt ready for image generator. If the image contains visible text, end with: 'All text visible in the image (labels, headings, UI elements) must be written in [language].']" 

Accessibility:
Alt text suggestion: "[Descriptive alt text for the image]"

Technical Specifications:
- Aspect ratio: [16:9/4:3/1:1/custom]
- Format: PNG/JPG/SVG
- Usage: [Slide/Handout/Web/etc.]
```

## Journal Entry Format

Each image is stored as one `<section>` inside the session's `#### Images` block. The image is **always** embedded — the `![…]` line renders the PNG once `:generate-image` has saved it (and shows as a broken-image placeholder until then, which is the intended "not yet generated" signal).

```markdown
#### Images

<section>

#### {slug}

* __Datei:__ assets/images/{slug}.png
* __Status:__ prompt-ready
* __Alt-Text:__ {descriptive alt text}
* __Prompt:__
  "{full detailed prompt ready for image generator}"

![{alt text}](assets/images/{slug}.png)

</section>
```

- `__Status:__` starts as `prompt-ready`; `:generate-image` flips it to `generated` after saving the PNG.
- One `<section>` per image; multiple images stack under the same `#### Images` block.

## Special Features

- Suggests diagram alternatives (Mermaid, ASCII art) if appropriate
- Offers multiple prompt variations for different styles
- Can generate prompts for image series (maintaining consistency)
- Considers educational context and pedagogical goals

## Usage

This task is invoked when:
- Creating images for lecture materials (`:coauthor-materials`)
- Designing diagrams or illustrations
- Generating visual aids for specific concepts
- Creating consistent imagery across sessions
