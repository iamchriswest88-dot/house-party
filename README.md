# House Party Quiz — putting it online

Players join on their phones with a 4-letter room code. No accounts needed.

## What's in the folder

| File | What it does |
|---|---|
| `public/index.html` | The whole game: host screen, phone controller, all rounds and questions |
| `server.js` | A tiny server that serves the page and passes messages between phones and the big screen |
| `package.json` | Tells the host which software to install |

To add or edit questions, open `public/index.html` and look for `const ROUNDS = [` near the top of the script.

---

## Step 1 — Put the files on GitHub (5 min)

1. Create a free account at **github.com** if you don't have one.
2. Click **+** (top right) → **New repository**. Name it `house-party-quiz`, leave it **Public** or **Private**, and click **Create repository**.
3. On the next page click **uploading an existing file**.
4. Drag in `server.js`, `package.json`, `README.md` and the whole `public` folder. Click **Commit changes**.

## Step 2 — Host it on Render (5 min, free)

1. Go to **render.com**, sign up with your GitHub account.
2. Click **New +** → **Web Service** → pick your `house-party-quiz` repository.
3. Fill in:
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free
4. Click **Deploy**. After a couple of minutes you'll get a web address like `https://house-party-quiz.onrender.com`. Open it — the game is live.

## Step 3 — Use your own domain (optional, 10 min)

1. Buy a domain from any registrar (Namecheap, 123-reg, Cloudflare, GoDaddy…). Something like `housepartyquiz.co.uk` is typically under £10 a year.
2. In Render, open your service → **Settings** → **Custom Domains** → **Add Custom Domain**. Enter it (e.g. `quiz.yourdomain.co.uk` or `yourdomain.co.uk`).
3. Render shows you the DNS record to add. Copy it into your registrar's **DNS settings**:
   - For a subdomain like `quiz.yourdomain.co.uk`: a **CNAME** record pointing to your `….onrender.com` address.
   - For the bare domain `yourdomain.co.uk`: the **A** record (or ALIAS/ANAME) Render tells you.
4. Back in Render, click **Verify**. It can take from a few minutes up to a few hours for DNS to update. Render adds the padlock (HTTPS) automatically.

## On the night

- **Wake it up first.** Free Render services go to sleep after 15 minutes with no visitors and take about a minute to wake. Open the site on the TV 5 minutes before guests arrive.
- Open the site on the TV → **Host a game**. Guests open the same address on their phones → **Join on phone** → type the code.
- Space bar (or the button) moves the game on.
- If a phone drops off Wi-Fi, it rejoins automatically within a few seconds and keeps its answers.
- Free tier allows 750 running hours a month — far more than you'll need.

## Updating the game later

Edit the files on GitHub (click a file → pencil icon → **Commit changes**). Render redeploys automatically within a couple of minutes.

## Running it on your own computer (optional)

Install Node.js 18+, then in this folder run `npm install` and `npm start`, and open http://localhost:3000. Phones on the same Wi-Fi can join using your computer's local IP address, e.g. `http://192.168.1.20:3000`.
