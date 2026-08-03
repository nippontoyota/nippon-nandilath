param(
  [Parameter(Mandatory = $true)]
  [string]$DbPassword,
  [string]$AnonKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
)

$ErrorActionPreference = "Stop"
if (-not $AnonKey) {
  throw "Set NEXT_PUBLIC_SUPABASE_ANON_KEY or pass -AnonKey"
}

$ref = "ziypoxapyytysanjhkel"
$encoded = [uri]::EscapeDataString($DbPassword)

$envVars = @{
  DATABASE_URL = "postgresql://postgres.${ref}:${encoded}@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
  DIRECT_URL = "postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres"
  NEXT_PUBLIC_SUPABASE_URL = "https://${ref}.supabase.co"
  NEXT_PUBLIC_SUPABASE_ANON_KEY = $AnonKey
  DEFAULT_ENTRY_BRANCH_ID = "nandilath-universal"
}

Push-Location $PSScriptRoot\..

foreach ($entry in $envVars.GetEnumerator()) {
  Write-Host "Setting $($entry.Key) on Vercel..."
  $entry.Value | npx vercel env add $entry.Key production --force --yes | Out-Null
}

Write-Host "Testing database connection..."
$env:DATABASE_URL = $envVars.DATABASE_URL
$env:DIRECT_URL = $envVars.DIRECT_URL
node -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); p.model.count().then(c=>{console.log('Connected. Models:', c); return p.`$disconnect();}).catch(e=>{console.error(e.message); process.exit(1);})"

Write-Host "Redeploying Vercel production..."
npx vercel --prod --yes | Out-Null
Write-Host "Done."

Pop-Location
