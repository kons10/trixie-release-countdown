# Debian Trixie Release Countdown

A simple web page that watches for Debian 13 "Trixie" release announcements and celebrates with fireworks when it happens.

## What it does

Checks the Debian micronews feed every 30 seconds looking for Trixie release announcements. When it finds one, it verifies against the official release notes and then launches a fireworks celebration.

The page shows the 3 most recent news entries and has a live countdown showing when the next check will happen.

## Features

- Monitors Debian micronews feed automatically
- Verifies releases against official documentation
- Fireworks celebration with sound effects
- Debug console for monitoring details
- Test button to preview the fireworks
- Works on mobile devices

## How it works

1. Fetches the latest entries from Debian micronews
2. Looks for "trixie" + release keywords in titles
3. Cross-checks with the official release notes page
4. Celebrates when both sources confirm the release

Only shows news entries from August 9th, 2025 onwards to keep things current.

## Live site

Visit the live version at: `https://kivylius.github.io/trixie-release-countdown/`

You can test the fireworks using the simulation button.

## Project structure

```
docs/
├── index.html    # Main page
├── style.css     # Styling
├── script.js     # Monitoring logic
└── _config.yml   # GitHub Pages config
```

## Setting up GitHub Pages

1. Go to your repository Settings → Pages
2. Set source to "Deploy from a branch"
3. Choose "main" branch and "/docs" folder
4. Your site will be live in a few minutes

## Technical details

- Uses AllOrigins proxy to bypass CORS restrictions
- Parses Atom XML feeds with the browser's DOMParser
- Fireworks powered by the fireworks.js library
- Responsive design works on desktop and mobile

## Local development

Clone the repo and serve the docs folder:

```bash
cd docs
python -m http.server 8000
# or
npx serve .
```

Then visit `http://localhost:8000`

## Sources monitored

- Primary: [Debian Micronews](https://micronews.debian.org/feeds/atom.xml)
- Verification: [Official Release Notes](https://www.debian.org/releases/stable/releasenotes)

## Contributing

Feel free to fork this project and make it your own. It's just a fun way to monitor for the Trixie release.

## License

MIT License - do whatever you want with it.
