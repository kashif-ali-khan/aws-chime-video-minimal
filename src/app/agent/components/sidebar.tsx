import React, { useState } from 'react'
import { FaPlus } from "react-icons/fa";
import Image from 'next/image';

interface CustomerData {
  name: string;
  phone: string;
  address: string;
  email: string;
  policyNumber: string;
  idNumber: string;
  dob: string;
}

interface SidebarProps {
  customerData: CustomerData;
  onOpenPreview: (imageType: string, imageSrc: string) => void;
  onDeleteImage: (imageType: string) => void;
  customerImages?: {
    face_captured?: string;
    id_captured?: string;
  };
}

const Sidebar: React.FC<SidebarProps> = ({customerData, customerImages,onOpenPreview, onDeleteImage }) => {
    const [waitingCalls] = useState(10);
    console.log("customerImages=-----------------", customerImages);

  return (
   <div className="bg-[#f3f4f6] p-4 min-h-screen flex justify-center items-start">
      <div className="max-w-sm w-full space-y-4">

        {/* Top Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-xl shadow-sm text-sm text-gray-600">
            <div>Today&apos;s Calls</div>
            <div className="text-xl font-semibold text-[#12345D]">20</div>
          </div>
          <div className="bg-[#12345D] text-white p-4 rounded-xl shadow-sm text-sm">
            <div>Waiting Calls</div>
            <div className="text-xl font-semibold">{waitingCalls}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-sm text-gray-600">
            <div>Today&apos;s Call Time</div>
            <div className="text-xl font-semibold text-[#12345D]">100 min</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-sm text-gray-600">
            <div>Language</div>
            <div className="text-xl font-semibold text-[#12345D]">English</div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-xl p-4 space-y-4 shadow-sm">
            <div className="text-[#12345D] font-semibold text-lg">Customer Details</div>
            <div className="text-sm text-black space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <div className='flex items-center justify-between'>
                        <div>Name</div>
                        <div>:</div>
                    </div>
                          <div className="font-semibold left">{ customerData.name }</div>
                    
                    <div className='flex items-center justify-between'>
                        <div>Policy Number</div>
                        <div>:</div>
                    </div>
                    <div className="font-semibold">{ customerData.policyNumber }</div>
                    
                    <div className='flex items-center justify-between'>
                        <div>Date of Birth</div>
                        <div>:</div>
                    </div>
                    <div className="font-semibold">{ customerData.dob }</div>
                    
                    <div className='flex items-center justify-between'>
                        <div>Email</div>
                        <div>:</div>
                    </div>
                    <div className="font-semibold">{ customerData.email }</div>
                    
                    <div className='flex items-center justify-between'>
                        <div>Phone Number</div>
                        <div>:</div>
                    </div>
                    <div className="font-semibold">{ customerData.phone }</div>
                    
                    <div className='flex items-center justify-between'>
                        <div>Address</div>
                        <div>:</div>
                    </div>
                    <div className="font-semibold">{ customerData.address }</div>
                </div>
            </div>

            {/* Picture */}
            <div>
                <div className="text-[#12345D] font-semibold text-base mb-2">Customer Picture</div>
                <div className="h-28 bg-white border rounded-lg flex items-center justify-center overflow-hidden relative">
                    {customerImages?.face_captured ? (
                        <>
                            <Image 
                                src={customerImages.face_captured} 
                                alt="Customer Picture"
                                width={300}
                                height={200}
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-[#26252587] bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                                <button onClick={() => customerImages?.face_captured && onOpenPreview('face_captured', customerImages.face_captured)} className="bg-[#F9E8EF] text-[#9D174D] font-medium px-4 py-2 rounded-full">
                                    Preview
                                </button>
                            </div>
                        </>
                    ) : (
                        <FaPlus className="text-gray-600" />
                    )}
                </div>
            </div>

            {/* ID Card */}
            <div>
                <div className="text-[#12345D] font-semibold text-base mb-2">Customer ID Card</div>
                <div className="h-28 bg-white border rounded-lg flex items-center justify-center overflow-hidden relative">
                    {customerImages?.id_captured ? (
                        <>
                            <Image 
                                src={customerImages.id_captured} 
                                alt="Customer ID Card"
                                width={300}
                                height={200}
                                className="w-full h-full object-cover rounded-lg"
                                />
                            <div className="absolute inset-0 flex items-center justify-center bg-[#26252587] bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                                <button  onClick={() => customerImages?.id_captured && onOpenPreview('id_captured', customerImages.id_captured)} className="bg-[#F9E8EF] text-[#9D174D] font-medium px-4 py-2 rounded-full">
                                    Preview
                                </button>
                            </div>
                        </>
                    ) : (
                        <FaPlus className="text-gray-600" />
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}

export default Sidebar