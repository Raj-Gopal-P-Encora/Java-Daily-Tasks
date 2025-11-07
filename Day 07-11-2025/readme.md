# Restaurant Website

A simple static restaurant website built with plain HTML, CSS and images. This repository contains a small multi-page site (Home, Menu, About, Contact) suitable for demonstration, learning, and hosting on GitHub Pages.

## Screenshot

(See attached image in the project) — a sample header/banner used on the homepage.

## Features

- Multi-page static site (no backend required)
- Uses plain HTML and CSS, with images stored in `img/`
- Easy to host on GitHub Pages or any static hosting provider

## Project structure

```
restraunt-website/
├─ index.html         # Home page
├─ about.html         # About page
├─ contact.html       # Contact page
├─ menu.html          # Menu page
├─ css/
│  └─ style.css       # Main styles
└─ img/               # Images used by the site
```

## How to view locally

Option A — open in browser (quick):
1. Open the project folder in File Explorer.
2. Double-click `index.html` to open it in your default browser.

Option B — run a simple local HTTP server (recommended for correct asset loading):

PowerShell (Windows builtin):

```powershell
# from the project folder
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Or using Node (if you have http-server installed):

```powershell
npx http-server -p 8000
# then open http://localhost:8000
```

## Deployment to GitHub Pages

1. Create a new repository on GitHub and push this project (or push to an existing repo).

PowerShell example (run inside the project folder):

```powershell
git init
git add .
git commit -m "Initial commit - restaurant website"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

2. Enable GitHub Pages in the repository Settings → Pages. Choose branch `main` and folder `/ (root)` or use `gh-pages` branch if you prefer.

3. After a few minutes your site will be live at `https://<your-username>.github.io/<repo-name>/`.

## Customization

- Edit `css/style.css` to change colors, spacing, fonts.
- Replace images in `img/` with your own assets.
- Edit the HTML pages (`index.html`, `menu.html`, etc.) to update content.

## Notes & tips

- If vertical spacing in a box looks larger than expected, check default heading margins (e.g., `h1 { margin: 0; }`) — many browsers add top/bottom margins to headings which add to container padding.
- Use browser DevTools (F12) → Computed to inspect margins and padding.

## License

This project is provided under the MIT License. See LICENSE file if included.

## Author

Raj Gopal Paithara
