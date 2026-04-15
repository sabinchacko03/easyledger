# Development Setup

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) OR docker in ubuntu
- [Node.js](https://nodejs.org/) 18+
- [Java JDK 17](https://adoptium.net/temurin/releases/?version=17) (for Android builds)
- [Android Studio](https://developer.android.com/studio) with Android SDK
- Android device with **USB Debugging** enabled, or an Android emulator

---

## API (Laravel + Docker Sail)

### First-time setup

```bash
cd api
cp .env.example .env
```

Since PHP is not installed locally, use Docker to run the initial `composer install`:

```bash
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php83-composer:latest \
    composer install --ignore-platform-reqs
```

Then start Sail and finish setup:

```bash
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate:fresh --seed
```

### Daily start

```bash
cd api
./vendor/bin/sail up -d
```

### Stop

```bash
./vendor/bin/sail down
```

> **Note:** XAMPP must be stopped before starting Sail — both use port 80 and 3306.

### Access

| Service      | URL                        |
|--------------|----------------------------|
| API          | http://localhost:8080/api  |
| Mailpit UI   | http://localhost:8025      |

---

## Mobile (React Native / Expo)

### First-time setup

```bash
cd mobile
npm install
```

### Running on a real Android device

#### Option A: Same Wi-Fi (home / shared network)

1. Find your PC's local IP: run `ipconfig`, look for IPv4 under Wi-Fi adapter
2. Update `mobile/.env`:
   ```
   EXPO_PUBLIC_API_URL=http://<your-pc-ip>:8080/api
   ```
3. Connect phone to the same Wi-Fi
4. Run:
   ```bash
   npm run android
   ```

#### Option B: USB (office network / no shared Wi-Fi)

1. Connect phone via USB cable
2. Enable **Developer Options** on phone: Settings → About Phone → tap Build Number 7 times
3. Enable **USB Debugging** in Developer Options
4. Set up the adb tunnel (required every session / after reconnecting USB):
   ```bash
   adb reverse tcp:8080 tcp:8080
   ```
5. Update `mobile/.env`:
   ```
   EXPO_PUBLIC_API_URL=http://localhost:8080/api
   ```
6. Run:
   ```bash
   npm run android
   ```

> **adb reverse** tunnels the phone's `localhost:8080` through the USB cable to your PC's port 8080.
> Re-run it whenever you replug the cable, restart the phone, or wake the PC from sleep.

### Running on emulator

```bash
npm run android
```

The default `EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api` works for the Android emulator automatically (`10.0.2.2` routes to the host machine).

---

## Troubleshooting

### `JAVA_HOME is not set`
Install JDK 17 and set the environment variable:
- Variable name: `JAVA_HOME`
- Variable value: your JDK install path (e.g. `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot`)
- Add `%JAVA_HOME%\bin` to `Path`

### `NDK did not have a source.properties file`
The NDK installation is corrupted. In Android Studio: SDK Manager → SDK Tools → uncheck NDK → Apply → re-check NDK → Apply.

### `Network request failed` on login
- Re-run `adb reverse tcp:8080 tcp:8080`
- Confirm Sail is running: `./vendor/bin/sail ps`
- For USB option: confirm phone is connected and adb sees it: `adb devices`

### Port 8081 already in use
Expo will prompt to use 8082 — press Y. No impact on functionality.
