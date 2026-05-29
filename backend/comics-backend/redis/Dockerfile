FROM redis:7-alpine

COPY ./generate-acl.sh /entrypoint.sh

RUN apk add --no-cache dos2unix \
    && dos2unix /entrypoint.sh \
    && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
