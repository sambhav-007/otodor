<#
  Assign the OTODOR collection templates.

  Shopify stores a collection's template as `templateSuffix` on the Collection
  object, so this is store data, not a theme file — it cannot be pushed with
  `shopify theme push`. This script does it over the Admin API.

  ONE-TIME AUTHORISATION (opens a browser, approves scopes for your store):

      shopify store auth --store ttna2m-mh.myshopify.com --scopes read_products,write_products

  THEN:

      pwsh scripts/assign-collection-templates.ps1            # dry run, changes nothing
      pwsh scripts/assign-collection-templates.ps1 -Apply     # writes

  The dry run prints every collection with its current and intended suffix, so
  you can see exactly what would change before anything does. Re-running is
  safe: a collection already on the right template is skipped.

  Mapping note: a template's file name is only a NAME. `collection.digital-locks
  .json` is assigned to the `door-locks` collection because that is the handle
  the store actually uses, and `collection.smart-padlocks.json` to `padocks`.
#>

param(
  [switch]$Apply,
  [string]$Store = 'ttna2m-mh.myshopify.com'
)

$ErrorActionPreference = 'Stop'

# handle -> template suffix.  A blank suffix means "use the generic
# collection.json", which is correct for a collection with no bespoke template.
$Map = [ordered]@{
  'door-locks'            = 'digital-locks'
  'wooden-door-locks'     = 'wooden-door-locks'
  'metal-gate-locks'      = 'metal-gate-locks'
  'glass-door-locks'      = 'glass-door-locks'
  'padocks'               = 'smart-padlocks'
  'sliding-gate-motors'   = 'gate-automation'
}

function Invoke-Admin([string]$Query, [string]$Variables = '{}') {
  $cliArgs = @('--no-install','shopify','store','execute','-s',$Store,'-j','-q',$Query,'-v',$Variables)
  if ($Apply) { $cliArgs += '--allow-mutations' }
  $raw = & npx @cliArgs 2>&1 | Out-String
  try { return $raw | ConvertFrom-Json } catch { throw "Admin API call failed:`n$raw" }
}

Write-Host "`nReading collections from $Store ..." -ForegroundColor Cyan
$read = Invoke-Admin '{ shop { name primaryDomain { host } } collections(first: 100) { nodes { id handle title templateSuffix } } }'

Write-Host ("  store: {0}  ({1})`n" -f $read.data.shop.name, $read.data.shop.primaryDomain.host)

$nodes = $read.data.collections.nodes
$todo  = @()

'{0,-24} {1,-22} {2,-22} {3}' -f 'HANDLE','CURRENT','INTENDED','' | Write-Host
foreach ($n in $nodes) {
  $want = $Map[$n.handle]
  if ($null -eq $want) { continue }
  $have = if ([string]::IsNullOrEmpty($n.templateSuffix)) { '(generic)' } else { $n.templateSuffix }
  $state = if ($have -eq $want) { 'ok' } else { 'CHANGE'; }
  if ($have -ne $want) { $todo += [pscustomobject]@{ id = $n.id; handle = $n.handle; suffix = $want } }
  '{0,-24} {1,-22} {2,-22} {3}' -f $n.handle, $have, $want, $state | Write-Host
}

# Any mapped handle the store does not have — usually a typo or a renamed collection.
foreach ($h in $Map.Keys) {
  if (-not ($nodes | Where-Object handle -eq $h)) {
    Write-Host ("{0,-24} {1}" -f $h, 'NOT FOUND in this store') -ForegroundColor Yellow
  }
}

if ($todo.Count -eq 0) { Write-Host "`nNothing to change." -ForegroundColor Green; return }

if (-not $Apply) {
  Write-Host ("`n{0} collection(s) would change. Re-run with -Apply to write." -f $todo.Count) -ForegroundColor Yellow
  return
}

$mutation = 'mutation ($input: CollectionInput!) { collectionUpdate(input: $input) { collection { handle templateSuffix } userErrors { field message } } }'
foreach ($t in $todo) {
  $vars = @{ input = @{ id = $t.id; templateSuffix = $t.suffix } } | ConvertTo-Json -Depth 5 -Compress
  $res  = Invoke-Admin $mutation $vars
  $err  = $res.data.collectionUpdate.userErrors
  if ($err -and $err.Count) {
    $msg = ($err | ForEach-Object { $_.message }) -join '; '
    Write-Host ("  {0}: FAILED - {1}" -f $t.handle, $msg) -ForegroundColor Red
  } else {
    Write-Host ("  {0} -> {1}" -f $res.data.collectionUpdate.collection.handle, $res.data.collectionUpdate.collection.templateSuffix) -ForegroundColor Green
  }
}
