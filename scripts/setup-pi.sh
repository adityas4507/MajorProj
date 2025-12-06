#!/bin/bash

# Setup Script for MajorProj on Raspberry Pi
# Run with sudo

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit
fi

echo "update system..."
apt-get update && apt-get upgrade -y

echo "installing dependencies..."
apt-get install -y curl build-essential clamav

# Install Node.js 20 if not present
if ! command -v node &> /dev/null; then
    echo "installing nodejs 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo "installing pm2..."
npm install -g pm2

# Create Mount Points
echo "Creating mount points..."
mkdir -p /mnt/disk1
mkdir -p /mnt/disk2

# Disk Setup Instructions
echo "---------------------------------------------------"
echo "DISK SETUP REQUIRED"
echo "---------------------------------------------------"
echo "Please verify your drives (sda, sdb) and mount them:"
echo "1. Format if needed (WARNING: DATA LOSS):"
echo "   mkfs.ext4 /dev/sda1"
echo "   mkfs.ext4 /dev/sdb1"
echo ""
echo "2. Add to /etc/fstab for auto-mount:"
echo "   UUID=<uuid-of-sda1> /mnt/disk1 ext4 defaults 0 0"
echo "   UUID=<uuid-of-sdb1> /mnt/disk2 ext4 defaults 0 0"
echo "   (Use 'blkid' to find UUIDs)"
echo ""
echo "3. Mount manually for now:"
echo "   mount /dev/sda1 /mnt/disk1"
echo "   mount /dev/sdb1 /mnt/disk2"
echo "   chown -R pi:pi /mnt/disk1"
echo "   chown -R pi:pi /mnt/disk2"
echo "---------------------------------------------------"

# Setup Project Directory
USER_HOME=$(eval echo ~${SUDO_USER})
PROJECT_DIR="$USER_HOME/MajorProj/server"

if [ -d "$PROJECT_DIR" ]; then
    echo "taking ownership of project dir..."
    chown -R $SUDO_USER:$SUDO_USER "$PROJECT_DIR"
fi

# Create Production Config for PM2
echo "Generating ecosystem.config.js..."
cat > $PROJECT_DIR/ecosystem.config.js <<EOF
module.exports = {
  apps : [{
    name   : "majorproj-server",
    script : "./dist/index.js",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      STORAGE_PRIMARY: "/mnt/disk1/majorproj_storage",
      STORAGE_MIRROR: "/mnt/disk2/majorproj_storage",
      CLAMAV_PATH: "/usr/bin/clamscan"
    }
  }]
}
EOF

echo "Done! After mounting disks, run:"
echo "cd $PROJECT_DIR"
echo "npm install"
echo "npm run build"
echo "pm2 start ecosystem.config.js"
echo "pm2 save"
echo "pm2 startup"
