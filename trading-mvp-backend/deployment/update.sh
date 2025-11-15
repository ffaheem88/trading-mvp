#!/bin/bash

# Update script for Trading MVP
# Run this script to update both backend and frontend after pushing new code

set -e

echo "================================"
echo "Updating Trading MVP"
echo "================================"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd /home/ubuntu/trading-mvp

# Pull latest code
echo -e "${GREEN}Pulling latest code...${NC}"
git pull origin main

# Build backend
echo -e "${GREEN}Building backend...${NC}"
cd trading-mvp-backend
mvn clean package -DskipTests
cd ..

# Build frontend
echo -e "${GREEN}Building frontend...${NC}"
cd trading-mvp-frontend
npm install
npm run build
cd ..

# Deploy frontend
echo -e "${GREEN}Deploying frontend...${NC}"
sudo rm -rf /var/www/trading-mvp-frontend/*
sudo cp -r trading-mvp-frontend/dist/* /var/www/trading-mvp-frontend/
sudo chown -R www-data:www-data /var/www/trading-mvp-frontend

# Restart backend
echo -e "${GREEN}Restarting backend...${NC}"
sudo systemctl restart trading-mvp

# Reload Nginx
echo -e "${GREEN}Reloading Nginx...${NC}"
sudo systemctl reload nginx

echo ""
echo -e "${GREEN}Update complete!${NC}"
echo ""
echo "Check status:"
echo "  Backend:  sudo systemctl status trading-mvp"
echo "  Nginx:    sudo systemctl status nginx"
echo "  Logs:     sudo journalctl -u trading-mvp -f"
