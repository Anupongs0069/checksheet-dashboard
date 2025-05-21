// src/app/api/machines/[id]/route.js

import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/machines/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'เกิดข้อผิดพลาด' },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error getting machine:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const formData = await request.formData();
    const machineData = Object.fromEntries(formData.entries());
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/machines/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(machineData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'เกิดข้อผิดพลาด' },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error updating machine:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/machines/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'เกิดข้อผิดพลาด' },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error deleting machine:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบข้อมูล' },
      { status: 500 }
    );
  }
}