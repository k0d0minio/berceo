import "server-only";

import QRCode from "qrcode";

import { QR_OPTIONS, QR_PNG_WIDTH, type QrFormat } from "./commune-qr";

/**
 * Draws a QR code on the server with the package `qrcode` (JAM-361): no
 * third-party service gets the link, and the package stays out of the client
 * bundle. The only file that imports the package.
 */
export async function renderQr(url: string, format: QrFormat): Promise<string | Uint8Array> {
  if (format === "svg") return QRCode.toString(url, { ...QR_OPTIONS, type: "svg" });
  return QRCode.toBuffer(url, { ...QR_OPTIONS, type: "png", width: QR_PNG_WIDTH });
}
