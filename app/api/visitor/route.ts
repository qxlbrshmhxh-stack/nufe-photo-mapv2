import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: "Visitor-based dashboard endpoints are legacy-only. Use account-based auth flows instead."
    },
    { status: 410 }
  );
}
