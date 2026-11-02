# Axivon Mobile Application (Android Shell)

This folder contains the isolated Android mobile application shell (Capacitor WebView).

## Isolation Rules
1. **Zero Impact on Web**: This folder is strictly excluded from root `tsconfig.json`, ESLint, Prettier, Tailwind, Next.js build, and `.vercelignore`.
2. **No Repository Binaries**: No APK, AAB, keystores, or Gradle build caches may ever be committed to git.
3. **Distribution**: Built APKs are distributed strictly via GitHub Releases, keeping website deployment payloads lightweight.
