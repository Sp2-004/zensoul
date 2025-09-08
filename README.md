# ZenSoul

A calming, privacy-first journaling web app with affirmations and mental health resources.

## Features

- **Journaling:** Add, view, search, edit (on a separate page), and delete entries securely.
- **Password Protection:** Your journal is protected locally by a password (saved only in your browser).
- **Affirmations:** Get a new positive affirmation on the home and journal page.
- **Dark Mode:** Fully supported for all components.
- **Stats:** See your journaling stats.
- **Mental Wellness:** Quick access to Anxiety Guide, Relaxing Music, and Emergency resources.

## Project Structure

```
src/
  components/
    Affirmation.jsx
    CalmCard.jsx
    JournalStats.jsx
    PastelButton.jsx
  pages/
    AnxietyGuide.jsx
    Emergency.jsx
    Home.jsx
    Journal.jsx
    JournalEntryDetails.jsx
    JournalEntryEdit.jsx
    RelaxingMusic.jsx
  utils/
    localStorage.js
  App.jsx
  index.js
  index.css
```

## Running Locally

1. Clone this repo
2. Run `npm install`
3. Run `npm start`

## Notes

- **No AI features implemented yet.** This is a privacy-first, client-only app.
- All data is stored in localStorage, never sent to a server.
- For best experience, use the latest version of Chrome, Edge, or Firefox.

---
