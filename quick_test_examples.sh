#!/bin/bash

# Quick Testing Examples for KASEP API
# Usage: ./quick_test_examples.sh [test_name]

BASE_URL="http://localhost:3000"

echo "🚀 KASEP API Quick Test Examples"
echo "================================"

case $1 in
    "health" | "1")
        echo "📋 Testing Health Check..."
        curl -X GET "$BASE_URL/" | jq '.'
        ;;
    "receipts" | "2")
        echo "📋 Testing Get All Receipts..."
        curl -X GET "$BASE_URL/receipts?page=1&limit=3" | jq '.'
        ;;
    "search" | "3")
        echo "📋 Testing Search Receipts..."
        curl -X GET "$BASE_URL/receipts?search=nasi&limit=2" | jq '.'
        ;;
    "receipt-detail" | "4")
        echo "📋 Testing Get Specific Receipt..."
        # Get the first receipt ID from the API
        RECEIPT_ID=$(curl -s "$BASE_URL/receipts?limit=1" | jq -r '.data.receipts[0].id')
        echo "Using Receipt ID: $RECEIPT_ID"
        curl -X GET "$BASE_URL/receipts/$RECEIPT_ID" | jq '.'
        ;;
    "users" | "5")
        echo "📋 Testing Get All Users..."
        curl -X GET "$BASE_URL/users?page=1&limit=5" | jq '.'
        ;;
    "bmi" | "6")
        echo "📋 Testing Get All BMI Records..."
        curl -X GET "$BASE_URL/bmi?page=1&limit=5" | jq '.'
        ;;
    "history" | "7")
        echo "📋 Testing Get All History..."
        curl -X GET "$BASE_URL/history?page=1&limit=5" | jq '.'
        ;;
    "targets" | "8")
        echo "📋 Testing Get All Ideal Targets..."
        curl -X GET "$BASE_URL/ideal-targets?page=1&limit=5" | jq '.'
        ;;
    "create-receipt" | "9")
        echo "📋 Testing Create New Receipt..."
        curl -X POST "$BASE_URL/receipts" \
        -H "Content-Type: application/json" \
        -d '{
            "judul": "Test Recipe from Curl",
            "gambar": "https://example.com/test-recipe.jpg",
            "deskripsi": "A test recipe created via curl command",
            "labelBahan": ["test", "ingredients", "curl"],
            "metodeMemasak": ["test", "method"],
            "kalori": 250.0,
            "protein": 10.0,
            "lemak": 5.0,
            "karbohidrat": 30.0,
            "ingredients": [
                {"bahan": "Test ingredient 1"},
                {"bahan": "Test ingredient 2"}
            ],
            "steps": [
                {
                    "description": "First test step",
                    "images": [{"url": "https://example.com/step1.jpg"}]
                },
                {
                    "description": "Second test step",
                    "images": []
                }
            ]
        }' | jq '.'
        ;;
    "error-test" | "10")
        echo "📋 Testing Error Handling - Invalid UUID..."
        curl -X GET "$BASE_URL/receipts/invalid-uuid-format" | jq '.'
        ;;
    "pagination" | "11")
        echo "📋 Testing Pagination..."
        echo "Page 1:"
        curl -s "$BASE_URL/receipts?page=1&limit=2" | jq '.data.pagination'
        echo -e "\nPage 2:"
        curl -s "$BASE_URL/receipts?page=2&limit=2" | jq '.data.pagination'
        ;;
    "stats" | "12")
        echo "📋 Getting API Statistics..."
        echo "Total Receipts: $(curl -s "$BASE_URL/receipts?limit=1" | jq '.data.pagination.total')"
        echo "Total Users: $(curl -s "$BASE_URL/users?limit=1" | jq '.data.pagination.total')"
        echo "Total BMI Records: $(curl -s "$BASE_URL/bmi?limit=1" | jq '.data.pagination.total')"
        echo "Total History: $(curl -s "$BASE_URL/history?limit=1" | jq '.data.pagination.total')"
        echo "Total Ideal Targets: $(curl -s "$BASE_URL/ideal-targets?limit=1" | jq '.data.pagination.total')"
        ;;
    "all" | "13")
        echo "📋 Running All Basic Tests..."
        for i in {1..8}; do
            echo -e "\n🔄 Test $i..."
            $0 $i
            sleep 1
        done
        ;;
    *)
        echo "Available tests:"
        echo "  1|health         - Health check"
        echo "  2|receipts       - Get all receipts"
        echo "  3|search         - Search receipts"
        echo "  4|receipt-detail - Get specific receipt"
        echo "  5|users          - Get all users"
        echo "  6|bmi            - Get all BMI records"
        echo "  7|history        - Get all history"
        echo "  8|targets        - Get all ideal targets"
        echo "  9|create-receipt - Create new receipt"
        echo " 10|error-test     - Test error handling"
        echo " 11|pagination     - Test pagination"
        echo " 12|stats          - Get API statistics"
        echo " 13|all            - Run all basic tests"
        echo ""
        echo "Usage: $0 [test_name]"
        echo "Example: $0 health"
        echo "Example: $0 2"
        ;;
esac 