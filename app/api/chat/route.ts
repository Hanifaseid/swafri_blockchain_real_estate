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
        systemInstruction: `You are the VEX AI smart real estate and blockchain assistant.
VEX is a revolutionary premium real estate platform specializing in high-end developments with integrated blockchain payment gateways.
We bridge real-world premium assets (Advisory, Investing, Building) with secure multi-sig smart contracts, decentralized property registries, and support for tokenized yield and seamless rent/purchase options in USD, USDC, ETH, or SOL.

Key roles at VEX:
1. tenants: Scan QR to pay rent with USDC, log maintenance requests onto the blockchain, verify live energy meters.
2. buyers: Purchase fractional tokenized real estate, explore multi-sig deeds, generate smart yield.
3. owners: List properties, see aggregate portfolio yields, approve smart leases.
4. admins: Conduct property audits, manage smart contract pools, verify real-world deeds.
5. superadmins: Allocate master pool liquidity, adjust fees, deploy new smart contract templates.

Answer concisely, elegantly, and helpfully. Speak with high clarity and elite confidence. Always mention that VEX uses military-grade zk-proofs and smart contracts compiled with Solidity and Rust.`,
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
