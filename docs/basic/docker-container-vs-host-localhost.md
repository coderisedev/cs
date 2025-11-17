---
last_updated: 2025-11-17
status: ✅ Active
related_docs:
  - docs/fix/2025-11-17-docker-db-access.md
  - docs/done/docker-env-best-practices.md
---

# Why Containers Can't Reach Host Services via `localhost`

## TL;DR
Inside a Docker container, `localhost` (`127.0.0.1`) points to the container’s own network namespace—not the host. Unless the container shares the host network (`--network host`), any request to `localhost` loops within that isolated namespace and never reaches services running on the host OS (e.g., PostgreSQL). To reach host services from a bridged container, you must target the host’s bridge IP (e.g., `host.docker.internal`, `172.17.0.1`, etc.) or expose the service on an externally routable interface.

---

## Network Namespaces 101

- Each container lives in its own Linux **network namespace**. This namespace contains:
  - A loopback interface (`lo`), acting exactly like `127.0.0.1` on a VM.
  - One or more virtual Ethernet interfaces (veth) connected to Docker bridge networks.
- Processes inside the container have no visibility into the host networking stack unless explicitly shared.

### Consequence
- When a process inside the container connects to `localhost:5432`, packets loop on the container’s `lo` interface. They never exit toward the host, so the host’s PostgreSQL daemon never sees the traffic.

---

## Reaching the Host

1. **Bridge Gateway / `host.docker.internal`**
   - Docker (20.10+) on Linux exposes a pseudo-hostname `host.docker.internal` that resolves to the host’s bridge gateway IP. On custom networks you can hardcode the gateway (e.g., `172.30.0.1`, `172.31.0.1`).
   - Example: `postgres://cs:...@host.docker.internal:5432/mydb`

2. **Host Networking Mode**
   - `docker run --network host …` (or Compose `network_mode: host`) makes the container share the host namespace. Then `localhost` truly references the host’s loopback.
   - Trade-off: no port isolation, IPv6 quirks, and not supported on macOS/Windows Docker Desktop.

3. **Public/Private Host IP**
   - If the host binds Postgres on `10.0.0.5:5432` (or a Cloudflare tunnel, etc.), the container can reach it via that IP as long as firewall and pg_hba settings allow it.

---

## Operational Tips

- When isolating prod/dev stacks with custom subnets (e.g., `172.30.0.0/16`, `172.31.0.0/16`), remember:
  - **pg_hba.conf** must allow those subnets.
  - **Firewall/UFW** must permit the corresponding ports from those ranges.
- For local development on Linux:
  - Add `extra_hosts: - "host.docker.internal:host-gateway"` to Compose services (Docker 20.10+).
  - Confirm connectivity with `docker exec <container> nc -vz host.docker.internal 5432`.
- On macOS/Windows Docker Desktop, `host.docker.internal` is built-in; no extra hosts entry needed.

Understanding namespace boundaries prevents “why can’t my container connect to localhost?” surprises and clarifies why medusa/strapi must use the host gateway address rather than `127.0.0.1`.
