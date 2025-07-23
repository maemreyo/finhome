#!/bin/bash
# scripts/run-prompt-tests.sh
# Convenient wrapper script for running AI prompt tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_PATH="$PROJECT_ROOT/scripts/test-ai-prompt.js"
RESULTS_DIR="$PROJECT_ROOT/test-results"

echo -e "${BLUE}AI Prompt Test Suite Runner${NC}"
echo -e "${BLUE}=============================${NC}\n"

# Check if Next.js dev server is running
echo -e "${YELLOW}Checking if development server is running...${NC}"
if ! curl -s -f http://localhost:3033/api/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Development server is not running on localhost:3033${NC}"
    echo -e "${YELLOW}Please start the development server first:${NC}"
    echo -e "  ${GREEN}pnpm dev${NC}"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Development server is running${NC}\n"

# Check if test suite exists
if [ ! -f "$PROJECT_ROOT/prompt-test-suite.json" ]; then
    echo -e "${RED}❌ Test suite file not found: prompt-test-suite.json${NC}"
    exit 1
fi

# Create results directory if it doesn't exist
mkdir -p "$RESULTS_DIR"

# Run the test suite
echo -e "${YELLOW}Starting test suite execution...${NC}\n"

if node "$SCRIPT_PATH"; then
    echo -e "\n${GREEN}✅ Test suite completed successfully!${NC}"
    echo -e "${GREEN}All tests passed the required threshold.${NC}"
    
    # Show latest results location
    if [ -f "$RESULTS_DIR/latest-results.json" ]; then
        echo -e "\n${BLUE}Latest results saved to: $RESULTS_DIR/latest-results.json${NC}"
    fi
    
    exit 0
else
    echo -e "\n${RED}❌ Test suite completed with failures${NC}"
    echo -e "${RED}Some tests did not meet the required threshold.${NC}"
    
    # Show latest results location
    if [ -f "$RESULTS_DIR/latest-results.json" ]; then
        echo -e "\n${BLUE}Check detailed results: $RESULTS_DIR/latest-results.json${NC}"
        echo -e "${YELLOW}Run the following to see failed tests:${NC}"
        echo -e "  ${GREEN}cat $RESULTS_DIR/latest-results.json | jq '.failed_tests'${NC}"
    fi
    
    exit 1
fi