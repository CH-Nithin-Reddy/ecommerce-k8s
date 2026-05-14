# ShopK8s — Production-Grade Highly Available E-Commerce on Kubernetes

> React + Node.js + PostgreSQL · 3-node Kubernetes cluster · AWS EC2 · Full observability · CI/CD · GitOps

---

## Live Demo

| Endpoint | Description |
|---|---|
| `http://23.23.71.14` | ShopK8s storefront (frontend via Ingress) |
| `http://23.23.71.14/api/products` | Products API (backend via Ingress) |

---

## What This Project Is

A fully production-grade, highly available e-commerce application deployed on a **3-node Kubernetes cluster running on AWS EC2**.

The app is a real store: browse products by category, add to cart, place orders, view order history. The entire infrastructure underneath it is battle-hardened with high availability, autoscaling, observability, and GitOps.

---

## Architecture

```
                        ┌─────────────────────────────────────────────┐
                        │              AWS EC2 (Ubuntu 22.04)          │
                        │                                              │
  Browser ──────────────▶  NGINX Ingress Controller (port 80)         │
                        │       │                    │                 │
                        │       ▼ /api/*             ▼ /*              │
                        │  ┌─────────┐         ┌──────────┐           │
                        │  │ Backend │         │ Frontend │           │
                        │  │ Node.js │         │  React   │           │
                        │  │ ×3 pods │         │  ×3 pods │           │
                        │  └────┬────┘         └──────────┘           │
                        │       │                                      │
                        │       ▼                                      │
                        │  ┌──────────┐    ┌─────────────────┐        │
                        │  │PostgreSQL│    │   Prometheus +  │        │
                        │  │  ×1 pod  │    │     Grafana      │        │
                        │  └──────────┘    └─────────────────┘        │
                        │                                              │
                        │  minikube        (control-plane)             │
                        │  minikube-m02    (worker)                    │
                        │  minikube-m03    (worker)                    │
                        └─────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Axios |
| Backend | Node.js 20 + Express + pg |
| Database | PostgreSQL 15 |
| Containerisation | Docker 29 |
| Orchestration | Kubernetes 1.35 (minikube 1.36) |
| Ingress | NGINX Ingress Controller |
| Package Manager | Helm 3 |
| Monitoring | Prometheus + Grafana (kube-prometheus-stack) |
| Alerting | Alertmanager |
| CI/CD | GitHub Actions |
| GitOps | Argo CD |
| Load Testing | k6 |
| Cloud | AWS EC2 (t2.medium, Ubuntu 22.04) |

---

## High Availability Features

### Pod Disruption Budgets
```
NAME           MIN AVAILABLE   ALLOWED DISRUPTIONS
backend-pdb    2               1
frontend-pdb   2               1
```
Kubernetes is forced to keep at least 2 replicas alive during any maintenance or rolling update. The app never goes fully down.

```

### Liveness & Readiness Probes
Every backend pod is health-checked every 20 seconds on `/health`. If a pod stops responding:
- **Readiness probe** fails → traffic is immediately removed from that pod
- **Liveness probe** fails → Kubernetes kills and replaces the pod automatically

### HorizontalPodAutoscaler
```
NAME           MIN   MAX   CPU TRIGGER   REPLICAS
backend-hpa    2     6     70%           2–6 (dynamic)
frontend-hpa   2     6     70%           2–6 (dynamic)
```
Pods scale up automatically when CPU exceeds 70%. Scales back down when load drops.

### Network Policies
Pod-to-pod traffic is locked down at the network layer:
- Only **frontend** and **ingress-nginx** can reach the backend
- Only **backend** can reach PostgreSQL
- All other pod-to-pod traffic is denied

---

## Production Networking

All traffic flows through the **NGINX Ingress Controller** — no hardcoded IPs, no direct NodePort exposure in production:

```
GET  /api/*  →  backend-svc:3000   (Node.js REST API)
GET  /*      →  frontend-svc:80    (React app)
```

Ingress config: [`k8s/ingress.yaml`](k8s/ingress.yaml)
Network policies: [`k8s/networkpolicy.yaml`](k8s/networkpolicy.yaml)

---

## Observability

### Prometheus + Grafana
Installed via Helm (`kube-prometheus-stack`). Dashboards track:
- CPU and memory usage per pod and node
- Pod health and restart counts
- Network I/O
- HPA scaling events

Grafana is accessible at `http://23.23.71.14:3001`

### Alertmanager Rules
Three production alerts configured in [`k8s/alerts.yaml`](k8s/alerts.yaml):

| Alert | Condition | Severity |
|---|---|---|
| `PodCrashLooping` | Pod restarts > 0 in 5 minutes | Critical |
| `HighCPU` | Node CPU > 80% for 5 minutes | Warning |
| `NodeNotReady` | Node not ready for > 1 minute | Critical |

---

## CI/CD Pipeline

### GitHub Actions
Every push to `main` triggers the full pipeline automatically:

```
Push to main
    └── Checkout code
    └── Build backend Docker image  →  push to Docker Hub
    └── Build frontend Docker image →  push to Docker Hub
    └── SSH into EC2
        └── kubectl set image deployment/backend ...
        └── kubectl set image deployment/frontend ...
        └── kubectl rollout status  (waits for zero-downtime rollout)
```

