# sync_dreams.ps1 - 梦境同步到 GitHub
# 设置每日定时任务: schtasks /create /sc daily /tn "OpenClaw Dream Sync" /tr "powershell -File C:\Users\le\.openclaw\workspace\lezheng-dashboard\sync_dreams.ps1" /st 02:00
# 删除任务: schtasks /delete /tn "OpenClaw Dream Sync" /f

$ErrorActionPreference = 'Stop'
$repo = "C:\Users\le\.openclaw\workspace\lezheng-dashboard"
$branch = "main"
$commitMsg = "sync: update dream records $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

Set-Location $repo

# 检查是否有变更
$status = git status --porcelain
if (-not $status) {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] No changes, skip"
    exit 0
}

Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Syncing dreams..."

git add -A
git commit -m $commitMsg
git push origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Synced successfully"
} else {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Sync failed, exit code: $LASTEXITCODE"
    exit 1
}
