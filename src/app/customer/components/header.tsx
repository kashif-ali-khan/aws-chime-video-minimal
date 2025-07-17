import React from 'react';
import Image from 'next/image';
import logo from '../../logo.png';

interface HeaderProps {
  isSocketConnected: boolean;
  isConnected: boolean;
  isWaitingForAgent: boolean;
}

const Header: React.FC<HeaderProps> = ({ isSocketConnected, isConnected, isWaitingForAgent }) => {
  return (
    <header className="bg-[#143C76] px-4 py-2 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <div className="flex items-center space-x-4">
        <Image
          src={logo}
          alt="AXIS MAX LIFE INSURANCE"
          className="h-10 w-auto bg-white p-1 rounded"
        />
        </div>
        <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div className="text-sm">
                {isConnected ? 'In Call' : isWaitingForAgent ? 'Waiting...' : 'Ready'}
            </div>
        </div>
    </header>
  )
}

export default Header