<p align="center">
  <img src="https://img.shields.io/badge/Electron-30+-47848F?style=for-the-badge&logo=electron&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

<h1 align="center">Ender Pilot</h1>

<p align="center">
  <strong>Open-source desktop app that gives your Creality Ender 3D printer a Bambu Lab Studio-like experience.</strong>
</p>

<p align="center">
  Connect via USB, monitor live, stream G-code, control every axis, and recover from crashes.<br/>
  No cloud. No account. Just you and your printer.
</p>

---

## Why Ender Pilot?

Creality's stock software is clunky. OctoPrint needs a Raspberry Pi. Pronterface looks like it's from 2005. Bambu Lab owners get a beautiful, polished experience out of the box -- Ender owners deserve the same.

**Ender Pilot** is a native desktop app that connects directly to your printer over USB and gives you full control with a modern, dark-themed interface.

## Features

### Dashboard
- **Live temperature monitoring** -- hotend and bed with real-time graph (5-minute rolling window)
- **Print progress** -- percentage, current layer, elapsed time, ETA
- **One-click connect** -- auto-detects your Ender printer (CH340 USB chip)
- **Material presets** -- PLA, PETG, ABS with correct temperatures

### Controls
- **Jog controls** -- move X/Y/Z with configurable step sizes (0.1mm to 50mm)
- **Extruder control** -- extrude and retract with directional buttons
- **Speed & flow** -- real-time sliders for print speed (10-300%), flow rate (50-200%), and fan speed
- **Filament management** -- load/unload with material presets (PLA/PETG/ABS/TPU)
- **Emergency stop** -- instant M112 kill switch
- **Quick actions** -- motors off, cool down, filament change, fan max, power off

### Files
- **Drag & drop** G-code files or use the file picker
- **Auto-analysis** -- layer count, estimated print time, filament usage, slicer detection
- **One-click print** -- select a file and start printing

### Bed Leveling
- **Z-offset adjustment** -- fine-tune in 0.01mm and 0.05mm increments
- **Auto bed leveling** -- start G29 mesh leveling from the UI
- **Manual level points** -- visual bed map with 5 probe points (corners + center)
- **Save to EEPROM** -- persist your Z-offset

### Firmware & Diagnostics
- **Firmware info** -- version, machine type, capabilities
- **Endstop status** -- real-time open/triggered indicators
- **EEPROM settings** -- steps/mm, acceleration, max feedrate, PID values
- **PID autotune** -- hotend and bed tuning from the UI
- **Factory reset** -- with confirmation dialog

### Crash Recovery
- **Auto-saves print state** every 30 seconds (configurable)
- **Resume after crash** -- app restart shows a dialog with print details
- **Smart resume sequence** -- re-heats, homes, moves to last position, continues from exact line
- **Safe repositioning** -- Z+2mm clearance before XY move to avoid dragging across print

### Terminal
- **Raw G-code console** -- send any command directly
- **Color-coded output** -- sent (teal), received (gray), errors (red)
- **Command history** -- arrow keys navigate previous commands
- **Quick buttons** -- M105, G28, M114, M503, M84

### Other
- **Print history** -- log of all prints with date, duration, and result
- **Settings** -- COM port, baud rate, printer profile, recovery options
- **Custom title bar** -- native Windows look with dark theme

## Supported Printers

Built for the **Creality Ender 3 V3 SE** but works with any Marlin-based printer over USB:

| Printer | Status |
|---------|--------|
| Ender 3 V3 SE | Fully tested |
| Ender 3 V3 KE | Should work (Marlin) |
| Ender 3 V2 | Should work |
| Ender 3 Pro | Should work |
| Ender 3 S1 / S1 Pro | Should work |
| Ender 5 series | Should work |
| CR-10 series | Should work |
| Any Marlin USB printer | Should work |

> **Note:** Printers with Klipper firmware communicate differently and are not yet supported.

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ 
- A USB cable connected to your printer

### From Source

```bash
git clone https://github.com/PrincNL/ender-pilot.git
cd ender-pilot
npm install
npm run dev
```

### Build Installer

```bash
npm run package
```

This creates a Windows installer in the `release/` folder.

## Architecture

```
src/
  main/               # Electron main process (Node.js)
    serial/            # USB serial communication
      SerialManager    # Port lifecycle, read/write
      MarlinParser     # Parses firmware responses (temps, position, errors)
      GCodeStreamer    # Line-by-line streaming with flow control
      PortScanner      # Auto-detect printer USB port
    print/             # Print job management
      PrintJobManager  # Start/pause/resume/cancel state machine
      CrashRecovery    # Periodic state snapshots + resume logic
      GCodeAnalyzer    # Pre-parse files for metadata
    storage/           # Persistence
      SettingsStore    # App settings (electron-store)
      PrintHistory     # Print log (JSON)
    ipc/               # IPC handlers bridging main <-> renderer

  renderer/            # React UI
    pages/             # Dashboard, Controls, Files, Leveling, Terminal, History, Settings
    components/        # Reusable UI components
    context/           # Global printer state (React Context)
```

### Communication Flow

```
React UI  -->  Preload (contextBridge)  -->  IPC  -->  SerialManager  -->  USB  -->  Printer
                                                          |
                                                     MarlinParser
                                                          |
                                                  Events pushed back to UI
```

### G-code Streaming

The streamer sends one command at a time, waiting for Marlin's `ok` response before sending the next line. This prevents buffer overflow and ensures reliable printing:

1. Send G-code line
2. Wait for `ok` (10s timeout, 3 retries)
3. Send next line
4. Repeat until done

### Crash Recovery

Every 30 seconds during printing, the app saves:
- Current G-code line number
- File path and hash
- Hotend/bed target temperatures
- X/Y/Z/E position
- Fan speed, feed rate, flow rate

On restart, if a recovery file exists, a dialog offers to resume. The resume sequence:
1. Heat bed and hotend to saved targets
2. Home all axes
3. Move to Z+2mm (clearance)
4. Move to saved X/Y position
5. Lower to saved Z
6. Set E position (`G92`)
7. Restore fan/speed/flow
8. Continue streaming from saved line

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Electron 30 |
| UI | React 18 + TypeScript |
| Bundler | Vite 5 |
| Serial | serialport 12 |
| Charts | Recharts |
| Storage | electron-store |
| Styling | CSS custom properties (no framework) |

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Some areas where help is needed:
- **Klipper support** -- different communication protocol
- **G-code preview** -- 2D/3D visualization of print layers
- **Slicer integration** -- built-in slicing with CuraEngine
- **Multi-language** -- i18n support
- **Linux/macOS testing** -- currently tested on Windows only
- **OctoPrint integration** -- connect to remote printers
- **Plugin system** -- extend functionality

## License

[MIT](LICENSE) -- use it, fork it, sell it, whatever. Just give credit.

## Acknowledgments

- [Marlin Firmware](https://marlinfw.org/) for the G-code protocol documentation
- [Bambu Lab](https://bambulab.com/) for UI inspiration
- The 3D printing community for feedback and testing
