// src/components/party/sub-components/DeckTipsPanel.tsx

import React from 'react';

interface DeckTipsPanelProps {
  tips: string[];
}

const DeckTipsPanel: React.FC<DeckTipsPanelProps> = ({ tips }) => {
  return (
    <div className="alert alert-success">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="h-6 w-6 shrink-0 stroke-current"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        ></path>
      </svg>
      <div>
        <h3 className="font-bold">💡 팁 & 노하우</h3>
        <ul className="mt-2 list-inside list-disc space-y-1">
          {tips.map((tip, idx) => (
            <li key={idx} className="text-sm">
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DeckTipsPanel;
