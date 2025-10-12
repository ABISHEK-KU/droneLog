import fs from "fs";
import path from "path";
import { MavLinkPacketParser } from "node-mavlink";

export async function parseTlog(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".tlog") {
    const parser = new MavLinkPacketParser();
    const packets: any[] = [];
    let startTime: Date | undefined;
    let endTime: Date | undefined;
    const gpsTrack: Array<{ lat: number; lon: number; alt?: number; ts?: number }> = [];
    const incidents: Array<{ title: string; description: string; severity: "low" | "medium" | "high"; timestamp?: Date }> = [];

    parser.on("message", (msg) => {
      packets.push(msg);

      // Extract timestamps (assuming msg.header.time_usec or similar)
      if (msg.header && msg.header.time_usec) {
        const ts = new Date(msg.header.time_usec / 1000); // Convert microseconds to milliseconds
        if (!startTime || ts < startTime) startTime = ts;
        if (!endTime || ts > endTime) endTime = ts;
      }

      // Extract GPS data (e.g., from GPS_RAW_INT or GLOBAL_POSITION_INT)
      if (msg.name === "GPS_RAW_INT" && msg.lat && msg.lon) {
        gpsTrack.push({
          lat: msg.lat / 1e7, // Convert to degrees
          lon: msg.lon / 1e7,
          alt: msg.alt ? msg.alt / 1000 : undefined, // Convert mm to meters
          ts: msg.header?.time_usec ? msg.header.time_usec / 1000 : undefined,
        });
      } else if (msg.name === "GLOBAL_POSITION_INT" && msg.lat && msg.lon) {
        gpsTrack.push({
          lat: msg.lat / 1e7,
          lon: msg.lon / 1e7,
          alt: msg.alt ? msg.alt / 1000 : undefined,
          ts: msg.header?.time_usec ? msg.header.time_usec / 1000 : undefined,
        });
      }

      // Detect incidents from STATUSTEXT messages
      if (msg.name === "STATUSTEXT" && msg.severity > 0) {
        let severity: "low" | "medium" | "high" = "low";
        if (msg.severity >= 4) severity = "high";
        else if (msg.severity >= 2) severity = "medium";
        incidents.push({
          title: "Status Alert",
          description: msg.text || "Unknown status message",
          severity,
          timestamp: msg.header?.time_usec ? new Date(msg.header.time_usec / 1000) : undefined,
        });
      }
    });

    await new Promise<void>((resolve, reject) => {
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(parser);
      readStream.on("end", () => resolve());
      readStream.on("error", reject);
    });

    const durationSeconds = startTime && endTime ? (endTime.getTime() - startTime.getTime()) / 1000 : undefined;

    return {
      summary: {
        filePath: filePath,
        messageCount: packets.length,
        sampleMessage: packets.slice(0, 5),
        startTime,
        endTime,
        durationSeconds,
        gpsTrack,
        incidents,
      },
    };
  }
}
