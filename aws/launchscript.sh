# ---------------------------------------------------------------------
# This script must be ran manually on the cloud server and with 'sudo' |
# Make sure to define the APP_ENV value before running the script.     |
# ---------------------------------------------------------------------

# ---------------------------------------------------------------------
# IMPORTANT SETUP BEFORE RUNNING SCRIPT                                |
# 1. Set APP_ENV & APP_NAME & SITE_URL                                 |
# 1. Make sure all variables look correct before proceeding            |
# ---------------------------------------------------------------------

# Common config variables
# -----------------------
APP_ENV=
APP_NAME=
LOG_FILE=/tmp/launchscript.log
USR_LOCAL_PATH=/usr/local

# Go installation variables
# -------------------------
GO_PKG_NAME=go1.23.6.linux-amd64.tar.gz
GO_DOWNLOAD_URL="https://go.dev/dl/$GO_PKG_NAME"
# GOPATH is the path that installation via 'go install' will be saved to
GOPATH=/opt/go
# GOROOT is the root path of the go binary
GOROOT="$USR_LOCAL_PATH/go"

# Docker installation variables
# -----------------------------
# Variables that define the ubuntu version. These are used when installing Docker.
UBUNTU_CODENAME=noble # Do not change if using 24.04LTS
VERSION_CODENAME=noble # Do not change if using 24.04LTS

# Nginx installation variables
# ----------------------------
# THIS MUST BE SET FOR NGINX TO PROPERLY SERVE THE SITE
# Do not include https://. i.e: konfer.ca or hawkhacks.konfer.ca
SITE_URL=
PUBLIC_ROOT=/etc/public
# APP_NAME and APP_ENV is used to allow using the same instance for running
# different versions of the same app under a new Nginx site configuration
STATIC_DIR="$PUBLIC_ROOT/$APP_NAME/$APP_ENV"


# check if APP_ENV is defined or not
if [ -z "${APP_ENV}"  ]; then
    echo "APP_ENV is not set. Common values include 'development', 'staging', and 'production'"
    exit 1
fi

# intialize launch script log file
touch $LOG_FILE

# update packages
echo "update packages >> apt update -y" >> $LOG_FILE
apt update -y


# donwload go
echo "download go >> wget $GO_DOWNLOAD_URL" >> $LOG_FILE
apt install -y wget
wget $GO_DOWNLOAD_URL

# install go
echo "remove old go installation" >> $LOG_FILE
rm -rf $GOROOT

echo "unpack go tar file" >> $LOG_FILE
tar -xzf $GO_PKG_NAME

echo "move extracted go files to /usr/local" >> $LOG_FILE
mv go $USR_LOCAL_PATH

# clean up
echo "remove downloaded go tar file" >> $LOG_FILE
rm -f $GO_PKG_NAME

echo "add GOROOT, GOPATH and PATH exports to /home/ubuntu/.bashrc" >> $LOG_FILE
echo "export GOROOT=$GOROOT" >> /home/ubuntu/.bashrc
echo "export GOPATH=$GOPATH" >> /home/ubuntu/.bashrc
echo "export PATH=\$PATH:$GOROOT/bin:$GOPATH/bin" >> /home/ubuntu/.bashrc

echo "Make directory for go instllations at /opt/go" >> $LOG_FILE
mkdir -p $GOPATH

echo "Install goose for migrations" >> $LOG_FILE
GOPATH=$GOPATH $GOROOT/bin/go install github.com/pressly/goose/v3/cmd/goose@v3.22.1

# add docker's official gpg key:
echo "install docker build dependency tools" >> $LOG_FILE
apt install -y ca-certificates curl
echo "install docker repository gpg key" >> $LOG_FILE
install -m 0755 -d /etc/apt/keyrings
echo "download docker .asc file" >> $LOG_FILE
curl -fssl https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "chmod /etc/apt/keyrings/docker.asc" >> $LOG_FILE
chmod a+r /etc/apt/keyrings/docker.asc

# add the repository to apt sources:
echo "add repository to apt sources" >> $LOG_FILE
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
echo "update packages after adding docker repository to apt sources" >> $LOG_FILE
apt update -y

# install docker
echo "install docker" >> $LOG_FILE
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# add ubuntu user to docker group
echo "add ubuntu user to docker group" >> $LOG_FILE
usermod -aG docker ubuntu

# install nginx
echo "install nginx" >> $LOG_FILE
apt install -y nginx
echo "enable nginx" >> $LOG_FILE
systemctl enable nginx
echo "start nginx" >> $LOG_FILE
systemctl start nginx

echo "Make static files directory" >> $LOG_FILE
mkdir -p $STATIC_DIR
echo "Setup Nginx site file" >> $LOG_FILE
echo "limit_req_zone \$binary_remote_addr zone=two:10m rate=10r/s;

server {
    listen 443 ssl;
    server_name $SITE_URL;

    ssl_certificate /etc/ssl/$APP_NAME/$APP_ENV/cert.pem;
    ssl_certificate_key /etc/ssl/$APP_NAME/$APP_ENV/key.pem;

    root $STATIC_DIR;
    index index.html

    gzip on;
    gzip_vary on;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript
 application/x-javascript application/xml;
    gzip_disable \"MSIE [1-6]\.\";


    # frontend
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header X-Frame-Options \"SAMEORIGIN\";
        add_header X-XSS-Protection \"1; mode=block\";
        add_header X-Content-Type-Options \"nosniff\";
    }


    # backend
    location /api/v1 {
        limit_req zone=two burst=20 nodelay;
        limit_req_status 444;
        proxy_pass http://127.0.0.1:6969;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-App-Name nk-staging;
    }

    # deny access to hidden files
    location ~ /\. {
        deny all;
    }
}" > /etc/nginx/sites-available/$APP_NAME-$APP_ENV # override old site nginx settings

# Make the SSL directory to store the certificate and private key
echo "Make SSL directory" >> $LOG_FILE
mkdir -p "/etc/ssl/${APP_NAME}/${APP_ENV}"

# The ownership is changed so that for any future changes
# can be done via user ubuntu instead of running 'sudo'
echo "Change static directory ownership" >> $LOG_FILE
chown -R ubuntu:ubuntu $PUBLIC_DIR
