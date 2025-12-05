import { EventEmitter } from "events";

export interface DiskHealth {
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  lastCheck: Date;
  freeSpaceBytes: number;
  totalSpaceBytes: number;
  writeFailures: number;
}

export interface SystemHealth {
  primary: DiskHealth;
  mirror: DiskHealth;
  syncStatus: "SYNCED" | "SYNCING" | "FAILED";
  lastSync: Date | null;
  pendingRebuilds: number;
}

class HealthMonitor extends EventEmitter {
  private health: SystemHealth = {
    primary: {
      status: "ONLINE",
      lastCheck: new Date(),
      freeSpaceBytes: 0,
      totalSpaceBytes: 0,
      writeFailures: 0,
    },
    mirror: {
      status: "ONLINE",
      lastCheck: new Date(),
      freeSpaceBytes: 0,
      totalSpaceBytes: 0,
      writeFailures: 0,
    },
    syncStatus: "SYNCED",
    lastSync: new Date(),
    pendingRebuilds: 0,
  };

  constructor() {
    super();
  }

  public getHealth(): SystemHealth {
    return { ...this.health };
  }

  public updateDiskStatus(disk: "primary" | "mirror", status: "ONLINE" | "DEGRADED" | "OFFLINE") {
    this.health[disk].status = status;
    this.health[disk].lastCheck = new Date();
    this.emit("healthChange", this.health);
  }

  public recordWriteFailure(disk: "primary" | "mirror") {
    this.health[disk].writeFailures++;
    if (this.health[disk].writeFailures > 5) {
      this.updateDiskStatus(disk, "DEGRADED");
    }
  }

  public resetFailureCount(disk: "primary" | "mirror") {
    this.health[disk].writeFailures = 0;
  }

  public setSyncStatus(status: "SYNCED" | "SYNCING" | "FAILED") {
    this.health.syncStatus = status;
    if (status === "SYNCED") {
      this.health.lastSync = new Date();
    }
    this.emit("syncChange", this.health);
  }

  public updateSpace(disk: "primary" | "mirror", free: number, total: number) {
    this.health[disk].freeSpaceBytes = free;
    this.health[disk].totalSpaceBytes = total;
  }
}

export const healthMonitor = new HealthMonitor();
