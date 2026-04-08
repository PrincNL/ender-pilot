# Contributing to Ender Pilot

Thanks for your interest in contributing! This project aims to give Creality Ender owners a modern, professional printing experience.

## Getting Started

1. Fork the repo
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ender-pilot.git`
3. Install dependencies: `npm install`
4. Rebuild native modules: `npx electron-rebuild`
5. Start dev mode: `npm run dev`

## Development

```bash
npm run dev      # Start Electron with hot reload
npm run build    # Production build
npm run package  # Create Windows installer
```

### Project Structure

- `src/main/` -- Electron main process (Node.js). Serial communication, file I/O, print management.
- `src/renderer/` -- React UI. Components, pages, context, styles.
- `src/main/preload.ts` -- Bridge between main and renderer (contextBridge).

### Key Design Decisions

- **No CSS framework** -- we use CSS custom properties for theming. This keeps the bundle small and gives full control.
- **No state management library** -- React Context is sufficient for our needs. The printer state is centralized in `PrinterContext.tsx`.
- **One G-code command at a time** -- the streamer waits for `ok` before sending the next line. This is slower than buffering but much more reliable.
- **Inline styles** -- components use inline styles for simplicity. We may migrate to CSS modules if the codebase grows.

## Pull Request Guidelines

1. **One feature per PR** -- keep changes focused
2. **Test with a real printer** if possible, or at minimum verify the UI renders correctly in browser mode (without `window.api`)
3. **Follow existing patterns** -- look at how similar components are built before adding new ones
4. **No unnecessary dependencies** -- justify any new npm package in the PR description

## Areas for Contribution

### Good First Issues
- Add tooltips to buttons explaining what they do
- Add confirmation dialog before starting a print
- Improve responsive layout for smaller screens
- Add more filament presets (Nylon, PC, Wood-PLA)
- Add mm/inch toggle in settings

### Medium
- Add G-code syntax highlighting in the terminal
- Add print time estimation based on actual vs expected progress
- Add notification sounds for print complete/error
- Add dark/light theme toggle
- Export print history as CSV

### Advanced
- **G-code preview** -- render a 2D top-down view of the toolpath using Canvas
- **Klipper support** -- Klipper uses a different API (Moonraker REST API over network)
- **Slicer integration** -- embed CuraEngine WASM for in-app slicing
- **OctoPrint bridge** -- connect to remote OctoPrint instances
- **Plugin system** -- allow community extensions
- **Multi-printer** -- manage multiple printers simultaneously

## Code Style

- TypeScript strict mode
- Functional React components with hooks
- No semicolons in imports (let the bundler handle it)
- Descriptive variable names over comments
- Event-driven architecture in the main process (EventEmitter)

## Reporting Issues

When filing a bug report, please include:
- Your printer model and firmware version
- The COM port and baud rate
- Steps to reproduce
- Console output (Terminal page or Electron DevTools)
- Your OS and Ender Pilot version

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
