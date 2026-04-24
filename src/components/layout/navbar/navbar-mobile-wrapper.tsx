// components/layout/navbar/navbar-mobile-wrapper.tsx
"use client";

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function NavbarMobileWrapper({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="md:hidden z-40">
                <button 
                    className="p-2 text-gray-700 outline-none focus:border-gray-400 focus:border"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>
            
            <div className={`flex-1 justify-self-center pb-3 flex-col md:block md:pb-0 md:mt-0 ${
                isOpen ? 'md:p-0 block' : 'hidden'
            }`}>
                    {children}
    
            </div>
        </>
    );
}