param(
  [string]$Time = 'now',
  [string]$Timezone = 'Asia/Shanghai',
  [ValidateSet('auto','rotating','flying')][string]$Plate = 'auto',
  [ValidateSet('','immediate','short','long','mixed')][string]$Horizon = '',
  [ValidateSet('','short','long')][string]$PrimaryHorizon = '',
  [ValidateSet('markdown','json')][string]$Format = 'markdown'
)

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else { $null }
if (-not $nodePath) {
  $bundled = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
  if (Test-Path -LiteralPath $bundled) { $nodePath = $bundled }
}
if (-not $nodePath) {
  throw 'Node.js 18+ is required. Install Node.js or use the Codex bundled runtime.'
}

$arguments = @((Join-Path $PSScriptRoot 'qimen_cli.js'), '--time', $Time, '--timezone', $Timezone, '--plate', $Plate, '--format', $Format)
if ($Horizon) { $arguments += @('--horizon', $Horizon) }
if ($PrimaryHorizon) { $arguments += @('--primary-horizon', $PrimaryHorizon) }
& $nodePath @arguments
exit $LASTEXITCODE
