@AGENTS.md

# VedaAI Figma/MCP Integration Rules

This document describes the verified conventions of the repository and the rules to follow when translating Figma designs into this codebase. Treat the existing implementation as the source of truth. Do not assume that a typical shadcn, Storybook, CSS Modules, or token-pipeline setup exists here.

## Repository Snapshot

- Framework: Next.js `16.3.3` App Router with React `19.2.8` and TypeScript.
- Package manager: pnpm `10.33.2` (`package.json` declares the package manager).
- Styling: Tailwind CSS `4` through `@tailwindcss/postcss`, with one global stylesheet.
- Build: Next.js compiler/bundler; `next dev`, `next build`, and `next start` are the project scripts.
- Icons: `lucide-react`.
- Figma MCP: `.vscode/mcp.json` points both configured server entries at `https://mcp.figma.com/mcp`.
- Feature state: in-memory React Context state; there is no database, API route, or persistence layer in the current tree.

## Design System Structure

### 1. Token Definitions

There is no standalone token file, JSON token format, Style Dictionary setup, or token transformation pipeline. The current design system is split between a very small CSS-variable layer and literal Tailwind utilities:

- Global theme variables live in [app/globals.css](app/globals.css).
- Tailwind theme aliases are declared with the v4 `@theme inline` block in that file.
- Most Figma-derived values currently appear as arbitrary Tailwind values in components, for example `bg-[#FF5623]`, `rounded-[40px]`, `lg:w-[1100px]`, and `gap-[36px]`.
- Tailwind's built-in gray, emerald, white, and black utilities are also used.

Current global pattern:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

Rules for Figma integration:

1. Reuse `--background`, `--foreground`, and the font variables when they match the design.
2. For a new recurring Figma value, prefer adding a named CSS variable and exposing it through `@theme inline` rather than repeating arbitrary values across components. Keep this change deliberate and scoped; do not invent a large token taxonomy without a design requirement.
3. Preserve the existing visual vocabulary: charcoal surfaces, light gray page surfaces, and orange accent values such as `#FF5623` and `#E96A44` are established patterns.
4. Treat spacing, radii, widths, and shadows as component-level values unless the same value is clearly a shared design token.
5. Do not add a token transformation dependency or generated token artifacts unless the user explicitly asks for a token pipeline.

Typography is loaded in [app/layout.tsx](app/layout.tsx) with `next/font/google`: `Geist`, `Geist_Mono`, and `Bricolage_Grotesque`. The font variables are attached to `<html>`. Body currently specifies `Arial, Helvetica, sans-serif`, while components explicitly use `font-sans`, `font-geist-sans`, or the Bricolage variable. When implementing Figma typography, use these existing font variables first and avoid adding a new font package casually.

### 2. Component Library

Reusable UI components are in [app/components](app/components):

- `Header.tsx` provides the shared top bar, account controls, and responsive navigation affordances.
- `Sidebar.tsx` provides the desktop navigation and school profile area.
- `UploadCard.tsx` is a stateful client component for PDF selection, display, and removal.
- `UploadSection.tsx` composes the two upload cards and the start action.

The extracting route has route-local components in [app/extracting/components](app/extracting/components), including `ExtractingContainer`, `ExtractingAnimation`, `ExtractingStatus`, and `ExtractingProgressTracker`. Route-local components should stay near the route when they are not reused elsewhere. Shared components belong in `app/components`.

The architecture is functional React components with TypeScript props. Components compose markup and Tailwind classes; there is no class-based UI layer, component registry, Storybook, MDX documentation, or published component package. Client-only behavior is marked with a top-level `"use client"` directive, as in `UploadCard.tsx` and the extracting components. Keep server components server-side unless they need browser APIs, state, event handlers, or client hooks.

Representative composition:

```tsx
// app/page.tsx
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import UploadSection from "./components/UploadSection";

export default function Home() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen ...">
      <Sidebar />
      <main className="flex-1 flex flex-col ...">
        <Header />
        <UploadSection />
      </main>
    </div>
  );
}
```

