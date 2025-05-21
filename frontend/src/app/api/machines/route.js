// src/app/api/machines/route.js
import { NextResponse } from 'next/server';

// Function สำหรับสร้างเครื่องจักรใหม่
export async function POST(request) {
  try {
    // แปลง request body เป็น FormData
    const formData = await request.formData();
    
    // สร้าง object ข้อมูลเครื่องจักร
    const machineData = {
      machine_name: formData.get('machine_name'),
      machine_full_name: formData.get('machine_full_name'),
      machine_number: formData.get('machine_number'),
      series_number: formData.get('series_number'),
      model: formData.get('model'),
      customer: formData.get('customer'),
      product: formData.get('product'),
    };
    
    // ดึงไฟล์รูปภาพ
    const imageFile = formData.get('image');
    let imageBuffer = null;
    
    if (imageFile) {
      // แปลงไฟล์เป็น buffer
      const arrayBuffer = await imageFile.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    }
    
    // ส่งข้อมูลไปยัง backend API
    const response = await fetch(`${process.env.BACKEND_URL}/api/machines`, {
      method: 'POST',
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
    
    // ถ้ามีรูปภาพ ให้อัพโหลดไปยัง backend
    if (imageBuffer) {
      const machineId = result.data.machine_id;
      
      // สร้าง FormData สำหรับอัพโหลดรูป
      const imageFormData = new FormData();
      imageFormData.append('image', new Blob([imageBuffer]), 'image.jpg');
      
      // อัพเดทรูปภาพ
      await fetch(`${process.env.BACKEND_URL}/api/machines/${machineId}/image`, {
        method: 'POST',
        body: imageFormData,
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'บันทึกข้อมูลเครื่องจักรสำเร็จ',
      data: result.data
    });
    
  } catch (error) {
    console.error('Error creating machine:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
      { status: 500 }
    );
  }
}

// Function สำหรับอัพเดทเครื่องจักร
export async function PUT(request) {
  try {
    const machineId = request.nextUrl.searchParams.get('id');
    if (!machineId) {
      return NextResponse.json(
        { error: 'กรุณาระบุ ID ของเครื่องจักร' },
        { status: 400 }
      );
    }
    
    const formData = await request.formData();
    const machineData = Object.fromEntries(formData.entries());
    
    // ส่งข้อมูลไปยัง backend API
    const response = await fetch(`${process.env.BACKEND_URL}/api/machines/${machineId}`, {
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
    return NextResponse.json({
      success: true,
      message: 'อัพเดทข้อมูลเครื่องจักรสำเร็จ',
      data: result.data
    });
    
  } catch (error) {
    console.error('Error updating machine:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' },
      { status: 500 }
    );
  }
}

// Function สำหรับลบเครื่องจักร
export async function DELETE(request) {
  try {
    const machineId = request.nextUrl.searchParams.get('id');
    if (!machineId) {
      return NextResponse.json(
        { error: 'กรุณาระบุ ID ของเครื่องจักร' },
        { status: 400 }
      );
    }
    
    // ส่งคำขอไปยัง backend API
    const response = await fetch(`${process.env.BACKEND_URL}/api/machines/${machineId}`, {
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
    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลเครื่องจักรสำเร็จ',
      data: result.data
    });
    
  } catch (error) {
    console.error('Error deleting machine:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบข้อมูล' },
      { status: 500 }
    );
  }
}

// Function สำหรับดึงข้อมูลเครื่องจักรทั้งหมด
export async function GET(request) {
  try {
    const machineId = request.nextUrl.searchParams.get('id');
    
    // ถ้ามี ID ให้ดึงข้อมูลเฉพาะเครื่องนั้น
    if (machineId) {
      const response = await fetch(`${process.env.BACKEND_URL}/api/machines/${machineId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.message || 'เกิดข้อผิดพลาด' },
          { status: response.status }
        );
      }
      
      const result = await response.json();
      return NextResponse.json(result);
    } 
    
    // ถ้าไม่มี ID ให้ดึงข้อมูลทั้งหมด
    const response = await fetch(`${process.env.BACKEND_URL}/api/machines`);
    
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
    console.error('Error getting machines:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}