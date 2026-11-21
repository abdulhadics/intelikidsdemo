# IntelliKids First Increment Demo

Run the demo on the presentation laptop using localhost. The student journey uses the original app's landing page, header, login layout and dashboard navigation. The first increment connects two Grade 3 maths lessons, optional live focus feedback, an objective checkpoint per lesson and progress stored in SQLite.

- [SRDS draft](SRDS.md)
- [SRS handoff and committee Q&A](PARTNER-SRS-BRIEF.md)
- [Local run commands and Vercel setup](RUN-DEMO.md)

## Run in front of the committee

From the demo folder, double-click **Start-Demo.cmd** or use PowerShell:

```powershell
.\Start-Demo.cmd
```

Wait for **Demo ready** and open [IntelliKids](http://127.0.0.1:4200) in Edge or Chrome. The launcher starts Angular, Strapi and Flask and checks all three before reporting ready. Keep the terminal open throughout the presentation. Press Ctrl+C when you finish.

| Demo student | Value |
| --- | --- |
| Email | `student@intellikids.test` |
| Password | `IntelliKids30!` |

## Run Angular, Strapi and Flask in separate terminals

After the one-time setup, open three PowerShell terminals at the root of this repository. If `Start-Demo.cmd` is running, stop it first to free ports 1337, 5000 and 4200. Keep each terminal open so you can show its logs during the demo.

### Terminal 1 — Strapi backend

```powershell
Set-Location '.\backend'
npm exec --offline --yes --package=node@20.19.6 -- node start-demo.js
```

Wait for Strapi's startup summary. The health endpoint returns HTTP `204` with an empty body. [Strapi health check](http://127.0.0.1:1337/_health)

### Terminal 2 — Flask focus model

```powershell
Set-Location '.\distractionModel'
if (Test-Path '..\.venv\Scripts\python.exe') {
    ..\.venv\Scripts\python.exe -u distraction_api.py
} else {
    py -3.13 -u distraction_api.py
}
```

Wait for Flask to print `Running on http://127.0.0.1:5000`. The health endpoint returns `{"status":"ready"}`. [Flask health check](http://127.0.0.1:5000/health)

### Terminal 3 — Angular frontend

```powershell
Set-Location '.\frontend'
npm exec --offline --yes --package=node@20.19.6 -- node node_modules/@angular/cli/bin/ng.js serve --host 127.0.0.1
```

Wait for `Compiled successfully`, then sign in with the demo credentials above. Open a lesson to see Strapi's requests in Terminal 1. Play the video and enable focus detection to see frame requests in Terminal 2. [Open the Angular app](http://127.0.0.1:4200)

## Committee walkthrough

1. Open **Home**, select **Learners** and sign in. Show **Dashboard** and **Courses**.
2. Open **What comes next?** and play the video. Enable focus detection and allow the browser to use the webcam. Move out of view to show the unavailable state, then pause to show that capture stops.
3. Answer the checkpoint. Submit an incorrect choice first, then **Triangle** to complete the lesson.
4. Open **Progress** and reload. The completed lesson remains recorded. **Count in fives** is a second lesson available in the same catalogue.

The sample videos, fonts and graphics are local after setup. The browser sends webcam frames only during opted-in playback. The model returns an estimate, and the app discards the frames.

## One-time setup on a different Windows laptop

Install Node.js/npm and Python 3.13 with its Windows launcher. Run these commands from the demo folder while internet access is available.

```powershell
$demoNode = (npm exec --yes --package=node@20.19.6 -- node -p process.execPath).Trim()
$npmCli = Join-Path (Split-Path (Get-Command npm.cmd).Source) 'node_modules/npm/bin/npm-cli.js'
$env:Path = (Split-Path $demoNode) + ';' + $env:Path

Push-Location backend
& $demoNode $npmCli ci
Pop-Location

Push-Location frontend
& $demoNode $npmCli ci
Pop-Location

py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r .\distractionModel\requirements.txt
```

Use `.\Start-Demo.cmd rehearsal` to practice with the physical webcam. It saves your practice results in `backend/.tmp/rehearsal.db`. On presentation day, use `.\Start-Demo.cmd` to use the ordinary demo database at `backend/.tmp/demo.db`. The launcher uses the cached Node 20 runtime and local Python environment. Strapi creates demo-specific secrets and seeds the student and lesson records on both databases.

If startup fails, read the corresponding log in `.demo-logs`. Angular uses port 4200, Strapi uses 1337 and Flask uses 5000.
