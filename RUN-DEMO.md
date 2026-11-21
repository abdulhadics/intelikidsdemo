# Run the IntelliKids Demo

## Start on this Windows laptop

Open PowerShell in the demo folder and run:

```powershell
.\Start-Demo.cmd
```

You can also double-click `Start-Demo.cmd`. Wait for **Demo ready**, then open [IntelliKids on localhost](http://127.0.0.1:4200). Keep the launcher window open while you use the demo. To stop it, press Ctrl+C and enter `Y` if Windows asks to terminate the batch job.

| Demo login | Value |
| --- | --- |
| Email | `student@intellikids.test` |
| Password | `IntelliKids30!` |

Use `.\Start-Demo.cmd rehearsal` to practise with the webcam and keep your practice progress separate. The launcher starts Angular, Strapi and Flask and puts their logs in `.demo-logs`.

## First-time setup on another Windows laptop

Install Node.js with npm and Python 3.13 with the Windows launcher. Open PowerShell in the demo folder and use internet access for this step:

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

Then run `.\Start-Demo.cmd`. The launcher uses the cached Node runtime and local dependencies, so you can run it offline after setup.

## Share a link through GitHub and Vercel

1. Create a separate GitHub repository such as `intellikids-demo`. Start it with a fresh commit from the current demo files. Keep `.env`, the SQLite databases, dependencies and logs local. [GitHub guide to adding local code](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)
2. For an interactive link, host Strapi and the Flask focus service on HTTPS endpoints. Strapi needs persistent storage for checkpoint progress. If reviewers use webcams on the hosted demo, the focus control needs to explain that frames go to the hosted focus service. [Vercel filesystem support](https://vercel.com/docs/functions/runtimes#filesystem-support)
3. Import the demo repository into Vercel and use the build settings below. [Vercel build settings](https://vercel.com/docs/builds/configure-a-build) [Vercel Node.js 20 deprecation](https://vercel.com/changelog/node-js-20-is-being-deprecated)

| Vercel setting | Value |
| --- | --- |
| Root Directory | `frontend` |
| Framework Preset | Angular |
| Node.js | `22.x` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist/frontend` |

The Vercel routing config belongs in `frontend/vercel.json` once the HTTPS service URLs are available. Rewrite `/api/:path*` and `/lesson-media/:path*` to the corresponding Strapi paths, and `/process_image` to Flask. Place the Angular fallback to `/index.html` last so direct links such as `/my/courses` open correctly. [Vercel rewrites](https://vercel.com/docs/routing/rewrites)
