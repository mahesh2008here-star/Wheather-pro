import React from 'react';

interface AndroidContainerProps {
  children: React.ReactNode;
}

export const PhoneSimulator: React.FC<AndroidContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#EAE8E1] text-[#171717]">
      <main className="w-full max-w-md h-screen sm:h-[94vh] sm:my-2 sm:rounded-[36px] flex flex-col overflow-hidden relative shadow-xl border-0 sm:border border-[#E9E7E1] bg-[#F7F6F2] text-[#171717]">
        {children}
      </main>
    </div>
  );
};

