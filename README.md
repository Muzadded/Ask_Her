# 💕 K-Drama Date Invite

A dreamy, interactive K-pop inspired website to ask someone on a date — with a runaway "No" button, confetti, step-by-step planning, and email notifications.

## Quick start

1. **Set your email** in `js/config.js`:

   ```js
   recipientEmail: "youremail@gmail.com",
   ```

2. **Open the site** locally:

   ```bash
   cd /home/muzadded/Documents/Personal/Ask_out
   python3 -m http.server 8080
   ```

   Then visit [http://localhost:8080](http://localhost:8080)

3. **Activate FormSubmit** (required — one time):  
   - Submit the form once yourself (finish all 5 steps).  
   - Check **muzaddedchowdhury@gmail.com** inbox **and Spam/Promotions** for an email from **FormSubmit**.  
   - Click **“Activate Form”** in that email.  
   - After that, every real submission from her will email you the date details.

   **Do not open the site as `file://`** (double-clicking `index.html`). Use `python3 -m http.server 8080` or deploy to Netlify — otherwise emails never send.

### Email not arriving?

| Problem | Fix |
|--------|-----|
| Never got any FormSubmit email | Submit once via **http://localhost:8080** or your live URL, then check **Spam** |
| She sees the green message but you get nothing | You still need to click **Activate** in FormSubmit’s first email |
| Opened HTML file directly | Run a local server or deploy — FormSubmit blocks `file://` |
| Activated but still nothing | Wait 2–5 min; check Spam; try submitting again |

Last submission is also saved in the browser as `dateInviteLastSubmission` in localStorage (DevTools → Application) as a backup.

## Goblin OST music

1. Save **Stay With Me** (Goblin soundtrack) as `assets/audio/goblin-stay-with-me.mp3`.
2. Use a copy you own (download, purchase, etc.).
3. Tap **Goblin OST** 👻 on the site to play.

See `assets/audio/README.md` for details.

## Customize

Edit `js/config.js`:

| Option | Description |
|--------|-------------|
| `recipientEmail` | Where date details are sent |
| `polaroidPhotos` | Array of image paths for floating polaroids & slideshow |
| `musicUrl` | Goblin OST path — default `assets/audio/goblin-stay-with-me.mp3` (you add the file) |
| `musicLabel` | Music button label (default `Goblin OST`) |
| `dateLabel` | e.g. `"this Friday"` |
| `herName` | Used in the opening message |

### Add photos

1. Create a `photos/` folder
2. Add images (e.g. `photos/us1.jpg`)
3. Update `polaroidPhotos` in config:

   ```js
   polaroidPhotos: ["photos/us1.jpg", "photos/us2.jpg"],
   ```

## Deploy (share the link)

Free static hosting options:

- **Netlify** — drag & drop the folder at [netlify.com/drop](https://app.netlify.com/drop)
- **GitHub Pages** — push repo and enable Pages
- **Vercel** — `npx vercel` in this folder

No build step required — pure HTML/CSS/JS.

## Email alternatives

### FormSubmit (default)

Already wired in `js/main.js`. Free, no backend. Set `recipientEmail` in config.

### EmailJS

1. Sign up at [emailjs.com](https://www.emailjs.com/)
2. Create a service + template
3. Replace `sendEmail()` in `js/main.js` with EmailJS SDK calls

## Features

- ✨ Loading screen with love meter
- 💕 Typewriter romantic invite
- 🏃 Runaway "No" button (mouse + touch)
- 🎉 Confetti + chime on "Yes"
- 📋 4-step wizard (time, place, food, K-pop vibe)
- 🎨 Theme accents per K-pop group
- 📧 Email summary on submit
- 🎵 Optional background music toggle
- 📱 Mobile responsive

Made with love for an unforgettable Friday date 💖
