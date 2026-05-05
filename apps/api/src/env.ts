export const env = {
  port: Number(process.env.API_PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "change-me-in-production",
  publicUrl: process.env.PLAYER2_PUBLIC_URL ?? "http://localhost:3000"
};

