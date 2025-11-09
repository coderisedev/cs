# Cloudflare Tunnel Notes

## 1. HTTP Services (Medusa / Strapi)
- Cloudflare Tunnel (`cloudflared`) runs on the server and opens outbound connections to CF’s edge.
- All external traffic (e.g., `https://api.aidenlux.com`, `https://content.aidenlux.com`) traverses the tunnel, so the server **does not need** to expose ports 9000/1337 to the public internet.
- Just ensure `cloudflared` can reach the local services (Medusa on 9000, Strapi on 1337) and keep the local firewall closed to untrusted sources unless you have LAN/debug needs.

## 2. Direct Access to Postgres
You have two options when you need remote access to the host’s PostgreSQL (default port 5432):

1. **Expose 5432 directly**  
   - Open the firewall/`pg_hba.conf` to trusted public IPs.  
   - Harden with TLS, strong passwords, and IP allowlists.  
   - Use this only if you *must* let external clients connect without tunnels.

2. **Stay behind the firewall using tunnels/VPN**  
   - Keep 5432 closed publicly and reach it via SSH tunnels, VPN, or Cloudflare’s TCP tunneling.

## 3. Cloudflare Tunnel for PostgreSQL (TCP Mode)
- Cloudflare Tunnel can forward raw TCP, not just HTTP:
  1. Define a tunnel route for `tcp://postgres.example.com:5432`, pointing to `localhost:5432`.
  2. Protect it using Cloudflare Access policies.
  3. On the client side, run `cloudflared access tcp --hostname postgres.example.com --url localhost:5432` (or use WARP) to create a local port that proxies through CF to your Postgres instance.
- This keeps the database completely off the public internet while still allowing authenticated remote access.

## TL;DR
- Web traffic via Cloudflare Tunnel → no need to open 9000/1337 publicly.
- For Postgres: either open 5432 intentionally with proper security, or prefer a tunnel/VPN (CF TCP) so the DB port remains closed to the outside.