When adapting Figma output, split a large screen into meaningful components and pass behavior through typed props. Do not create wrapper components only to hide a long class string. There are currently no component tests or visual regression tests in the repository; manually verify affected routes after UI changes.

### 3. Frameworks and Libraries

The UI is React in the Next.js App Router. TypeScript is strict (`tsconfig.json`), JSX uses the automatic React transform, and the path alias `@/*` maps to the repository root. CSS is processed by PostCSS using `@tailwindcss/postcss` in [postcss.config.mjs](postcss.config.mjs). Dependencies relevant to UI integration are:

```json
{
  "next": "16.3.3",
  "react": "19.2.8",
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4",
  "lucide-react": "^1.34.0"
}
```

Do not introduce another UI framework, styling system, or component library for a Figma screen when Tailwind and the existing React components are sufficient. Follow the Next.js version-specific guidance in `AGENTS.md` and the installed Next.js docs before using unfamiliar Next APIs.

## Asset and Icon Rules

### 4. Asset Management

Static assets are stored in [public](public) and referenced from the site root. The only non-template raster asset currently used by the application is `public/fdadf59d77be69f6cf33cea431ae7b6872c093fe.png`, rendered by `next/image` in `UploadSection.tsx`:

```tsx
import Image from "next/image";

<Image
  src="/fdadf59d77be69f6cf33cea431ae7b6872c093fe.png"
  alt="Illustration"
  width={139}
  height={139}
  className="object-contain"
/>;
```

The remaining `public` files are default Next/Vercel SVG assets and are not part of the application design system. There is no configured CDN, `images.remotePatterns`, custom loader, video pipeline, or asset transformation script in [next.config.ts](next.config.ts). `next/image` supplies optimization behavior for local images; use it for meaningful raster images and provide stable dimensions or aspect ratios. Use root-relative paths for local public assets. Do not reference a Figma export through a temporary remote URL or base64 data URI.

For a new Figma asset, give it a descriptive stable filename, place it under `public/` (or a clearly scoped subdirectory), reference it with `next/image` when appropriate, and include useful alternative text. Do not add decorative Figma exports when CSS or an existing icon can express the same shape.

### 5. Icon System

Icons are not stored as an internal icon folder. Components import named icons from `lucide-react`, for example:

```tsx
import { ArrowLeft, Bell, Menu } from "lucide-react";

<button aria-label="Back">
  <ArrowLeft size={20} strokeWidth={1.5} />
</button>;
```

Use the closest named Lucide icon for Figma controls. Preserve the existing convention of explicit `size` and usually `strokeWidth={1.5}` or `2`. There is no repository-specific icon filename or naming convention because icons are package exports. Use PascalCase Lucide names, not hand-authored SVGs, unless the Figma artwork is genuinely brand-specific and cannot be represented by Lucide. Existing extracting animation sparkles are inline SVGs and are an exception for bespoke artwork.

Icon-only buttons should have an accessible label or `title`; the current code uses `title` for the extraction cancel control, so retain that pattern and improve it where needed.

## Styling Approach

### 6. CSS and Responsive Behavior

The project uses utility-first Tailwind CSS in JSX, not CSS Modules, styled-components, Sass, or a CSS-in-JS library. [app/globals.css](app/globals.css) is imported once by the root layout and contains the Tailwind import, root variables, dark preference overrides, body defaults, and a `.no-scrollbar` utility. There are no other CSS files.

Use Tailwind classes for component styling. Use `className` composition for state variants, as `UploadCard.tsx` and `Sidebar.tsx` do. Keep global CSS for genuinely global behavior, fonts, variables, and browser-level adjustments.

Responsive behavior is implemented with Tailwind breakpoints, primarily `sm:` and `lg:`. The desktop shell switches from a column to a row, hides the sidebar on smaller screens, and changes fixed dimensions and gaps at `lg`:

