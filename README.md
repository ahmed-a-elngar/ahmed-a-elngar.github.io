🚀 Ahmed Elngar | Backend Architect Portfolio

A modern, responsive portfolio website highlighting backend development expertise including:
- ERP system architecture (iDara, Awazel)
- ZATCA invoice compliance integration
- Real-time vehicle tracking platforms
- SaaS product development
- REST API design and implementation

Built with HTML5, CSS3, and JavaScript. Features dark/light mode, smooth animations, and responsive design.

## Themes

The site ships multiple design themes. `index.html` is the single source of
truth for all content; a theme only supplies CSS.

```
assets/themes/
  midnight/theme.css   dark, neon-accented (default)
  editorial/theme.css  warm paper, serif display
  aurora/theme.css     animated mesh gradient, glassmorphism, bento
```

The visitor's choice is stored in `localStorage.themePack` and applied by an
inline script in `<head>` before first paint, so there is no flash of the
default theme. Colour mode (light/dark) is a separate axis stored in
`localStorage.theme` — every theme implements both.

**To add a theme:** create `assets/themes/<name>/theme.css`, then register the
name with its Google Fonts URL in the `THEMES` map in the `<head>` guard of
`index.html` (script.js reads that map back, so there is no second list) and
add an option button to the `#skinMenu` markup. Fonts are linked from `<head>`,
not `@import`ed from the theme CSS, so they load in parallel. Style every class the markup uses; there is no shared
base stylesheet, so each theme is self-contained.
