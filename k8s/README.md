# Kubernetes Manifests

Kubernetes deployment configurations for NinjaIT.

## Directory Structure

```
k8s/
├── base/              # Base configurations
│   ├── backend/
│   ├── frontend/
│   └── databases/
├── overlays/          # Environment-specific overrides
│   ├── development/
│   ├── staging/
│   └── production/
├── helm/              # Helm charts
└── scripts/           # Deployment scripts
```

## Deployment

### Using kubectl

```bash
# Deploy to development
kubectl apply -k overlays/development

# Deploy to staging
kubectl apply -k overlays/staging

# Deploy to production
kubectl apply -k overlays/production
```

### Using Helm

```bash
# Install
helm install ninjait ./helm/ninjait -f values.yaml

# Upgrade
helm upgrade ninjait ./helm/ninjait -f values.yaml

# Rollback
helm rollback ninjait
```

## Configuration

Edit `values.yaml` for environment-specific configuration:

```yaml
replicaCount: 3
image:
  repository: ninjait/backend
  tag: latest
resources:
  limits:
    cpu: 1000m
    memory: 1Gi
```

## Monitoring

```bash
# Check pod status
kubectl get pods -n ninjait

# View logs
kubectl logs -f deployment/ninjait-backend -n ninjait

# Check resource usage
kubectl top pods -n ninjait
```

## Scaling

```bash
# Manual scaling
kubectl scale deployment/ninjait-backend --replicas=5 -n ninjait

# Auto-scaling is configured via HorizontalPodAutoscaler
```

