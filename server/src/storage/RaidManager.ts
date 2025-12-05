import * as fs from "fs";
import * as path from "path";
import { config } from "../config";
import { healthMonitor } from "./HealthMonitor";

export class RaidManager {
  private primaryRoot: string;
  private mirrorRoot: string;

  constructor() {
    this.primaryRoot = config.storage.primary;
    this.mirrorRoot = config.storage.mirror;
    this.ensureRoots();
  }

  private async ensureRoots() {
    try {
      await fs.promises.mkdir(this.primaryRoot, { recursive: true });
      healthMonitor.updateDiskStatus("primary", "ONLINE");
    } catch (e) {
      console.error("Failed to access primary storage:", e);
      healthMonitor.updateDiskStatus("primary", "OFFLINE");
    }

    try {
      await fs.promises.mkdir(this.mirrorRoot, { recursive: true });
      healthMonitor.updateDiskStatus("mirror", "ONLINE");
    } catch (e) {
      console.error("Failed to access mirror storage:", e);
      healthMonitor.updateDiskStatus("mirror", "OFFLINE");
    }
  }

  /**
   * Writes a file to both disks.
   * Throws error only if BOTH writes fail.
   */
  async write(sourcePath: string, relativeDestPath: string): Promise<void> {
    const primaryDest = path.join(this.primaryRoot, relativeDestPath);
    const mirrorDest = path.join(this.mirrorRoot, relativeDestPath);

    let primarySuccess = false;
    let mirrorSuccess = false;

    // Ensure directories exist
    const dirName = path.dirname(relativeDestPath);
    
    // Try Primary
    try {
      await fs.promises.mkdir(path.join(this.primaryRoot, dirName), { recursive: true });
      await fs.promises.copyFile(sourcePath, primaryDest);
      primarySuccess = true;
      healthMonitor.resetFailureCount("primary");
    } catch (e) {
      console.error("Write failed on Primary:", e);
      healthMonitor.recordWriteFailure("primary");
    }

    // Try Mirror
    try {
      await fs.promises.mkdir(path.join(this.mirrorRoot, dirName), { recursive: true });
      await fs.promises.copyFile(sourcePath, mirrorDest);
      mirrorSuccess = true;
      healthMonitor.resetFailureCount("mirror");
    } catch (e) {
      console.error("Write failed on Mirror:", e);
      healthMonitor.recordWriteFailure("mirror");
    }

    if (!primarySuccess && !mirrorSuccess) {
      throw new Error("RAID Write Failed: Both disks unavailable");
    }

    if (!primarySuccess || !mirrorSuccess) {
      healthMonitor.setSyncStatus("FAILED");
      console.warn("RAID Degraded: Write succeeded on only one disk");
    }
  }

  /**
   * Reads a file, preferring primary, falling back to mirror.
   */
  getReadStream(relativeFilePath: string): fs.ReadStream {
    const primaryPath = path.join(this.primaryRoot, relativeFilePath);
    const mirrorPath = path.join(this.mirrorRoot, relativeFilePath);

    if (fs.existsSync(primaryPath)) {
      return fs.createReadStream(primaryPath);
    } else if (fs.existsSync(mirrorPath)) {
      console.warn(`Reading from Mirror for ${relativeFilePath}`);
      return fs.createReadStream(mirrorPath);
    } else {
      throw new Error("File not found on any disk");
    }
  }

  async delete(relativeFilePath: string): Promise<void> {
    const primaryPath = path.join(this.primaryRoot, relativeFilePath);
    const mirrorPath = path.join(this.mirrorRoot, relativeFilePath);

    try {
      if (fs.existsSync(primaryPath)) await fs.promises.unlink(primaryPath);
    } catch (e) {
      console.error("Delete failed on Primary:", e);
    }

    try {
      if (fs.existsSync(mirrorPath)) await fs.promises.unlink(mirrorPath);
    } catch (e) {
      console.error("Delete failed on Mirror:", e);
    }
  }

  /**
   * Checks if file exists on at least one disk
   */
  exists(relativeFilePath: string): boolean {
    const primaryPath = path.join(this.primaryRoot, relativeFilePath);
    const mirrorPath = path.join(this.mirrorRoot, relativeFilePath);
    return fs.existsSync(primaryPath) || fs.existsSync(mirrorPath);
  }

  /**
   * Rebuilds the RAID array by syncing files between disks.
   * This is a simplified implementation that copies missing files.
   */
  async rebuild(): Promise<void> {
    if (healthMonitor.getHealth().syncStatus === "SYNCING") {
      console.log("Rebuild already in progress");
      return;
    }

    healthMonitor.setSyncStatus("SYNCING");
    console.log("Starting RAID rebuild...");

    try {
      // Sync Primary -> Mirror
      await this.syncDir(this.primaryRoot, this.mirrorRoot);
      // Sync Mirror -> Primary (in case Primary was replaced)
      await this.syncDir(this.mirrorRoot, this.primaryRoot);

      healthMonitor.setSyncStatus("SYNCED");
      console.log("RAID rebuild complete.");
    } catch (e) {
      console.error("RAID rebuild failed:", e);
      healthMonitor.setSyncStatus("FAILED");
    }
  }

  private async syncDir(sourceRoot: string, destRoot: string, relativeDir: string = "") {
    const sourcePath = path.join(sourceRoot, relativeDir);
    const destPath = path.join(destRoot, relativeDir);

    if (!fs.existsSync(sourcePath)) return;
    if (!fs.existsSync(destPath)) await fs.promises.mkdir(destPath, { recursive: true });

    const entries = await fs.promises.readdir(sourcePath, { withFileTypes: true });

    for (const entry of entries) {
      const entryRelativePath = path.join(relativeDir, entry.name);
      const entrySourcePath = path.join(sourceRoot, entryRelativePath);
      const entryDestPath = path.join(destRoot, entryRelativePath);

      if (entry.isDirectory()) {
        await this.syncDir(sourceRoot, destRoot, entryRelativePath);
      } else if (entry.isFile()) {
        if (!fs.existsSync(entryDestPath)) {
          console.log(`Rebuilding: Copying ${entryRelativePath} to ${destRoot}`);
          await fs.promises.copyFile(entrySourcePath, entryDestPath);
        }
      }
    }
  }
}

export const raidManager = new RaidManager();
