import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/utils/jwt";

export interface AuthRequest extends NextRequest {
  userId?: number;
}

export const verifyAuth = (request: NextRequest): number | null => {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  const token = parts[1];
  const payload = verifyAccessToken(token);
  
  if (!payload) {
    return null;
  }

  return payload.userId;
};

export const createErrorResponse = (
  message: string,
  status: number = 400
) => {
  return NextResponse.json({ error: message }, { status });
};

export const createSuccessResponse = (data: any, status: number = 200) => {
  return NextResponse.json(data, { status });
};