```tsx
<div className="flex flex-col lg:flex-row min-h-screen lg:h-screen ...">
  <Sidebar />
  <main className="flex-1 ... min-h-full lg:h-full ...">
    <Header />
    <UploadSection />
  </main>
</div>
```

Rules for Figma screens:

- Start with the existing mobile-first classes, then add `sm:`/`lg:` changes for the supplied desktop frame.
- Preserve stable dimensions for controls and illustrations; use `min-w-0`, `shrink-0`, `aspect-ratio`, or responsive width/height utilities where content could resize a layout.
- Reuse the current rounded surfaces and restrained shadows rather than nesting decorative cards.
- Keep interactive states explicit: hover, disabled, selected, focus, and upload/removal states should remain visible in the class logic.
- Check both the upload route `/` and the extracting route `/extracting` at narrow and wide widths after changing shared shell components.

## Project Structure and Feature Organization

The current organization is route-first:

```text
app/
	layout.tsx                 # fonts, metadata, global provider, globals.css
	page.tsx                   # upload route shell
	components/                # shared shell and upload UI
	extracting/page.tsx        # extracting route shell
	extracting/components/    # extracting-only UI
	results/page.tsx          # results route shell
	results/components/       # mapping, grading, and document viewer UI
	context/AssessmentContext.tsx
	hooks/                     # hook facades and shared state access
	types/assessment.ts        # domain interfaces and status unions
	data/                     # sample assessment data used by the extraction demo
	globals.css
public/                      # local static assets
.vscode/mcp.json             # Figma MCP server configuration
```

State is grouped by domain in `AssessmentContext.tsx`: document upload, assessment progress, and assessment results each have a context, with a combined facade context. Hooks in `app/hooks` re-export those accessors. Domain contracts are centralized in `app/types/assessment.ts`; preserve those types when adding UI for questions, answers, bounding boxes, grading, and progress.

Keep new route screens under `app/<route>/page.tsx`, route-only components under that route's `components/`, shared UI under `app/components/`, domain state in the existing context/hooks pattern, and shared domain shapes in `app/types/`. Use Next navigation (`next/navigation`) for route transitions, as `UploadSection.tsx` does.

The results feature demonstrates the domain model in the UI: `QuestionMappingCard` renders a question and optional `AnswerMapping`, while `DocumentViewer`, `DocumentPageCanvas`, and `BoundingBoxOverlay` use normalized `BoundingBox` values to connect a selected question to the answer sheet. Preserve this relationship when translating the results screen; visual changes must not break question selection, page navigation, zoom, bounding-box visibility, or transcription toggles.

## Figma/MCP Implementation Workflow

When a Figma design is supplied:

1. Inspect the target route and nearest existing component before generating code. Identify whether the design belongs to the upload shell, extracting flow, or a new route.
2. Use the Figma MCP design-to-code workflow and adapt its output to these conventions. Reuse `Header`, `Sidebar`, `UploadCard`, `UploadSection`, Lucide icons, `next/image`, and the Assessment hooks where their responsibilities match.
3. Translate Figma variables into existing CSS variables or Tailwind utilities. Promote repeated values to `globals.css` only when they are true shared tokens.
4. Keep server/client boundaries intact. Figma markup that uses events, `File`, `useRouter`, context, or hooks belongs in a client component.
5. Put imported assets in `public/`, use stable local paths, and verify dimensions and alt text. Replace generic generated SVG icons with Lucide where possible.
6. Preserve behavior while changing presentation: file input reset/removal, `isUploadReady`, progress state, cancellation, and route transitions are functional contracts.
7. Run `pnpm lint` and `pnpm build` after implementation. The current lint baseline contains errors in `useDocumentViewer.ts`, `useExtractionProcess.ts`, and `QuestionMappingCard.tsx`, plus unused-import/prop warnings in several UI files. Report those pre-existing findings clearly and do not hide them as styling changes.

The intended result is a Figma translation that looks faithful while remaining idiomatic to this repository: App Router pages, functional typed React components, Tailwind v4 utilities, a small CSS-variable layer, local optimized assets, and Lucide icons.
