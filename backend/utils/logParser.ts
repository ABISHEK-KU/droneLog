import fs from "fs";
import { MavLinkPacketParser } from "node-mavlink";
import * as mavlink from "node-mavlink";

export async function parseTlog(filePath: string) {
  console.log(`Parsing file: ${filePath}`);
  const buffer = fs.readFileSync(filePath);
  const parser = new MavLinkPacketParser();
  const packets: any[] = [];

  let startTime: Date | undefined;
  let endTime: Date | undefined;

  const gpsTrack: Array<{
    lat: number;
    lon: number;
    alt?: number;
    ts?: number;
  }> = [];
  const incidents: Array<{
    title: string;
    description: string;
    severity: "low" | "medium" | "high";
    timestamp?: Date;
  }> = []; // Listen for decoded MAVLink messages

  parser.on("data", (msg) => {
    // Decode message name and fields if not already decoded
    if (!msg.name) {
      const msgid = msg.header.msgid;
      const messages = Object.values(mavlink.common);
      const messageClass = messages.find((m: any) => m.MSG_ID === msgid);
      if (messageClass) {
        msg.name = (messageClass as any).MSG_NAME; // Manually unpack payload for ATTITUDE (msgid 30)
        if (msgid === 30) {
          const payload = msg.payload.slice(0, msg.header.payloadLength);
          msg.timeBootMs = payload.readUInt32LE(0);
          msg.roll = payload.readFloatLE(4);
          msg.pitch = payload.readFloatLE(8);
          msg.yaw = payload.readFloatLE(12);
          msg.rollspeed = payload.readFloatLE(16);
          msg.pitchspeed = payload.readFloatLE(20);
          msg.yawspeed = payload.readFloatLE(24);
        }
      }
    }

    if (!msg.name) return;

    console.log("Message received:", msg.name, "ID:", msg.header?.msgid);
    packets.push(msg); // Extract timestamps (relying on node-mavlink for time_usec extraction) // TLOG timestamp is external to the packet, so this relies on the library // to either extract it or for the messages to contain it (e.g., SYSTEM_TIME).

    const time_usec = msg.time_usec || msg.header?.time_usec || msg.timeBootMs;
    if (time_usec) {
      const ts = new Date(time_usec / 1000);
      if (!startTime || ts < startTime) startTime = ts;
      if (!endTime || ts > endTime) endTime = ts;
    } // GPS data

    if (msg.name === "GPS_RAW_INT" && msg.lat && msg.lon) {
      gpsTrack.push({
        lat: msg.lat / 1e7,
        lon: msg.lon / 1e7,
        alt: msg.alt ? msg.alt / 1000 : undefined,
        ts: time_usec ? time_usec / 1000 : undefined,
      });
    } else if (msg.name === "GLOBAL_POSITION_INT" && msg.lat && msg.lon) {
      gpsTrack.push({
        lat: msg.lat / 1e7,
        lon: msg.lon / 1e7,
        alt: msg.alt ? msg.alt / 1000 : undefined,
        ts: time_usec ? time_usec / 1000 : undefined,
      });
    } // Incident detection (based on STATUSTEXT)

    if (msg.name === "STATUSTEXT" && msg.text) {
      let severity: "low" | "medium" | "high" = "low"; // MAV_SEVERITY: 0-7, 4=CRITICAL, 2=WARNING
      if (msg.severity >= 4) severity = "high";
      else if (msg.severity >= 2) severity = "medium";

      incidents.push({
        title: "Status Alert",
        description: msg.text,
        severity,
        timestamp: time_usec ? new Date(time_usec / 1000) : undefined,
      });
    }
  });

  let offset = 0;
  const TIMESTAMP_LEN = 8;
  while (offset + TIMESTAMP_LEN < buffer.length) {
    const packetStart = offset + TIMESTAMP_LEN;
    const magic = buffer[packetStart]; // Check for MAVLink magic byte (0xFE for v1, 0xFD for v2)
    console.log(
      `Offset: ${offset}, packetStart: ${packetStart}, magic: 0x${magic.toString(
        16
      )}, buffer length: ${buffer.length}`
    );
    if (magic !== 0xfe && magic !== 0xfd) {
      // Failed to find a packet at the expected position. Move one byte and try to re-sync.
      console.log("Invalid magic, skipping");
      offset++;
      continue;
    }

    const payloadLen = buffer[packetStart + 1]; // MAVLink packet length calculation (Header + Payload + Checksum)
    const headerLen = magic === 0xfd ? 10 : 6;
    const packetLen = headerLen + payloadLen + 2;
    console.log(
      `PayloadLen: ${payloadLen}, headerLen: ${headerLen}, packetLen: ${packetLen}`
    );

    if (packetStart + packetLen > buffer.length) {
      // Incomplete packet at the end of the file. Stop reading.
      console.log("Incomplete packet, stopping");
      break;
    }

    const packet = buffer.slice(packetStart, packetStart + packetLen);
    console.log(
      `Attempting to parse packet at offset ${packetStart}, length ${packetLen}`
    );
    try {
      parser.write(packet);
      console.log("Packet written successfully");
    } catch (error) {
      // Malformed MAVLink packet (e.g., bad CRC). Skip the entire block and try to re-sync
      console.log("Error parsing packet:", error);
      offset = packetStart + packetLen;
      continue;
    } // CRITICAL FIX: Advance the offset by the total block size: // TIMESTAMP_LEN (8 bytes) + packetLen (MAVLink packet)
    offset = packetStart + packetLen;
  }

  parser.end();

  const durationSeconds =
    startTime && endTime
      ? (endTime.getTime() - startTime.getTime()) / 1000
      : undefined;

  console.log("Summary:", {
    messages: packets.length,
    gpsCount: gpsTrack.length,
    incidentCount: incidents.length,
    firstMessages: packets.slice(0, 3).map((m) => m.name)
  });

  return {
    summary: {
      filePath,
      messageCount: packets.length,
      startTime,
      endTime,
      durationSeconds,
      gpsCount: gpsTrack.length,
      gpsTrack: gpsTrack.slice(0, 5), // show few samples
      incidents,
      sampleMessages: packets.slice(0, 5),
    },
  };
}
