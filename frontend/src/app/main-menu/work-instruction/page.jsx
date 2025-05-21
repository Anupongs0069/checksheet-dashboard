// src/app/main-menu/work-insreuction/page.jsx

"use client";
import React, { useEffect } from 'react'

function WorkInstructionPage() {
  useEffect(() => {

    window.location.replace('http://194.10.10.32:8081/awc/');
    

  }, []); 
  return (
    <div>
      {/* อาจใส่ข้อความระหว่างรอ redirect */}
      <p>Redirecting to Work Instruction...</p>
    </div>
  )
}

export default WorkInstructionPage