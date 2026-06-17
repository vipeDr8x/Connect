# Connect

**A mobile app that makes everyday communication more accessible for people with disabilities.**

![Status](https://img.shields.io/badge/status-early%20prototype-orange)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey)
![Built with Expo](https://img.shields.io/badge/built%20with-Expo-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-99.7%25-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

> ⚠️ **Project status:** Connect is in early development. The current build is a working prototype, and we are actively talking to organizations and specialists who work with people with disabilities to ground the design in real needs rather than assumptions.

---

## About the project

Connect is a cross-platform mobile application whose goal is to make communication easier and more dignified for people with disabilities. Many existing tools are either expensive, hard to use, or not adapted to how people actually communicate day to day. Connect aims to lower that barrier with a simple app that starts on a regular phone and is designed to grow into multiple ways of communicating — including support for assistive hardware such as braille devices — so it can reach people who can neither speak nor type.

We currently have a fully adapted registration flow for blind and deaf users that works simply through taps, plus a profile dialog that renders different communication options based on how the user registered.

### Who it's for

People with all kinds of communication-related disabilities who find it difficult to communicate on a daily basis.

---

## Why we're building it

People with disabilities often face friction in something most of us take for granted: being understood. We are building Connect because:

- Accessible communication tools should be available to everyone, not only to those who can afford specialized devices.
- Running on an everyday phone keeps Connect affordable and removes the up-front cost of dedicated equipment — while still being designed to work *with* assistive hardware (such as braille devices) for users who need it.
- Real accessibility comes from listening to real users, which is why we are partnering with organizations in the field before locking down the design.

---

## Features

**Available in the current prototype**
- Cross-platform mobile app (iOS and Android) built with Expo and React Native
- Fully adapted registration flow for blind and deaf users, driven by simple tap-based interaction
- Profile-based communication options that adapt to each user's needs, set during registration
- User-friendly screens for blind users and transformations based on disability (TTS -> blind, STT -> deaf)
- Theming support (light/dark and accessible color themes)

**Planned**
- Backend service for accounts, sync, and message history
- Compatibility with assistive hardware — including refreshable braille displays (output) and braille input devices — so the app can serve users who can neither see a screen nor use speech, such as deafblind users
- Online communication that connects each participant in the way most comfortable for them
- An AI guide to assist with everyday tasks
- Feedback loop with partner organizations to validate accessibility standards

---

## Tech stack

| Layer | Technology |
|---|---|
| Mobile app | React Native + Expo |
| Language | TypeScript |
| Navigation | Expo Router (file-based routing) |
| Backend (planned) | Python or C# |
| Database (planned) | SQL (PostgreSQL) |

---

## Project structure

```
Connect/
├── app/            # Screens and file-based routing
├── chat/           # Messaging / communication module
├── accessibility/  # Accessibility helpers and features
├── components/     # Reusable UI components
├── core/           # Core logic and shared utilities
├── hooks/          # Custom React hooks
├── register/       # Onboarding / registration flow
├── config/         # App configuration
├── storage/        # Local storage handling
├── themes/         # Color themes and styling
├── types/          # Shared TypeScript types
├── scripts/        # Helper scripts
└── assets/         # Images and static assets
```

---

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the app**
   ```bash
   npx expo start
   ```

From the Expo CLI output you can open the app in:
- a [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- an [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- an [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) on a physical device

You can start editing the app from the **`app/`** directory.

---

## Roadmap

- [ ] Finalize the core communication flow with input from partner organizations
- [ ] Decide and implement the backend (Python or C#)
- [ ] Connect a PostgreSQL database for persistence
- [ ] Expand accessibility features and run usability testing with real users
- [ ] Add support for external assistive hardware (refreshable braille displays and braille input) so the app works for deafblind and non-verbal users
- [ ] Prepare a first public release

---

## Screenshots

_Screenshots and a short demo of the prototype are being added by the team._

---

## License

Released under the [MIT License](https://opensource.org/licenses/MIT).

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
