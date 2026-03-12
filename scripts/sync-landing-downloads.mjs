import { copyFile, mkdir, stat } from 'fs/promises';
import path from 'path';

const cwd = process.cwd();

const landingDir = path.join(cwd, 'public', 'landing');
const androidApkSource =
  process.env.CROPAID_ANDROID_APK ||
  path.join(cwd, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const windowsInstallerSource =
  process.env.CROPAID_WINDOWS_INSTALLER || path.join(cwd, 'release', 'CropAid-Setup.exe');

async function tryCopy(source, dest, label) {
  try {
    const info = await stat(source);
    await mkdir(path.dirname(dest), { recursive: true });
    await copyFile(source, dest);
    console.log(`Synced ${label}: ${path.relative(cwd, dest)} (${info.size} bytes)`);
    return true;
  } catch (err) {
    console.warn(`Skip ${label}: ${err.code === 'ENOENT' ? 'missing source' : err.message}`);
    return false;
  }
}

async function main() {
  await mkdir(landingDir, { recursive: true });

  await tryCopy(androidApkSource, path.join(landingDir, 'cropaid.apk'), 'Android APK');
  await tryCopy(windowsInstallerSource, path.join(landingDir, 'CropAid-Setup.exe'), 'Windows installer');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

