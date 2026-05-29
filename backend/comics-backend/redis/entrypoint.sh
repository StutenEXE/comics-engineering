#!/bin/sh
exec redis-server \
  --requirepass "$REDIS_PASSWORD" \
  --aclfile /usr/local/etc/redis/acl.conf