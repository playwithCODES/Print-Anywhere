$ErrorActionPreference = "Stop"

$PrinterName = "Print Anywhere"
$PortName = "http://127.0.0.1:6310/ipp/print"
$DriverName = "Microsoft IPP Class Driver"
$InetPortsKey = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Print\Providers\Internet Print Provider\Ports"

Write-Host "1. Registering IPP port in Windows Internet Print Provider..." -ForegroundColor Cyan
if (-not (Test-Path $InetPortsKey)) {
    New-Item -Path $InetPortsKey -Force | Out-Null
}
New-Item -Path "$InetPortsKey\$PortName" -Force | Out-Null

Write-Host "2. Restarting Print Spooler to load the new port..." -ForegroundColor Cyan
Restart-Service -Name Spooler -Force
Start-Sleep -Seconds 2

Write-Host "3. Ensuring '$DriverName' is available..." -ForegroundColor Cyan
if (-not (Get-PrinterDriver -Name $DriverName -ErrorAction SilentlyContinue)) {
    Add-PrinterDriver -Name $DriverName
}

Write-Host "4. Removing any old '$PrinterName' queue..." -ForegroundColor Cyan
if (Get-Printer -Name $PrinterName -ErrorAction SilentlyContinue) {
    Remove-Printer -Name $PrinterName
    Start-Sleep -Seconds 1
}

Write-Host "5. Installing '$PrinterName' and setting as Windows default..." -ForegroundColor Cyan
Add-Printer -Name $PrinterName -DriverName $DriverName -PortName $PortName
Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Windows" -Name "LegacyDefaultPrinterMode" -Value 1 -Type DWord
(New-Object -ComObject WScript.Network).SetDefaultPrinter($PrinterName)

Write-Host "`nSuccess! Virtual printer installed and set as default:" -ForegroundColor Green
Get-Printer -Name $PrinterName | Format-Table Name, DriverName, PortName, PrinterStatus -AutoSize