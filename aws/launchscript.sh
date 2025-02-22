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


# check that all the required variables are set
check_env() {
    if [ -z "$1" ]; then
        echo "Error: $1 is not set"
        exit 1
    fi
}

# Check each variable
check_env "$APP_ENV"
check_env "$APP_NAME"
check_env "$SITE_URL"

# define a log function to easily log messages
log() {
    if [ -z "$1" ]; then
        echo "Error: Log message is required"
        return 1
    fi

    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    # Create log file if it doesn't exist
    touch "$LOG_FILE" 2>/dev/null || {
        echo "Error: Cannot create log file"
        return 1
    }

    # Write to log file
    echo "[$timestamp] $message" >> "$LOG_FILE"
}

# update packages
log "update packages >> apt update -y"
apt update -y


# donwload go
log "download go >> wget $GO_DOWNLOAD_URL"
apt install -y wget
wget $GO_DOWNLOAD_URL

# install go
log "remove old go installation"
rm -rf $GOROOT

log "unpack go tar file"
tar -xzf $GO_PKG_NAME

log "move extracted go files to /usr/local"
mv go $USR_LOCAL_PATH

# clean up
log "remove downloaded go tar file"
rm -f $GO_PKG_NAME

log "add GOROOT, GOPATH and PATH exports to /home/ubuntu/.bashrc"
echo "export GOROOT=$GOROOT" >> /home/ubuntu/.bashrc
echo "export GOPATH=$GOPATH" >> /home/ubuntu/.bashrc
echo "export PATH=\$PATH:$GOROOT/bin:$GOPATH/bin" >> /home/ubuntu/.bashrc

log "Make directory for go instllations at /opt/go"
mkdir -p $GOPATH

log "Install goose for migrations"
GOPATH=$GOPATH $GOROOT/bin/go install github.com/pressly/goose/v3/cmd/goose@v3.22.1

# add docker's official gpg key:
log "install docker build dependency tools"
apt install -y ca-certificates curl
log "install docker repository gpg key"
install -m 0755 -d /etc/apt/keyrings
log "download docker .asc file"
curl -fssl https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
log "chmod /etc/apt/keyrings/docker.asc"
chmod a+r /etc/apt/keyrings/docker.asc

# add the repository to apt sources:
log "add repository to apt sources"
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
log "update packages after adding docker repository to apt sources"
apt update -y

# install docker
log "install docker"
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# add ubuntu user to docker group
log "add ubuntu user to docker group"
usermod -aG docker ubuntu

# install nginx
log "install nginx"
apt install -y nginx
log "enable nginx"
systemctl enable nginx
log "start nginx"
systemctl start nginx

log "Make static files directory"
mkdir -p $STATIC_DIR
log "Setup Nginx site file"
echo "
# Rate limiting zone definition
limit_req_zone \$binary_remote_addr zone=two:10m rate=10r/s;

# SSL session settings
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;

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

        # security headers
        add_header X-Frame-Options \"SAMEORIGIN\";
        add_header X-XSS-Protection \"1; mode=block\";
        add_header X-Content-Type-Options \"nosniff\";
        add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
        add_header Permissions-Policy \"camera=(), microphone=(), geolocation=()\" always;
        add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';\" always;
    }

    # backend
    location /api {
        # rate limiting
        limit_req zone=two burst=20 nodelay;
        limit_req_status 444;
        
        # proxy settings
        proxy_pass http://127.0.0.1:6969;
        proxy_http_version 1.1;
        proxy_cache_bypass \$http_upgrade;
        
        # proxy headers
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-App-Name nk-staging;
        
        # proxy timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Disable methods
    if (\$request_method !~ ^(GET|HEAD|POST|PUT|PATCH|DELETE|OPTIONS)$) {
        return 444;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $SITE_URL; 
    return 301 https://\$server_name\$request_uri;
}
" > /etc/nginx/sites-available/$APP_NAME-$APP_ENV # override old site nginx settings

# Make the SSL directory to store the certificate and private key
log "Make SSL directory"
mkdir -p "/etc/ssl/${APP_NAME}/${APP_ENV}"

log "Disable default site Nginx configuration"
[ -L "/etc/nginx/sites-enabled/default" ] && rm "/etc/nginx/sites-enabled/default"

# The ownership is changed so that for any future changes
# can be done via user ubuntu instead of running 'sudo'
log "Change static directory ownership"
chown -R ubuntu:ubuntu $PUBLIC_ROOT
