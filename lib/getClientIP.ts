// Utility function to extract the client's IP address from request headers
export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");

  if (xForwardedFor) {
    // "client, proxy1, proxy2"
    return xForwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}