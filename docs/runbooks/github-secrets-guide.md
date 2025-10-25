# GitHub Secrets Configuration Guide

This guide explains how to configure the required GitHub secrets for the GCE backend deployment workflow.

## Required Secrets

The `deploy-services.yml` workflow requires the following secrets to be configured in your GitHub repository:

### Core Secrets

| Secret | Description | Example |
|--------|-------------|---------|
| `GCE_HOST` | IP address or hostname of your GCE VM | `34.123.45.67` |
| `GCE_USER` | SSH username for deployment | `deploy` |
| `GCE_SSH_KEY` | Private SSH key for the GCE user | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

### Optional Secrets

| Secret | Description | When Needed |
|--------|-------------|-------------|
| `GHCR_WRITE_TOKEN` | Personal access token with GHCR write permissions | If `GITHUB_TOKEN` cannot push to GHCR |

## Configuration Steps

### 1. Generate SSH Key Pair

If you don't have an SSH key for the deployment user:

```bash
# On your local machine or the GCE instance
ssh-keygen -t rsa -b 4096 -C "deploy@cs-tw" -f ~/.ssh/deploy_key

# This creates:
# ~/.ssh/deploy_key     (private key)
# ~/.ssh/deploy_key.pub (public key)
```

### 2. Configure SSH Access

```bash
# On the GCE instance, add the public key to authorized_keys
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC... deploy@cs-tw" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Ensure the deploy user owns /srv/cs
sudo chown -R deploy:deploy /srv/cs
```

### 3. Add Secrets to GitHub

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each required secret:

#### GCE_HOST
- **Name**: `GCE_HOST`
- **Value**: Your GCE VM's external IP address

#### GCE_USER
- **Name**: `GCE_USER`
- **Value**: The SSH username (typically `deploy`)

#### GCE_SSH_KEY
- **Name**: `GCE_SSH_KEY`
- **Value**: The **entire** private key contents, including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAA...
...
AAAAC3NzaC1lZDI1NTE5AAAAIJqQ8k2j8k8k2j8k2j8k2j8k2j8k2j8k2j8k2j8k2j8k deploy@cs-tw
-----END OPENSSH PRIVATE KEY-----
```

## Security Best Practices

### SSH Key Security
1. Use a dedicated SSH key for deployments (not your personal key)
2. Set strong passphrases on private keys
3. Restrict the SSH key to only the deployment user
4. Consider using GitHub's OIDC provider instead of static keys

### Key Restrictions
Add restrictions to your SSH key in `~/.ssh/authorized_keys`:

```bash
# Restrict to specific commands only
command="cd /srv/cs && $SHELL",no-agent-forwarding,no-port-forwarding,no-pty ssh-rsa AAAAB... deploy@cs-tw

# Or restrict to specific IPs (optional)
from="203.0.113.0/24,198.51.100.5" ssh-rsa AAAAB... deploy@cs-tw
```

### Alternative: GitHub OIDC

For enhanced security, consider using GitHub's OpenID Connect provider:

1. Set up Workload Identity Federation in GCP
2. Configure the GitHub Actions workflow to use OIDC tokens
3. Eliminate the need for static SSH keys

Example OIDC configuration:

```yaml
# In your workflow
permissions:
  id-token: write
  contents: read

# Use GCP authentication instead of SSH
- uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: 'projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID'
    service_account: 'deploy-service-account@PROJECT_ID.iam.gserviceaccount.com'
```

## Testing the Configuration

### 1. Manual SSH Test
```bash
# From your local machine
ssh -i ~/.ssh/deploy_key deploy@YOUR_GCE_HOST

# Test the deployment script manually
cd /srv/cs
./bin/deploy.sh --tag test-tag --cwd /srv/cs
```

### 2. GitHub Actions Test
1. Push a small change to the `staging` branch
2. Monitor the Actions tab in GitHub
3. Check for any authentication or permission errors

### Common Troubleshooting

#### SSH Permission Denied
- Verify the SSH key format is correct
- Check file permissions on the GCE instance
- Ensure the public key is properly added to `authorized_keys`

#### Repository Not Found
- Verify the GitHub repository name is correct
- Check that the registry images exist

#### Permission Issues
- Ensure the deployment user owns `/srv/cs`
- Verify Docker group membership: `groups deploy`
- Check file permissions: `ls -la /srv/cs`

## Rotation Procedures

### Monthly Rotation
1. Generate new SSH key pair
2. Update `authorized_keys` on GCE
3. Update GitHub secrets
4. Test deployment with new keys
5. Remove old keys

### Emergency Rotation
If keys are compromised:
1. Immediately remove from GitHub
2. Remove from `authorized_keys` on GCE
3. Generate new keys
4. Update all configurations
5. Audit deployment logs for unauthorized access

## Monitoring

### Access Logs
Monitor GitHub Actions and GCE SSH logs:
```bash
# GitHub Actions
# Check Actions tab for deployment history

# GCE SSH logs
sudo tail -f /var/log/auth.log | grep "sshd.*deploy"
```

### Alerting
Set up alerts for:
- Failed deployment attempts
- Unusual SSH access patterns
- GitHub secret usage

## Documentation

Keep this information updated in your team's documentation:
- Secret names and purposes
- Rotation schedule
- Emergency contact procedures
- Security incident response plan