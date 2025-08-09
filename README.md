# 🐧 Debian Trixie Release Countdown

A fun little project that monitors Debian news feeds for the release of Debian 13 "Trixie"!

## What it does

- Monitors multiple Debian news feeds (News, Security, Planet Debian)
- Looks for keywords like "trixie", "Debian 13", "released", "available"
- Shows "YES!" with fireworks when it detects a likely Trixie release
- Checks every 30 seconds automatically
- Mobile-friendly responsive design

## How it works

The app uses a scoring system based on keyword detection:

- Must find "trixie" AND ("released" OR "available")
- Must have a minimum score of 2 keyword matches
- Checks the 10 most recent entries from each feed

## Keywords being monitored

- `trixie` - The codename for Debian 13
- `debian 13` - The version number
- `released` - Release announcement keyword
- `available` - Availability keyword

## Feeds being monitored

- Debian News RSS
- Debian Security Announcements
- Planet Debian (community blog aggregator)

## GitHub Pages Deployment

The project is designed to run on GitHub Pages:

1. Enable GitHub Pages in your repository settings
2. Set source to "Deploy from a branch"
3. Select "main" branch and "/docs" folder
4. Your site will be available at `https://kivylius.github.io/trixie-release-countdown`

## Files

- `docs/index.html` - Main HTML structure
- `docs/style.css` - Styling and animations
- `docs/script.js` - Feed monitoring logic and fireworks

## Technical Notes

- Uses AllOrigins.win as a CORS proxy to fetch feeds
- Supports both RSS and Atom feed formats
- Gracefully handles feed parsing errors
- Includes celebration sound effects (when browser allows)

## Local Development

Simply open `docs/index.html` in a web browser, or serve the docs folder with any local server:

```bash
# Using Python
cd docs
python -m http.server 8000

# Using Node.js
cd docs
npx serve .
```

## Contributing

This is just a fun project!

## License

MIT License - Have fun with it! 🎉
