# Build stage
FROM golang:1.26-alpine AS build

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/rinjani-api ./cmd

# Runtime stage
FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata && addgroup -S app && adduser -S app -G app

COPY --from=build /out/rinjani-api /app/rinjani-api

USER app

EXPOSE 8000

ENTRYPOINT ["/app/rinjani-api"]
