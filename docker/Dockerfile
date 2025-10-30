# syntax=docker/dockerfile:1
FROM node:20-bullseye

ARG DEBIAN_FRONTEND=noninteractive
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    openjdk-17-jdk-headless \
    git \
    wget \
    unzip \
    python3 \
    python3-pip \
    build-essential \
    ruby-full \
    watchman \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install Android command line tools and required SDK packages
RUN mkdir -p "$ANDROID_SDK_ROOT"/cmdline-tools \
  && cd /tmp \
  && wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip \
  && unzip -q commandlinetools-linux-11076708_latest.zip \
  && mkdir -p "$ANDROID_SDK_ROOT"/cmdline-tools/latest \
  && mv cmdline-tools/* "$ANDROID_SDK_ROOT"/cmdline-tools/latest/ \
  && yes | "$ANDROID_SDK_ROOT"/cmdline-tools/latest/bin/sdkmanager --sdk_root="$ANDROID_SDK_ROOT" "platform-tools" "platforms;android-34" "build-tools;34.0.0" \
  && yes | "$ANDROID_SDK_ROOT"/cmdline-tools/latest/bin/sdkmanager --sdk_root="$ANDROID_SDK_ROOT" --licenses \
  && rm -rf /tmp/*

ENV PATH="$PATH:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin"

RUN corepack enable \
  && corepack prepare pnpm@10.20.0 --activate

WORKDIR /workspace

RUN set -eux; \
  mv /opt/android-sdk/platform-tools/adb /opt/android-sdk/platform-tools/adb.real

# 2) ラッパー本体を書き込み（※ heredoc の行末に何も足さない）
RUN cat > /opt/android-sdk/platform-tools/adb <<'SH'
#!/usr/bin/env bash
set -euo pipefail
HOST="host.docker.internal"
PORT="5037"
REAL="/opt/android-sdk/platform-tools/adb.real"

# Expo が絶対パスで呼ぶ emu avd name を代替（console不要）
if [[ " $* " == *" emu avd name"* ]]; then
  SERIAL=""
  for ((i=1; i<=$#; i++)); do
    if [[ "${!i}" == "-s" ]]; then
      j=$((i+1))
      SERIAL="${!j:-}"
      break
    fi
  done
  NAME="$("$REAL" -H "$HOST" -P "$PORT" ${SERIAL:+-s "$SERIAL"} shell getprop ro.boot.qemu.avd_name 2>/dev/null | tr -d '\r')"
  if [[ -z "$NAME" ]]; then
    NAME="$("$REAL" -H "$HOST" -P "$PORT" ${SERIAL:+-s "$SERIAL"} shell getprop ro.kernel.qemu.avd_name 2>/dev/null | tr -d '\r')"
  fi
  if [[ -n "$NAME" ]]; then
    echo "$NAME"
    exit 0
  else
    exit 1
  fi
fi

# それ以外は常にホストの ADB サーバへ
export ADB_SERVER_SOCKET="tcp:$HOST:$PORT"
exec "$REAL" -H "$HOST" -P "$PORT" "$@"
SH

# 3) 実行権限を付与
RUN chmod +x /opt/android-sdk/platform-tools/adb

CMD ["bash"]
