// src/components/party/sub-components/AlternativeApostlesPanel.tsx

import React, { Activity } from 'react';

interface Alternative {
  replace: string;
  with: string | string[];
  condition?: string;
  tradeoff?: string;
}

interface AlternativeApostlesPanelProps {
  alternatives: Alternative[];
}

const AlternativeApostlesPanel: React.FC<AlternativeApostlesPanelProps> = ({ alternatives }) => {
  return (
    <div className="collapse-arrow border-base-300 collapse border">
      <input type="checkbox" name="my-accordion-4" />
      <div className="collapse-title font-semibold">대체 사도 선택지</div>
      <div className="collapse-content text-sm">
        {alternatives.map((alt, idx) => (
          <div key={idx} className="border-warning bg-warning/10 rounded-lg border-l-4 p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-bold">
                  {alt.replace} → {Array.isArray(alt.with) ? alt.with.join(', ') : alt.with}
                </p>
                <Activity mode={alt.condition ? 'visible' : 'hidden'}>
                  <p className="text-base-content/70 mt-1 text-xs">⚠️ 조건: {alt.condition}</p>
                </Activity>

                <Activity mode={alt.tradeoff ? 'visible' : 'hidden'}>
                  <p className="text-base-content/70 mt-1 text-xs">💡 {alt.tradeoff}</p>
                </Activity>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlternativeApostlesPanel;
