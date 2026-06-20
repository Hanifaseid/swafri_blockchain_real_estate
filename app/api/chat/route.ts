import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY environment variable.');
    return NextResponse.json(
      {
        error:
          'Gemini API key is missing. Set GEMINI_API_KEY in .env.local or your deployment secrets and restart the server.',
      },
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid message query' },
        { status: 400 }
      );
    }

    // Format messages into contents acceptable by gemini-3.5-flash
    const contents = messages.map((m: { role: string; content: string }) => {
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: `You are the TerraChain AI assistant for a Web3 real estate marketplace.
TerraChain supports blockchain-enabled property listings, map-based discovery, KYC/compliance review, ERC-721 digital title verification, lease escrow, purchase escrow, rental applications, offers, saved searches, and admin oversight.

Supported roles are exactly SUPER_ADMIN, ADMIN, PROPERTY_OWNER, and TENANT. TENANT means buyer or renter. PROPERTY_OWNER users can list and manage properties through account workflows. ADMIN and SUPER_ADMIN users use the operational dashboard.

Only describe supported marketplace features. Answer concisely and ground responses in the actual backend-backed product scope.`,
      },
    });

    return NextResponse.json({
      text: response.text || "I'm processing your VEX real estate inquiry, please try again shortly.",
    });
  } catch (err: any) {
    console.error('Error in VEX AI chat handler:', err);
    return NextResponse.json(
      { error: 'Failed to generate response. Ensure GEMINI_API_KEY is configured in Settings > Secrets.' },
      { status: 500 }
    );
  }
}
