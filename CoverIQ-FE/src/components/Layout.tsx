import React from 'react';
import LogoDropdown from './LogoDropdown';
import ApiKeyForm from './ApiKeyForm';

interface LayoutProps {
  children: React.ReactNode;
  showApiKeyForm?: boolean;
  onApiKeySave?: (figmaToken: string, geminiKey: string) => void;
  showLogoOnly?: boolean;
}

export default function Layout({ children, showApiKeyForm = false, onApiKeySave, showLogoOnly = false }: LayoutProps) {
  return (
    <div className="relative w-full h-full bg-slate-900">
      {!showLogoOnly && (
        <div className="fixed top-4 left-4 z-50">
          <LogoDropdown />
        </div>
      )}
      {showApiKeyForm && onApiKeySave && (
        <div className="fixed top-4 right-4 z-50">
          <ApiKeyForm onSave={onApiKeySave} />
        </div>
      )}
      <main className="relative z-0">
        {children}
      </main>
    </div>
  );
} 