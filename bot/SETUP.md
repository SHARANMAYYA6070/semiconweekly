# Interview Prep bot – setup (Phase 1)

What you are setting up:

```
interview.html  (your site, GitHub Pages)
      │  asks for a question / sends the answer
      ▼
Cloudflare Worker  (bot/worker.js – holds the secret API key, counts daily use)
      │                         │
      ▼                         ▼
Google Sheet (Questions tab)   Claude API (grades the answer)
```

The answer key never reaches the browser. Students only see the question; grading happens inside the Worker.

Takes about 30 minutes. Do the steps in order.

---

## Step 1 – Publish the Questions tab as CSV

1. Open the sheet **Semicon Weekly – Interview Prep Question Bank**.
2. File → Share → **Publish to web**.
3. First box: choose **Questions** (not "Entire document"). Second box: **Comma-separated values (.csv)**.
4. Press **Publish**, confirm, and copy the link. It ends with `output=csv`.
5. Keep this link private. Do not put it in config.js or any website file. It only goes into the Worker (Step 4).

When you edit the sheet later, the bot picks up changes within about 10 minutes.

## Step 2 – Get a Claude API key

1. Go to **console.anthropic.com** and sign in (or sign up).
2. **Billing**: add a card and buy a small amount of credit to start (e.g. $5).
3. **Limits**: set a monthly spend limit, so a mistake can never cost more than you chose.
4. **API Keys** → Create key → name it `semiconweekly-interview`. Copy it now (it is shown only once).
5. Never paste this key into any website file, GitHub, or chat. It goes only into Cloudflare (Step 4).

## Step 3 – Create the Worker

1. Go to **dash.cloudflare.com** and sign up (free plan is enough).
2. Left menu: **Workers & Pages** → **Create** → **Create Worker**.
3. Name it `sw-interview` → **Deploy** (it deploys a "Hello World" first, that's fine).
4. Press **Edit code**. Delete everything in the editor.
5. Open `bot/worker.js` from your semiconweekly folder in Notepad, copy all of it, paste it into the editor.
6. Press **Deploy**.
7. Copy your Worker link shown at the top, it looks like `https://sw-interview.YOURNAME.workers.dev`.

## Step 4 – Add the Worker settings

### a) Daily-usage storage (KV)
1. Left menu: **Storage & Databases** → **KV** → **Create** → name `interview_usage` → Create.
2. Go back to your Worker → **Settings** → **Bindings** → **Add** → **KV namespace**.
3. Variable name: `USAGE` (exactly, in capitals). Namespace: `interview_usage`. Save.

### b) Variables and the secret
Worker → **Settings** → **Variables and Secrets** → **Add**:

| Type   | Name               | Value |
|--------|--------------------|-------|
| Secret | `ANTHROPIC_API_KEY` | your key from Step 2 |
| Text   | `QUESTIONS_CSV_URL` | the CSV link from Step 1 |
| Text   | `ALLOWED_ORIGINS`   | `https://semiconweekly.in,https://www.semiconweekly.in` |
| Text   | `DAILY_LIMIT`       | `10` |

Press **Deploy** / Save after adding them.

### c) Quick test
Open `https://sw-interview.YOURNAME.workers.dev/topics` in your browser.
You should see something like `{"topics":[{"name":"Verilog","count":35}, ...]}`.
If you see an error, check Step 1 and the `QUESTIONS_CSV_URL` value.

## Step 5 – Connect the website

1. Open `config.js` in your semiconweekly folder.
2. Find the line `INTERVIEW_API_URL: "",` and paste your Worker link between the quotes:
   `INTERVIEW_API_URL: "https://sw-interview.YOURNAME.workers.dev",`
3. Save, then push from PowerShell as usual:
   ```
   cd $HOME\Desktop\semiconweekly
   git add interview.html config.js bot
   git commit -m "Interview Prep bot beta"
   git push
   ```
4. After 1–2 minutes open **https://semiconweekly.in/interview.html** and try one question.

## Step 6 – Beta test (before telling everyone)

- The page is not in the main menu of other pages and is hidden from Google (`noindex`) on purpose.
- Share the link with 10–20 juniors/friends. Ask them: Was the score fair? Was the model answer correct? Was anything confusing?
- If a model answer is wrong, the fix is almost always in that row's `key_points` in the sheet.
- When you are happy: add `<a href="interview.html">Interview Prep</a>` to the menu on the other pages, remove the `noindex` line from interview.html, and add it to sitemap.xml.

## Changing things later

| You want to… | Do this |
|---|---|
| Add or fix a question | Edit the sheet. Live within ~10 minutes. |
| Hide a question | Set `active` to `no` in the sheet. |
| Change the free daily limit | Worker → Settings → Variables → `DAILY_LIMIT`. |
| See how much you're spending | console.anthropic.com → Usage. |
| See errors | Worker → **Logs** (turn on "Workers Logs" once). |

## Notes for Phase 2 (payments)

The daily limit in Phase 1 is counted per internet connection (IP address). It is good enough for a free beta, but people on the same college Wi-Fi share one limit, and someone could get around it by switching networks. Phase 2 adds Google sign-in and a per-account limit, then Razorpay for the ₹299 plan.
