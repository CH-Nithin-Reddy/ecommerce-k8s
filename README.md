# ShopK8s — Highly Available E-commerce on Kubernetes

## Architecture

- Frontend: React app served via nginx (3 replicas)
- Backend: Node.js REST API (3 replicas, autoscales to 6)
- Database: PostgreSQL with persistent storage
- Ingress: NGINX Ingress Controller routing /api → backend, / → frontend
- Monitoring: Prometheus + Grafana
- GitOps: Argo CD syncing from GitHub
- CI/CD: GitHub Actions building and deploying on every push

## Stack

| Tool | Version |
|---|---|
| Kubernetes | v1.35 |
| minikube | v1.36 |
| Docker | v29 |
| Node.js | v20 LTS |
| PostgreSQL | v15 |
| Helm | v3 |
| Prometheus | kube-prometheus-stack |
| Argo CD | stable |

## High Availability Features

- 3 replicas on all deployments
- Pod Disruption Budgets — minimum 2 pods always alive
- Pod anti-affinity — replicas spread across different nodes
- Liveness and Readiness probes — bad pods replaced automatically
- HPA — autoscales on CPU above 70%
- Network Policies — pod-to-pod traffic restricted

## Running locally

docker compose up --build

## Deploying to Kubernetes

kubectl apply -f k8s/

## Load testing

k6 run loadtest.js