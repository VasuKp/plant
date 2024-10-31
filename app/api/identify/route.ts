import { identifyPlant } from '@/app/utils/gemini';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Validate base64 image
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }

    const result = await identifyPlant(image);
    
    if (!result) {
      throw new Error('No result from API');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to identify plant: ' + (error as Error).message },
      { status: 500 }
    );
  }
}