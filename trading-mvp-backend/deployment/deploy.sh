#!/bin/bash

# Trading MVP Full Stack Deployment Script for AWS Lightsail
# Deploys both Spring Boot backend and React frontend on single instance
# Run this script on your Lightsail instance after cloning the repository

set -e  # Exit on any error

echo "========================================"
echo "Trading MVP Full Stack Deployment"
echo "Backend (Spring Boot) + Frontend (React)"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
   echo -e "${RED}Please do not run this script as root. Run as ubuntu user.${NC}"
   exit 1
fi

# Step 1: Update system packages
echo -e "${GREEN}Step 1: Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y

# Step 2: Install Java 17
echo -e "${GREEN}Step 2: Installing Java 17...${NC}"
sudo apt install -y openjdk-17-jdk
java -version

# Step 3: Install Maven
echo -e "${GREEN}Step 3: Installing Maven...${NC}"
sudo apt install -y maven
mvn -version

# Step 4: Install Node.js and npm
echo -e "${GREEN}Step 4: Installing Node.js and npm...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v

# Step 5: Install Nginx
echo -e "${GREEN}Step 5: Installing Nginx...${NC}"
sudo apt install -y nginx

# Step 6: Clone or update repository
echo -e "${GREEN}Step 6: Setting up application directory...${NC}"
cd /home/ubuntu

if [ -d "trading-mvp" ]; then
    echo -e "${YELLOW}Directory trading-mvp already exists.${NC}"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd trading-mvp
        git pull
    else
        cd trading-mvp
    fi
else
    echo -e "${YELLOW}Please clone your repository now:${NC}"
    echo "Example: git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git trading-mvp"
    echo ""
    read -p "Press enter after you've cloned the repository..."
    cd trading-mvp
fi

# Step 7: Build the backend
echo -e "${GREEN}Step 7: Building Spring Boot backend...${NC}"
cd trading-mvp-backend
mvn clean package -DskipTests
cd ..

# Step 8: Build the frontend
echo -e "${GREEN}Step 8: Building React frontend...${NC}"
cd trading-mvp-frontend
npm install
npm run build
cd ..

# Step 9: Deploy frontend to Nginx
echo -e "${GREEN}Step 9: Deploying frontend to Nginx...${NC}"
sudo rm -rf /var/www/trading-mvp-frontend
sudo mkdir -p /var/www/trading-mvp-frontend
sudo cp -r trading-mvp-frontend/dist/* /var/www/trading-mvp-frontend/
sudo chown -R www-data:www-data /var/www/trading-mvp-frontend

# Step 10: Create log directory for backend
echo -e "${GREEN}Step 10: Creating log directory...${NC}"
sudo mkdir -p /var/log/trading-mvp
sudo chown ubuntu:ubuntu /var/log/trading-mvp

# Step 11: Configure systemd service for backend
echo -e "${GREEN}Step 11: Configuring backend systemd service...${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: You need to edit the service file with your environment variables!${NC}"
echo ""
echo "You need to replace the following placeholders:"
echo "  - YOUR_DATABASE_PASSWORD_HERE (your Supabase password)"
echo "  - YOUR_LONG_RANDOM_SECRET_HERE_AT_LEAST_64_CHARACTERS_LONG"
echo ""
echo "Note: CORS_ORIGINS will be set to http://localhost since frontend is on same server"
echo ""
read -p "Press enter to open the service file in nano editor..."

cd trading-mvp-backend
nano deployment/trading-mvp.service

# Update CORS in service file to allow same-origin
echo -e "${GREEN}Updating CORS settings for same-origin deployment...${NC}"
sed -i 's|Environment="CORS_ORIGINS=.*"|Environment="CORS_ORIGINS=http://localhost:5173,http://localhost:80,http://localhost"|' deployment/trading-mvp.service

# Copy service file to systemd
echo -e "${GREEN}Copying service file to systemd...${NC}"
sudo cp deployment/trading-mvp.service /etc/systemd/system/trading-mvp.service

# Step 12: Configure Nginx
echo -e "${GREEN}Step 12: Configuring Nginx...${NC}"
sudo cp deployment/nginx-trading-mvp.conf /etc/nginx/sites-available/trading-mvp

# Remove default site and enable our site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/trading-mvp /etc/nginx/sites-enabled/trading-mvp

# Test Nginx configuration
echo -e "${GREEN}Testing Nginx configuration...${NC}"
sudo nginx -t

# Step 13: Enable and start services
echo -e "${GREEN}Step 13: Starting services...${NC}"

# Start backend
sudo systemctl daemon-reload
sudo systemctl enable trading-mvp.service
sudo systemctl start trading-mvp.service

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Wait a moment for backend to start
sleep 3

# Step 14: Check service status
echo -e "${GREEN}Step 14: Checking service status...${NC}"
echo ""
echo "Backend status:"
sudo systemctl status trading-mvp.service --no-pager -l
echo ""
echo "Nginx status:"
sudo systemctl status nginx --no-pager -l

# Step 15: Configure firewall
echo -e "${GREEN}Step 15: Configuring firewall...${NC}"
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
echo -e "${YELLOW}Enabling UFW firewall...${NC}"
echo "y" | sudo ufw enable || true
sudo ufw status

# Step 16: Test the deployment
echo ""
echo -e "${GREEN}Step 16: Testing deployment...${NC}"
echo "Testing backend API..."
sleep 2
curl -s http://localhost:8080/api/competitions | head -20 || echo -e "${RED}Backend test failed${NC}"

echo ""
echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}=======================================${NC}"
echo ""
echo -e "${GREEN}Your application is now running!${NC}"
echo ""
echo "Access your application at:"
echo -e "${GREEN}  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)${NC}"
echo ""
echo "Useful commands:"
echo ""
echo "Backend:"
echo "  Check status:   sudo systemctl status trading-mvp"
echo "  View logs:      sudo journalctl -u trading-mvp -f"
echo "  Restart:        sudo systemctl restart trading-mvp"
echo ""
echo "Frontend (Nginx):"
echo "  Check status:   sudo systemctl status nginx"
echo "  View logs:      sudo tail -f /var/log/nginx/trading-mvp-access.log"
echo "  Restart:        sudo systemctl restart nginx"
echo "  Test config:    sudo nginx -t"
echo ""
echo "Update deployment:"
echo "  ./trading-mvp-backend/deployment/update.sh"
echo ""
echo -e "${YELLOW}Next steps (optional):${NC}"
echo "  1. Set up a custom domain"
echo "  2. Enable HTTPS with Let's Encrypt (run setup-ssl.sh)"
echo "  3. Monitor logs regularly"
echo ""
