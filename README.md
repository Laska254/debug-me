# debug-me

![Three.js](https://img.shields.io/github/package-json/dependency-version/Laska254/debug-me/three?label=Three.js&color=black)
![Vite](https://img.shields.io/github/package-json/dependency-version/Laska254/debug-me/dev/vite?label=Vite&color=646cff)
[![CI](https://github.com/Laska254/debug-me/actions/workflows/ci.yml/badge.svg)](https://github.com/Laska254/debug-me/actions/workflows/ci.yml)

**Live demo: [laska254.github.io/debug-me](https://laska254.github.io/debug-me/)**

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
    - [Zones](#zones)
    - [Controls](#controls)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project status](#project-status)
- [Related repositories](#related-repositories)

---

## Overview

**debug-me** is an interactive 3D resume, built with [Three.js](https://threejs.org/) and no UI framework.

You walk in first person **inside the JVM** and debug your way through my Java skills:

- a **debug log console** prints Java-style logs about everything you discover,
- **code snippet panels** show real code from my repositories, with links to GitHub,
- **breakpoints** are the collectibles; resolve all of them to get a `BUILD SUCCESS`,
- the **Heap Dump** at the end is a full resume of everything in the game, even the parts you skipped.

In a hurry? **Skip to CV** on the start screen goes straight to the Heap Dump.

### Zones

| Zone                  | Theme            | Source                                                                     |
| --------------------- | ---------------- | -------------------------------------------------------------------------- |
| **ClassLoader**       | Start hub        | -                                                                          |
| **Stack**             | Core Java        | [AoC2015](https://github.com/Laska254/AoC2015)                             |
| **Heap**              | Backend          | [prawko-server](https://github.com/Laska254/prawko-server)                 |
| **Garbage Collector** | Quality & DevOps | [prawko-server](https://github.com/Laska254/prawko-server)                 |
| **main()**            | The Prawko story | [Prawko](https://github.com/Laska254/Prawko) → prawko-server, web, Android |

### Controls

| Action       | Desktop                   | Touch                     |
| ------------ | ------------------------- | ------------------------- |
| Move         | `W` `A` `S` `D` or arrows | joystick (bottom left)    |
| Look around  | mouse                     | drag on the right half    |
| Walk faster  | `Shift`                   | push the joystick further |
| Inspect      | `E`                       | action button             |
| Pause / menu | `Esc`                     | pause button              |

---

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm

### Debian 13

`sudo apt install nodejs npm`

### Windows

`winget install OpenJS.NodeJS.LTS`

---

## Installation

Clone repository

`git clone https://github.com/Laska254/debug-me.git`

`cd debug-me`

Install dependencies

`npm install`

---

## Usage

Run the development server

`npm run dev`

Then open `http://localhost:5173/debug-me/`. The `/debug-me/` path matches the GitHub Pages address.
On a slow GPU, add `?quality=low` to the address to turn the bloom off.

Other scripts:

| Script            | Description                        |
| ----------------- | ---------------------------------- |
| `npm run build`   | production build to `dist/`        |
| `npm run preview` | serve the production build locally |
| `npm run lint`    | ESLint and Prettier check          |
| `npm run format`  | format all files with Prettier     |

---

## Project status

Work in progress. Planned to go live in the first week of November 2026.

Progress is tracked in [issues](https://github.com/Laska254/debug-me/issues),
[milestones](https://github.com/Laska254/debug-me/milestones) and the
[Debug Me project](https://github.com/users/Laska254/projects/11).

---

## Related repositories

- [prawko-server](https://github.com/Laska254/prawko-server) - REST API in Java 21 and Spring Boot 4
- [prawko-web](https://github.com/Laska254/prawko-web) - React + TypeScript client
- [prawko-android](https://github.com/Laska254/prawko-android) - Kotlin + Jetpack Compose client
- [Prawko](https://github.com/Laska254/Prawko) - the first version, a Spring MVC + Thymeleaf monolith
- [AoC2015](https://github.com/Laska254/AoC2015) - Advent of Code 2015 in Java
