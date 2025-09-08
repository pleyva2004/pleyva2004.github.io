import { NextRequest, NextResponse } from 'next/server';

// This will proxy requests to your Python backend
const BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? "http://localhost:8000" 
  : process.env.NEXT_PUBLIC_API_URL || "https://your-backend-url.onrender.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the request to the Python backend
    const response = await fetch(`${BACKEND_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        answer: "Sorry, I'm having trouble connecting to the AI service right now. Please try again later." 
      },
      { status: 500 }
    );
  }
}