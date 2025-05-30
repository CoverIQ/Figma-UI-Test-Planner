import React, { useState } from 'react';

export default function LogoDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'About CoverIQ', path: '/introduction' },
    { label: 'Meet the Team', path: '/team' },
    { label: 'Figma UI Test Planner', path: '/products/Planner' },
    { label: 'Local Unit Test Support', path: 'https://github.com/CoverIQ/CoverIQ-Test-Assistant/tree/Local-Unit-Test-Support-Demo'},
    { label: 'GitHub', path: 'https://github.com/CoverIQ', external: true },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-start space-y-1 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className="text-5xl font-bold tracking-tight">
            <span className="text-blue-500">Cover</span>
            <span className="text-emerald-500">IQ</span>
          </span>
          <svg
            className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''} text-white`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <span className="text-sm font-medium tracking-wide text-white">Covering Intelligent Quality Assurance</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {menuItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 