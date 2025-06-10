#!/bin/bash

# KASEP API Testing Script
# Make sure your server is running on http://localhost:3000

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000"
JWT_TOKEN=""  # Add your JWT token here if you have one

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local need_auth=$4
    
    echo -e "${YELLOW}🔄 Testing: $method $endpoint${NC}"
    
    if [ "$need_auth" = "true" ]; then
        if [ -z "$JWT_TOKEN" ]; then
            print_warning "Skipping authenticated endpoint (no JWT token provided)"
            return
        fi
        if [ -z "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $JWT_TOKEN")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $JWT_TOKEN" \
                -d "$data")
        fi
    else
        if [ -z "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        fi
    fi
    
    # Extract HTTP status code (last line)
    http_code=$(echo "$response" | tail -n 1)
    # Extract response body (all lines except last)
    response_body=$(echo "$response" | sed '$d')
    
    # Check if request was successful
    if [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
        print_success "HTTP $http_code - Success"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    elif [[ $http_code -ge 400 && $http_code -lt 500 ]]; then
        print_error "HTTP $http_code - Client Error"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    else
        print_error "HTTP $http_code - Server Error"
        echo "$response_body"
    fi
    
    echo "----------------------------------------"
}

# Check if server is running
check_server() {
    print_step "Checking if server is running..."
    if curl -s "$BASE_URL/" > /dev/null; then
        print_success "Server is running on $BASE_URL"
    else
        print_error "Server is not running on $BASE_URL"
        print_warning "Please start the server with: npm start"
        exit 1
    fi
    echo "----------------------------------------"
}

# Main testing function
run_tests() {
    echo -e "${BLUE}🚀 Starting KASEP API Tests${NC}"
    echo "========================================"
    
    # Check server
    check_server
    
    # 1. Health Check
    print_step "1. Health Check"
    api_call "GET" "/"
    
    # 2. User Profile Tests (Public endpoints)
    print_step "2. User Profile Tests"
    api_call "GET" "/users?page=1&limit=2"
    
    # 3. Receipt Tests
    print_step "3. Receipt Tests"
    
    # Create a receipt
    receipt_data='{
        "judul": "Test Nasi Goreng Sehat",
        "gambar": "https://example.com/nasi-goreng.jpg",
        "deskripsi": "Test resep nasi goreng sehat",
        "labelBahan": ["beras", "telur", "wortel"],
        "metodeMemasak": ["tumis", "goreng"],
        "kalori": 350.5,
        "protein": 15.2,
        "lemak": 8.5,
        "karbohidrat": 45.0,
        "ingredients": [
            {"bahan": "Beras putih 200g"},
            {"bahan": "Telur ayam 2 butir"}
        ],
        "steps": [
            {
                "description": "Masak nasi putih hingga matang",
                "images": [{"url": "https://example.com/step1.jpg"}]
            }
        ]
    }'
    
    api_call "POST" "/receipts" "$receipt_data"
    
    # Get all receipts
    api_call "GET" "/receipts?page=1&limit=3"
    
    # Search receipts
    api_call "GET" "/receipts?search=nasi"
    
    # 4. BMI Record Tests (Authenticated)
    print_step "4. BMI Record Tests (Authenticated)"
    
    bmi_data='{
        "date": "2023-12-01",
        "height": 175,
        "weight": 70,
        "age": 28,
        "activityLevel": "moderate",
        "bmi": 22.86,
        "category": "Normal",
        "healthStatus": "Healthy",
        "targetCalories": 2200,
        "hasGoals": true
    }'
    
    api_call "POST" "/bmi" "$bmi_data" "true"
    api_call "GET" "/bmi/my-records?page=1&limit=5" "" "true"
    api_call "GET" "/bmi?page=1&limit=3"
    
    # 5. History Tests (Authenticated)
    print_step "5. History Tests (Authenticated)"
    
    history_data='{
        "receiptId": "00000000-0000-0000-0000-000000000000",
        "detectedLabels": ["beras", "telur", "wortel"],
        "category": "Sarapan",
        "notes": "Test history entry"
    }'
    
    api_call "POST" "/history" "$history_data" "true"
    api_call "GET" "/history/my-history?page=1&limit=5" "" "true"
    api_call "GET" "/history?page=1&limit=3"
    
    # 6. Ideal Targets Tests
    print_step "6. Ideal Targets Tests"
    
    targets_data='{
        "bmiRecordId": "00000000-0000-0000-0000-000000000000",
        "weightRange": "65-70 kg",
        "targetWeight": 68,
        "targetBMI": "22.5-24.9",
        "targetCalories": 1800,
        "timeEstimate": "3-6 bulan"
    }'
    
    api_call "POST" "/ideal-targets" "$targets_data"
    api_call "GET" "/ideal-targets?page=1&limit=3"
    
    # 7. Error Testing
    print_step "7. Error Testing"
    
    # Test invalid UUID
    api_call "GET" "/receipts/invalid-uuid"
    
    # Test unauthorized access
    api_call "GET" "/user/profile"
    
    # Test invalid data
    invalid_bmi='{
        "date": "invalid-date",
        "height": -1,
        "weight": 0
    }'
    api_call "POST" "/bmi" "$invalid_bmi" "true"
    
    echo -e "${GREEN}🎉 API Testing Complete!${NC}"
    echo "========================================"
}

# Quick test function for specific endpoints
quick_test() {
    case $1 in
        "health")
            api_call "GET" "/"
            ;;
        "users")
            api_call "GET" "/users?page=1&limit=5"
            ;;
        "receipts")
            api_call "GET" "/receipts?page=1&limit=5"
            ;;
        "bmi")
            api_call "GET" "/bmi?page=1&limit=5"
            ;;
        "history")
            api_call "GET" "/history?page=1&limit=5"
            ;;
        "targets")
            api_call "GET" "/ideal-targets?page=1&limit=5"
            ;;
        *)
            echo "Usage: $0 quick [health|users|receipts|bmi|history|targets]"
            ;;
    esac
}

# Main script logic
case $1 in
    "quick")
        quick_test $2
        ;;
    "full")
        run_tests
        ;;
    "")
        echo -e "${BLUE}KASEP API Testing Script${NC}"
        echo "========================"
        echo "Usage:"
        echo "  $0 full              - Run all API tests"
        echo "  $0 quick [endpoint]  - Test specific endpoint"
        echo ""
        echo "Quick test options:"
        echo "  health, users, receipts, bmi, history, targets"
        echo ""
        echo "Examples:"
        echo "  $0 full"
        echo "  $0 quick health"
        echo "  $0 quick receipts"
        echo ""
        print_warning "Note: Set JWT_TOKEN variable in script for authenticated endpoints"
        ;;
    *)
        echo "Invalid option. Use '$0' to see usage."
        ;;
esac 