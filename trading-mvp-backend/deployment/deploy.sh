#!/bin/bash

# Trading MVP Backend Deployment Script for AWS Lightsail
# Run this script on your Lightsail instance after cloning the repository

set -e  # Exit on any error

echo "================================"
echo "Trading MVP Backend Deployment"
echo "================================"

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

# Verify Java installation
java -version

# Step 3: Install Maven
echo -e "${GREEN}Step 3: Installing Maven...${NC}"
sudo apt install -y maven

# Verify Maven installation
mvn -version

# Step 4: Create application directory
echo -e "${GREEN}Step 4: Setting up application directory...${NC}"
cd /home/ubuntu

# If directory exists, ask user if they want to proceed
if [ -d "trading-mvp-backend" ]; then
    echo -e "${YELLOW}Directory trading-mvp-backend already exists.${NC}"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd trading-mvp-backend
        git pull
    else
        cd trading-mvp-backend
    fi
else
    echo -e "${YELLOW}Please clone your repository now:${NC}"
    echo "git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git trading-mvp-backend"
    echo ""
    read -p "Press enter after you've cloned the repository..."
    cd trading-mvp-backend
fi

# Step 5: Build the application
echo -e "${GREEN}Step 5: Building the application...${NC}"
mvn clean package -DskipTests

# Step 6: Create log directory
echo -e "${GREEN}Step 6: Creating log directory...${NC}"
sudo mkdir -p /var/log/trading-mvp
sudo chown ubuntu:ubuntu /var/log/trading-mvp

# Step 7: Configure systemd service
echo -e "${GREEN}Step 7: Configuring systemd service...${NC}"
echo -e "${YELLOW}IMPORTANT: You need to edit the service file with your environment variables!${NC}"
echo ""
echo "The service file is located at: deployment/trading-mvp.service"
echo ""
echo "You need to replace the following placeholders:"
echo "  - YOUR_DATABASE_PASSWORD_HERE"
echo "  - YOUR_LONG_RANDOM_SECRET_HERE_AT_LEAST_64_CHARACTERS_LONG"
echo "  - https://your-app.vercel.app (your actual Vercel frontend URL)"
echo ""
read -p "Press enter to open the service file in nano editor..."

nano deployment/trading-mvp.service

# Copy service file to systemd
echo -e "${GREEN}Copying service file to systemd...${NC}"
sudo cp deployment/trading-mvp.service /etc/systemd/system/trading-mvp.service

# Step 8: Enable and start the service
echo -e "${GREEN}Step 8: Enabling and starting the service...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable trading-mvp.service
sudo systemctl start trading-mvp.service

# Step 9: Check service status
echo -e "${GREEN}Step 9: Checking service status...${NC}"
sudo systemctl status trading-mvp.service --no-pager

# Step 10: Configure firewall
echo -e "${GREEN}Step 10: Configuring firewall...${NC}"
sudo ufw allow 8080/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo -e "${YELLOW}Note: Enable UFW firewall with 'sudo ufw enable' if not already enabled${NC}"
echo -e "${YELLOW}Make sure to also allow SSH (port 22) before enabling: sudo ufw allow 22/tcp${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Useful commands:"
echo "  Check status:   sudo systemctl status trading-mvp"
echo "  View logs:      sudo journalctl -u trading-mvp -f"
echo "  Restart:        sudo systemctl restart trading-mvp"
echo "  Stop:           sudo systemctl stop trading-mvp"
echo ""
echo "Your application should be running on: http://YOUR-LIGHTSAIL-IP:8080"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Test the API: curl http://localhost:8080/api/competitions"
echo "  2. Set up Nginx reverse proxy for HTTPS (optional but recommended)"
echo "  3. Configure your Vercel frontend to use this backend URL"
echo "  4. Set up a custom domain (optional)"
