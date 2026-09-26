#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}GoodNews Backend - Error Handling Tests${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if server is running
echo -e "${YELLOW}Checking if server is running on http://localhost:5000...${NC}"
if ! curl -s http://localhost:5000/health > /dev/null; then
  echo -e "${RED}✗ Server is not running!${NC}"
  echo "Start the server with: npm run dev"
  exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Test 1: Valid search
echo -e "${BLUE}Test 1: Valid Search (should succeed)${NC}"
echo "POST /api/search with topic: 'climate solutions'"
response=$(curl -s -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{"topic": "climate solutions", "limit": 3}')

if echo "$response" | grep -q '"topic":"climate solutions"'; then
  echo -e "${GREEN}✓ PASS${NC}"
  echo "Response: $(echo $response | jq -r '.count') articles found"
else
  echo -e "${RED}✗ FAIL${NC}"
  echo "Response: $response"
fi
echo ""

# Test 2: Missing topic (should return 400)
echo -e "${BLUE}Test 2: Missing Topic (should return 400 error)${NC}"
echo "POST /api/search without topic parameter"
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{"limit": 5}')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "400" ]; then
  echo -e "${GREEN}✓ PASS - Status Code: $http_code${NC}"
  echo "Error: $(echo $body | jq -r '.message')"
else
  echo -e "${RED}✗ FAIL - Expected 400, got $http_code${NC}"
  echo "Response: $body"
fi
echo ""

# Test 3: Invalid limit (should return 400)
echo -e "${BLUE}Test 3: Invalid Limit (should return 400 error)${NC}"
echo "POST /api/search with limit > 100"
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{"topic": "tech", "limit": 200}')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "400" ]; then
  echo -e "${GREEN}✓ PASS - Status Code: $http_code${NC}"
  echo "Error: $(echo $body | jq -r '.message')"
else
  echo -e "${RED}✗ FAIL - Expected 400, got $http_code${NC}"
  echo "Response: $body"
fi
echo ""

# Test 4: Invalid endpoint (should return 404)
echo -e "${BLUE}Test 4: Invalid Endpoint (should return 404 error)${NC}"
echo "GET /invalid/path"
response=$(curl -s -w "\n%{http_code}" http://localhost:5000/invalid/path)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "404" ]; then
  echo -e "${GREEN}✓ PASS - Status Code: $http_code${NC}"
  echo "Error: $(echo $body | jq -r '.message')"
else
  echo -e "${RED}✗ FAIL - Expected 404, got $http_code${NC}"
  echo "Response: $body"
fi
echo ""

# Test 5: Health check (should return 200)
echo -e "${BLUE}Test 5: Health Check (should return 200)${NC}"
echo "GET /health"
response=$(curl -s -w "\n%{http_code}" http://localhost:5000/health)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ PASS - Status Code: $http_code${NC}"
  echo "Uptime: $(echo $body | jq -r '.uptime') seconds"
else
  echo -e "${RED}✗ FAIL - Expected 200, got $http_code${NC}"
fi
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Error Handling Tests Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Check backend console for detailed logs"
echo "2. Look for [search], [NewsAPI], [FILTER] log messages"
echo "3. If all tests pass, error handling is working correctly"