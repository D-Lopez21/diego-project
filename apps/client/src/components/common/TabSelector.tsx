import React from 'react';
import type { SectionId } from '../bills-details/interfaces';

type Section = {
  id: SectionId;
  label: string;
  hexColor?: string;
};

type TabSelectorProps = {
  sections: Section[];
  activeSection: SectionId;
  onSectionChange: React.Dispatch<React.SetStateAction<SectionId>>;
};

export default function TabSelector({
  sections,
  activeSection,
  onSectionChange,
}: TabSelectorProps) {
  return (
    <div className="flex border-b border-gray-100 mb-6 overflow-x-auto scrollbar-hide">
      <div className="flex gap-8">
        {sections.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`
                relative pb-3 text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              {section.label}

              {isActive && (
                <div
                  className="absolute bottom-0 left-0 r-0 h-0.5 w-full rounded-full transition-all"
                  style={{ backgroundColor: section.hexColor || '#000' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
