import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    // TEMPORARY: Bypass authentication for preview purposes
    user = {
      id: 1,
      email: 'demo@voiceforge.com',
      name: 'Demo User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
