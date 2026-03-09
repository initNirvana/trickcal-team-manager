import { memo, useMemo } from 'react';
import { useDataLoader } from '@/hooks/useDataLoader';

interface BossSelectionStepProps {
  selectedBossId: string | null;
  onBossSelect: (id: string) => void;
  stepNumber: number;
}

export const BossSelectionStep = memo(
  ({ selectedBossId, onBossSelect, stepNumber }: BossSelectionStepProps) => {
    const { bosses } = useDataLoader();

    const selectedBoss = useMemo(
      () => bosses.find((b) => b.id === selectedBossId),
      [bosses, selectedBossId],
    );

    const dimensionBosses = useMemo(() => bosses.filter((b) => b.content === 'dimension'), [bosses]);

    const frontierBosses = useMemo(() => bosses.filter((b) => b.content === 'frontier'), [bosses]);

    return (
      <div className="card bg-base-100 border-primary border-2 p-4 shadow-xl transition-all duration-300">
        <div className="mb-4 flex items-center gap-2">
          <span className="badge badge-primary">{stepNumber}단계</span>
          <h3 className="text-lg font-bold">보스 선택</h3>
        </div>

        <div className="space-y-4">
          <section>
            <h4 className="mb-2 text-sm font-semibold opacity-70">차원 충돌</h4>
            <div className="flex flex-wrap gap-2">
              {dimensionBosses.map((boss) => (
                <button
                  key={boss.id}
                  type="button"
                  className={`btn btn-sm ${selectedBossId === boss.id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => onBossSelect(boss.id)}
                >
                  {boss.name}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-semibold opacity-70">프론티어</h4>
            <div className="flex flex-wrap gap-2">
              {frontierBosses.map((boss) => (
                <button
                  key={boss.id}
                  type="button"
                  className={`btn btn-sm ${selectedBossId === boss.id ? 'btn-secondary' : 'btn-outline'}`}
                  onClick={() => onBossSelect(boss.id)}
                >
                  {boss.name}
                </button>
              ))}
            </div>
          </section>
        </div>

        {selectedBoss && (
          <div className="mt-6 border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-primary text-xl font-bold">{selectedBoss.name}</span>
              <span
                className={`badge ${selectedBoss.content === 'dimension' ? 'badge-primary' : 'badge-secondary'}`}
              >
                {selectedBoss.content === 'dimension' ? '차원 충돌' : '프론티어'}
              </span>
            </div>

            {selectedBoss.memo && (
              <div className="alert alert-info py-2 text-xs">
                <span>{selectedBoss.memo}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-success text-xs font-bold">추천 태그</span>
                <div className="flex flex-wrap gap-1">
                  {selectedBoss.recommendedTags.map((tag) => (
                    <span
                      key={tag}
                      className="badge badge-success badge-outline badge-xs sm:badge-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-error text-xs font-bold">비추천 태그</span>
                <div className="flex flex-wrap gap-1">
                  {selectedBoss.notRecommendedTags.map((tag) => (
                    <span key={tag} className="badge badge-error badge-outline badge-xs sm:badge-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

BossSelectionStep.displayName = 'BossSelectionStep';
