# API Test Script
Write-Host "`n=== Test 1: Get all couriers ===" -ForegroundColor Cyan
$couriers = Invoke-RestMethod -Uri http://localhost:3000/api/couriers -Method Get
Write-Host "Found $($couriers.couriers.Count) couriers" -ForegroundColor Green
$couriers.couriers[0..2] | Format-Table id, name, isAvailable

Write-Host "`n=== Test 2: Create an order (Normal delivery) ===" -ForegroundColor Cyan
$orderBody = @{
    pickupLocation = @{ x = 12; y = 22 }
    dropLocation = @{ x = 50; y = 60 }
    deliveryType = "Normal"
    packageDetails = "Books - 2kg"
} | ConvertTo-Json

$createResult = Invoke-RestMethod -Uri http://localhost:3000/api/orders -Method Post -Body $orderBody -ContentType "application/json"
Write-Host "Order created: $($createResult.message)" -ForegroundColor Green
Write-Host "Order ID: $($createResult.order.id)"
Write-Host "State: $($createResult.order.state)"
Write-Host "Assigned Courier: $($createResult.order.courierId)"
$orderId = $createResult.order.id

Write-Host "`n=== Test 3: Get all orders ===" -ForegroundColor Cyan
$orders = Invoke-RestMethod -Uri http://localhost:3000/api/orders -Method Get
Write-Host "Total orders: $($orders.orders.Count)" -ForegroundColor Green
$orders.orders | Format-Table @{L="ID";E={$_.id.Substring(0,8)+"..."}}, state, courierId

Write-Host "`n=== Test 4: Update order state to PICKED_UP ===" -ForegroundColor Cyan
$stateBody = @{ state = "PICKED_UP" } | ConvertTo-Json
$updated = Invoke-RestMethod -Uri "http://localhost:3000/api/orders/$orderId/state" -Method Patch -Body $stateBody -ContentType "application/json"
Write-Host "Order state updated to: $($updated.order.state)" -ForegroundColor Green

Write-Host "`n=== Test 5: Test invalid route (404) ===" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri http://localhost:3000/api/invalid -Method Get
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Expected 404 error: $($errorResponse.error)" -ForegroundColor Yellow
    Write-Host "Path: $($errorResponse.path)"
}

Write-Host "`n=== Test 6: Test invalid state transition ===" -ForegroundColor Cyan
try {
    $invalidStateBody = @{ state = "DELIVERED" } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:3000/api/orders/$orderId/state" -Method Patch -Body $invalidStateBody -ContentType "application/json"
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Expected validation error: $($errorResponse.error)" -ForegroundColor Yellow
}

Write-Host "`n=== All Tests Completed ===" -ForegroundColor Green
