import React from 'react';
import Image from 'next/image';
import logo from '../../logo.png';
import { FaQuestionCircle, FaCog } from 'react-icons/fa';

interface HeaderProps {
  isSocketConnected: boolean;
  callStats: {
    completedCalls: number;
    waitingCalls: number;
    totalTime: string;
    language: string;
  };
}

const Header: React.FC<HeaderProps> = ({ isSocketConnected }) => {
  return (
    <header className="bg-[#143C76] px-4 py-2 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <div className="flex items-center space-x-4">
        <Image
          src={logo}
          alt="AXIS MAX LIFE INSURANCE"
          className="h-10 w-auto bg-white p-1 rounded"
        />
        
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-white text-sm">
            {isSocketConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      

      {/* Right-side controls */}
      <div className="flex items-center space-x-3">
        {/* Need Help Button */}
        <button className="flex items-center bg-[#F7EAF2] text-[#8B003C] font-medium px-4 py-1.5 rounded-full text-sm shadow">
          Need Help
          <FaQuestionCircle className="ml-2" />
        </button>

        {/* Settings Icon */}
        <button className="text-white text-lg">
          <FaCog />
        </button>
      </div>
    </header>
  )
}

export default Header