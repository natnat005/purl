# Purl

A mobile app for the crochet, knitting, and sewing community — a calm, designed space for makers to learn, share, and track their craft.

[![Made with Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo)](https://expo.dev) [![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com) [![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## About

Purl gives crafters everything they need in one place: a curated pattern library, project tracker, gauge calculator, yarn estimator, learning guides, and a community feed for sharing works in progress.

It's built around a simple idea — crafting is slow, intentional work, and the app for crafters should feel that way too. No noise, no ads, no shouting for attention. Just the tools and the community.

The app is currently in beta and launches on iOS in early 2026.

## Features

**Pattern Library** — 60+ patterns across crochet, knitting, and sewing, with sizing tools that adapt to the maker's gauge so a hat fits, a scarf is the right length, and a cowl wraps comfortably.

**Project Journal** — Track projects from cast-on to finishing, with progress bars, written notes, and photos for each one. A real digital companion to the work.

**Maker's Tools** — Gauge calculator, yarn estimator, row counter, stash tracker, and quick-reference charts for hook sizes, needle sizes, and fiber properties.

**Community Feed** — Share works in progress and finished objects, like, comment, follow other makers, and tag the pattern you used. Includes report and block flows to keep things safe.

**Craft Clubs** — Joinable communities organized by craft and technique, each with their own live chat space.

**Get Started Tool** — For beginners who don't know where to start, a 2-question helper picks the right first project, lists exactly what to buy, and gives permission to be bad at it.

**Learn & Guides** — Embedded tutorials on cast on, bind off, stitch patterns, and crafting terminology — without leaving the app.

## Architecture

Purl is built as a cross-platform mobile app using React Native with the Expo framework, backed by Firebase for authentication, data, and storage.

- **Frontend:** React Native (Expo SDK 54), JavaScript
- **Authentication:** Firebase Auth with email verification
- **Database:** Cloud Firestore with custom security rules for role-based access control
- **Storage:** Firebase Storage for project photos
- **Offline support:** AsyncStorage for persistent local state and saved patterns

## Security

Purl follows a defense-in-depth approach:

- **Authentication** handled by Firebase Auth with industry-standard password hashing and email verification
- **Authorization** enforced by Firestore Security Rules at the database level — the client-side checks exist only for UX, not security
- **Moderation features** include user reporting, user blocking, and Terms of Service acceptance on signup
- **Data minimization** — Purl only collects what's needed to run the service, never sells user data, and lets users permanently delete their accounts

## Project structure

```
StitchAndLearn/
├── App.js                  # Root component, auth gates, tab navigation
├── firebase.js             # Firebase project config
├── FIRESTORE_RULES.txt     # Security rules deployed to Firebase
├── src/
│   ├── components/         # PatternCard, TabBar, SkeletonCard, etc.
│   ├── constants/          # Theme, colors, typography
│   ├── data/               # Pattern library, learn content
│   ├── hooks/              # Custom React hooks
│   ├── screens/            # 20+ screens
│   └── utils/              # Icons, haptics, image handling
└── docs/                   # Privacy policy, ToS, community guidelines
```

## Privacy & Legal

- [Privacy Policy](https://natnat005.github.io/purl/privacy.html)
- [Terms of Service](https://natnat005.github.io/purl/terms.html)
- [Community Guidelines](https://natnat005.github.io/purl/guidelines.html)

## License

Source code is provided under the [MIT License](LICENSE). Pattern content is licensed separately and is not covered by the source code license.

## Built by

Natalie Ramirez — [natram9005@gmail.com](mailto:natram9005@gmail.com)