#!/bin/bash

# SSL Setup Script for Trading MVP
# Sets up HTTPS with Let's Encrypt SSL certificate
# Requirements: A domain name pointing to your Lightsail IP

set -e

echo "================================"
echo "SSL Setup with Let's Encrypt"
echo "================================"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -eq 0 ]; then
   echo -e "${RED}Please do not run this script as root. Run as ubuntu user.${NC}"
   exit 1
fi

# Get domain name
echo ""
echo -e "${YELLOW}Enter your domain name (e.g., tradingmvp.com):${NC}"
read -p "Domain: " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Domain name is required!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Enter your email address for SSL certificate notifications:${NC}"
read -p "Email: " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}Email is required!${NC}"
    exit 1
fi

# Install Certbot
echo -e "${GREEN}Installing Certbot...${NC}"
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Update Nginx configuration with domain
echo -e "${GREEN}Updating Nginx configuration...${NC}"
sudo sed -i "s/server_name _;/server_name $DOMAIN;/" /etc/nginx/sites-available/trading-mvp

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Obtain SSL certificate
echo -e "${GREEN}Obtaining SSL certificate from Let's Encrypt...${NC}"
echo ""
echo -e "${YELLOW}This will modify your Nginx configuration to enable HTTPS${NC}"
echo ""

sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

# Test auto-renewal
echo -e "${GREEN}Testing SSL certificate auto-renewal...${NC}"
sudo certbot renew --dry-run

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}SSL Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Your site is now accessible at:"
echo -e "${GREEN}  https://$DOMAIN${NC}"
echo ""
echo "SSL certificate will auto-renew before expiration."
echo "Certbot will automatically renew certificates using a systemd timer."
echo ""
echo "To check renewal timer:"
echo "  sudo systemctl status certbot.timer"
echo ""
echo "To manually renew:"
echo "  sudo certbot renew"
