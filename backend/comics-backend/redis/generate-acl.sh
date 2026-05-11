#!/bin/sh
cat > /tmp/acl.conf << EOF
user default off
user ${REDIS_USER} on >${REDIS_PASSWORD} ~* &* +@all
EOF
exec redis-server --requirepass "${REDIS_PASSWORD}" --aclfile /tmp/acl.conf