Pipeline config: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

### Argo CD GitOps
The cluster state is always synchronised from Git. Any manual change made directly to the cluster is automatically reverted to match what is committed in `k8s/`.

```
GitHub repo (k8s/) ──sync──▶  Argo CD  ──apply──▶  Kubernetes cluster
```

Argo CD is accessible at `http://23.23.71.14:8081`

---

## Load Test Results

Tested with **k6** at 100 concurrent virtual users over 2m30s:

```
scenarios: 1 scenario, 100 max VUs, 2m30s duration

  ✓ status is 200
  ✓ response time < 500ms

  checks_succeeded:   100.00%  (11372 / 11372)
  http_req_failed:    0.00%    (0 / 5686)

  http_req_duration:  avg=5.43ms   min=2.28ms   med=3.79ms   max=392.23ms
                      p(90)=8.06ms  p(95)=12.82ms

  iterations:         5686 completed  @  37.76 req/s
  vus_max:            100
```

**Zero failures. Zero downtime. 5.43ms average response time under full load.**

Load test script: [`loadtest.js`](loadtest.js)

---

## Kubernetes Manifests

| File | Resource | Purpose |
|---|---|---|
| `k8s/postgres.yaml` | Deployment + PVC + ConfigMap | Database with persistent storage and init SQL |
| `k8s/backend.yaml` | Deployment + Service | Node.js API, 3 replicas, probes, anti-affinity |
| `k8s/frontend.yaml` | Deployment + Service | React app, 3 replicas, anti-affinity |
| `k8s/pdb.yaml` | PodDisruptionBudget ×2 | Minimum 2 pods always available |
| `k8s/hpa.yaml` | HorizontalPodAutoscaler ×2 | Scale 2–6 on CPU > 70% |
| `k8s/ingress.yaml` | Ingress | NGINX routing rules |
| `k8s/networkpolicy.yaml` | NetworkPolicy ×2 | Pod-to-pod traffic restrictions |
| `k8s/alerts.yaml` | PrometheusRule | CrashLoop, HighCPU, NodeNotReady alerts |
| `k8s/argocd-app.yaml` | Application | Argo CD GitOps sync config |

---

## Repository Structure

ecommerce/
├── frontend/                    # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductList.jsx
│   │   │   ├── Cart.jsx
│   │   │   └── Orders.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── Dockerfile
├── backend/                     # Node.js + Express API
│   ├── server.js
│   └── Dockerfile
├── db/
│   └── init.sql                 # Schema + seed data
├── k8s/                         # All Kubernetes manifests
│   ├── postgres.yaml
│   ├── backend.yaml
│   ├── frontend.yaml
│   ├── pdb.yaml
│   ├── hpa.yaml
│   ├── ingress.yaml
│   ├── networkpolicy.yaml
│   ├── alerts.yaml
│   └── argocd-app.yaml
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions CI/CD pipeline
├── docker-compose.yml           # Local development
├── loadtest.js                  # k6 load test script
└── README.md
```

---

## Running Locally

**Prerequisites:** Docker Desktop, Node.js 20

```bash
# Clone the repo
git clone https://github.com/yourusername/ecommerce-k8s.git
cd ecommerce-k8s

# Start all 3 services
docker compose up --build

# Open the app
open http://localhost
```

---

## Deploying to Kubernetes

**Prerequisites:** kubectl, minikube 1.36+, Helm 3, AWS EC2 (t2.medium minimum)

```bash
# Start 3-node cluster with flannel CNI
minikube start --nodes=3 --driver=docker --cni=flannel

# Enable ingress and metrics-server addons
minikube addons enable ingress
minikube addons enable metrics-server

# Deploy all application resources
kubectl apply -f k8s/

# Install monitoring stack via Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace

# Install Argo CD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Verify the full cluster state
kubectl get pods -o wide
kubectl get hpa
kubectl get pdb
kubectl get ingress
kubectl get networkpolicy
```

---

## GitHub Actions — Required Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Your Docker Hub password or access token |
| `EC2_HOST` | EC2 public IP address |
| `EC2_SSH_KEY` | Full contents of your `.pem` key file |

---

## Lessons Learned

- **Worker nodes stuck NotReady on Windows** — CNI plugin was never initialised. Fixed by passing `--cni=flannel` to minikube start.
- **minikube NodePort unreachable from outside EC2** — minikube runs inside Docker on EC2 so NodePort traffic never reaches the host. Fixed with `kubectl port-forward --address 0.0.0.0` wrapped in a systemd service.
- **Port 80 refused for non-root user** — Linux requires root to bind ports below 1024. Fixed with `setcap cap_net_bind_service=ep /usr/local/bin/kubectl`.
- **Frontend calling hardcoded IP:3000** — After wiring Ingress, all API calls were migrated from `http://IP:3000/products` to relative paths `/api/products` so Ingress handles all routing.
- **Ingress rewriting paths incorrectly** — Required correct use of `nginx.ingress.kubernetes.io/rewrite-target: /$2` with regex capture groups on the path.
