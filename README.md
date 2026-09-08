# VR Panorama Viewer

A minimal scaffold for a local equirectangular panorama viewer with optional WebXR immersive mode. This repo contains a lightweight TypeScript + Vite + three.js starter.

How to run locally:

```bash
git clone https://github.com/chrisdmorris-wq/vr-panorama-viewer.git
cd vr-panorama-viewer
npm install
npm run dev
# open http://localhost:5173
```

Notes:
- Place your equirectangular panorama at `public/assets/panorama.jpg` (create the folder) or change the path in `src/main.ts`.
- Non-VR mode works in any modern desktop browser (mouse/touch to look around).
- WebXR (immersive VR) requires a WebXR-capable browser and secure context (HTTPS or localhost). If you plan to use an external headset, point the headset browser at the server URL.

Running through Proxmox / on a VM:
- Yes — you can host the app inside a VM or container on Proxmox. Steps:
  1. Create a Linux VM or container with Node.js installed.
  2. Clone this repo and run `npm install` and `npm run dev`.
  3. Expose the dev port (default 5173) through your network (use NAT/port-forward or a reverse proxy).
  4. For WebXR immersive sessions from a headset browser, ensure the server is reachable via HTTPS (use a reverse proxy with TLS like Caddy or Nginx + certbot), or use `localhost` on the headset device itself.

Caveats for full VR passthrough on a Proxmox VM:
- If you want the VM to directly drive a headset attached to the Proxmox host (USB or GPU passthrough), you'll need to configure PCI/USB passthrough and a GPU driver in the VM. That's more complex but possible.

Next steps I can take now:
- Add a sample low-res panorama image into the repo (small size) so the demo works out-of-the-box.
- Improve camera controls (inertia, mobile touch, gyro).
- Add a UI to switch panoramas, adjust quality, or enable adaptive streaming.

