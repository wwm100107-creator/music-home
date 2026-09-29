# Stable public link for Music Home

This adds a fixed Cloudflare Workers URL that redirects visitors to the current Android Quick Tunnel URL. A Termux supervisor publishes the active URL on startup and whenever `cloudflared` exits and restarts.

## One-time setup

1. Keep the Android phone connected to Tailscale and make sure `ssh music-home` still works from this Windows PC. Tailscale is only used by the setup script to configure the Android server; visitors do not use Tailscale.
2. Sign in to a Cloudflare account in the browser when Wrangler opens it. A free `workers.dev` subdomain must be enabled for that account. Do not paste a Cloudflare password or API token into chat.
3. From the project folder on Windows, run:

   ```powershell
   node scripts/setup-stable-link.mjs
   ```

4. Wrangler requests account/user read access and Worker-script write access, then opens the Cloudflare login/authorization flow if needed. It does not request the broader `workers:write` permission for zones, KV, or routes. It deploys `music-home-link` after authorization. Copy the `https://music-home-link.<account>.workers.dev` URL printed by Wrangler and paste it into the PowerShell prompt once.
5. The script creates a private random update secret, stores it with Cloudflare, installs it in Termux with owner-only permissions, and starts the tunnel supervisor. It prints the fixed public link when setup finishes.
6. Share that fixed link. The visitor's browser follows a no-cache redirect to the currently active Quick Tunnel. If the Android phone is restarting, the fixed link briefly shows a “server is starting” page until the new tunnel is registered.

## Limits

- The `workers.dev` address remains the same while the Cloudflare account and Worker remain available. This does not claim a lifetime or uptime guarantee.
- `workers.dev` is Cloudflare's free personal/hobby route, intended for projects that are not business-critical. The free Workers plan has daily request limits.
- The link is a redirect, so after opening it the browser address bar changes to the current `trycloudflare.com` URL. People can keep sharing/bookmarking the fixed Worker URL.
- The Android phone, home Wi-Fi, and Quick Tunnel still serve the site. If the phone or home internet is offline, the fixed link cannot serve Music Home.
- To use the exact custom name `musichome.com`, the owner must already control that domain and configure DNS; this setup instead gives a free `workers.dev` hostname.
