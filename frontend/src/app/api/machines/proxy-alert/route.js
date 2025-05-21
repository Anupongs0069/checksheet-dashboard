// ./src/app/api/proxy-alert/route.js

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('Proxy alert request:', body);
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://172.31.71.125:3001';
    const response = await fetch(`${apiUrl}/api/alerts/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Proxy alert response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in proxy alert:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}