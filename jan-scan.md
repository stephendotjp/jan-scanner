Build and deploy a mobile web app called JAN Scanner that scans JAN/EAN barcodes and searches Hobby Genki for the product.
What it does:

Opens the rear camera on mobile
Scans JAN/EAN barcodes in real time using the quagga2 library (npm package @ericblade/quagga2)
On successful scan, opens https://hobby-genki.com/en/search?controller=search&s=JANCODE in the same tab
Has a manual text input fallback for typing a code
Debounces scans so one barcode doesn't trigger multiple searches
Works offline-first as a PWA so it can be added to the Android homescreen

Tech stack:

Vite + vanilla JS (no framework needed)
@ericblade/quagga2 for barcode scanning
PWA manifest + service worker so it's installable on Android homescreen

PWA requirements:

manifest.json with name "JAN Scanner", short_name "JAN Scan", display: standalone, start_url: /
A simple icon (512x512 and 192x192, can be a plain generated PNG)
Service worker that caches the app shell for offline use

UI:

Full-viewport camera view with a targeting rectangle overlay in the centre
Scanning status text below the viewfinder
Manual JAN input + search button at the bottom
Mobile-first, no desktop nav needed
Keep it clean and minimal

Deployment:

Initialise a git repo, commit everything
Create a new GitHub repo called jan-scanner and push to it
Deploy to Vercel using the Vercel CLI (vercel --prod)
HTTPS is required for camera access — Vercel provides this automatically

After deploying, output:

The Vercel production URL
The GitHub repo URL
A one-line instruction for adding it to the Android homescreen (open URL in Chrome → three-dot menu → "Add to homescreen")