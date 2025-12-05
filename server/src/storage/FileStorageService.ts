import * as fs from "fs";
import * as path from "path";
import { raidManager } from "./RaidManager";
export class FileStorageService {
  
  /**
   * Orchestrates the secure upload pipeline:
   * 1. Validates file existence in temp
   * 2. Moves to RAID storage (Primary + Mirror)
   * 3. Cleans up temp file
   */
  static async storeFile(tempFilePath: string, userId: string, fileId: string): Promise<string> {
    // 1. Validate
    if (!fs.existsSync(tempFilePath)) {
      throw new Error("Temp file not found");
    }

    try {


      // 3. Move to RAID
      // Structure: users/<userId>/<fileId>
      const relativePath = path.join("users", userId, fileId);
      
      console.log(`Writing to RAID: ${relativePath}`);
      await raidManager.write(tempFilePath, relativePath);

      // 4. Cleanup
      await fs.promises.unlink(tempFilePath);

      return relativePath;

    } catch (error) {
      // Ensure cleanup on error
      if (fs.existsSync(tempFilePath)) {
        await fs.promises.unlink(tempFilePath).catch(() => {});
      }
      throw error;
    }
  }

  static getReadStream(relativePath: string) {
    return raidManager.getReadStream(relativePath);
  }

  static async deleteFile(relativePath: string) {
    return raidManager.delete(relativePath);
  }
}
