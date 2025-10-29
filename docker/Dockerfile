# syntax=docker/dockerfile:1
FROM node:18-bullseye

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
  && corepack prepare yarn@stable --activate

WORKDIR /workspace

CMD ["bash"]
