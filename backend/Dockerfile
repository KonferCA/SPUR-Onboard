FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download

RUN CGO_ENABLED=0 GOOS=linux go build -o app

FROM alpine:3.20
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/app .
RUN mkdir -p static/dist
EXPOSE 6969
ENV APP_ENV="production"
CMD ["./app"]
