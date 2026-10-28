import { NextRequest, NextResponse } from "next/server";
import { verifyCertificateToken } from "@/lib/cert";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const result = verifyCertificateToken(token);

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification Failed",
          message: result.error || "Invalid or counterfeit token",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Certificate is authentic and verified.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Verification Error", message: error.message },
      { status: 500 }
    );
  }
}
