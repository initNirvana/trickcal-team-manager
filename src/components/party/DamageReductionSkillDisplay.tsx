import React, { useMemo } from 'react';
import type { Apostle } from '../../types/apostle';
import {
  Accordion,
  AccordionPanel,
  AccordionContent,
  AccordionTitle,
  Badge,
  Tooltip,
  Button,
  ButtonGroup,
} from 'flowbite-react';
import { HiMinus, HiPlus } from 'react-icons/hi';

interface DamageReductionDisplayProps {
  apostles: Apostle[];
  skillsData?: any;
  skillLevels?: Record<string, number>;
  onSkillLevelChange?: (apostleId: string, newLevel: number) => void;
}

interface ReductionDetail {
  apostleName: string;
  skillName: string;
  skillType: string;
  skillLevel: number;
  reduction: number;
  appliesTo: string;
}

interface ReductionResult {
  totalReduction: number;
  details: ReductionDetail[];
}

export const DamageReductionDisplay: React.FC<DamageReductionDisplayProps> = ({
  apostles,
  skillsData,
  skillLevels = {},
  onSkillLevelChange,
}) => {
  const MIN_LEVEL = 1;
  const MAX_LEVEL = 13;

  const reduction = useMemo(
    () => calculateDamageReduction(apostles, skillsData, skillLevels),
    [apostles, skillsData, skillLevels],
  );

  const handleLevelChange = (apostleId: string, delta: number) => {
    if (!onSkillLevelChange) return;

    const currentLevel = skillLevels[apostleId] || 1;
    const newLevel = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, currentLevel + delta));

    if (newLevel !== currentLevel) {
      onSkillLevelChange(apostleId, newLevel);
    }
  };

  if (apostles.length === 0) {
    return (
      <div className="box text-center">
        <p className="text-muted">파티 분석이 진행 중입니다.</p>
      </div>
    );
  }

  return (
    <Accordion collapseAll>
      <AccordionPanel>
        <AccordionTitle>
          <div className="flex w-full items-center justify-between pr-2">
            <span className="text-sm font-semibold">받는 피해량 감소 현황 (스킬)</span>
          </div>
        </AccordionTitle>

        <AccordionContent>
          {reduction.details.length > 0 ? (
            <div className="space-y-3">
              {/* 헤더 */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <p className="text-xs font-bold text-gray-700">
                  스킬 구성 ({reduction.details.length}개)
                </p>
                <p className="text-xs text-gray-500">개별 감소량</p>
              </div>

              {/* 스킬 리스트 */}
              {reduction.details.map((item, idx) => {
                const apostle = apostles.find((a) => a.name === item.apostleName);
                const apostleId = apostle?.id || '';

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-2 transition hover:bg-gray-100"
                  >
                    {/* 좌측: 사도명 + 범위 */}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">
                        {item.apostleName} {item.skillType} Lv.{item.skillLevel}
                      </p>
                      <p className="text-xs text-gray-500">범위: {item.appliesTo}</p>
                    </div>

                    {/* 사도 스킬 레벨 조정 */}
                    <Tooltip content="스킬 레벨 조정 1 ~ 13">
                      <ButtonGroup>
                        <Button
                          pill
                          onClick={() => handleLevelChange(apostleId, -1)}
                          color="gray"
                          size="xs"
                          disabled={item.skillLevel === MIN_LEVEL} // 최소값일 때 비활성화
                        >
                          <HiMinus className="h-4 w-4" />
                        </Button>
                        <Button
                          pill
                          onClick={() => handleLevelChange(apostleId, 1)}
                          color="gray"
                          size="xs"
                          disabled={item.skillLevel === MAX_LEVEL} // 최대값일 때 비활성화
                        >
                          <HiPlus className="h-4 w-4" />
                        </Button>
                      </ButtonGroup>
                    </Tooltip>

                    {/* 우측: 감소량 */}
                    <Badge color="info" size="sm">
                      {item.reduction}%
                    </Badge>
                  </div>
                );
              })}

              {/* 총합 표시 (선택사항) */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                <p className="text-sm font-bold text-gray-900">총 감소량</p>
                <Tooltip content="최대 75%">
                  <Badge color={reduction.totalReduction >= 60 ? 'success' : 'warning'}>
                    {reduction.totalReduction}%
                  </Badge>
                </Tooltip>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-sm text-gray-500">파티에 받는 피해량 감소 효과가 없습니다.</p>
            </div>
          )}
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  );
};

function calculateDamageReduction(
  apostles: Apostle[],
  skillsData: any,
  skillLevels: Record<string, number>,
): ReductionResult {
  const details: ReductionDetail[] = [];
  let totalReduction = 0;

  if (!skillsData?.skills) {
    return { totalReduction: 0, details: [] };
  }

  for (const apostle of apostles) {
    const apostaSkills = skillsData.skills.filter((s: any) => s.apostleId === apostle.id);

    let bestSkill = null;
    let bestReduction = 0;

    for (const skill of apostaSkills) {
      if (!skill.damage || skill.damage.length === 0) continue;

      const currentLevel = skillLevels[apostle.id] || 1;

      const reductionData = skill.damage.find((d: any) => d.level === currentLevel);

      if (reductionData && reductionData.Reduction > bestReduction) {
        bestReduction = reductionData.Reduction;
        bestSkill = skill;
      }
    }

    if (bestSkill && bestReduction > 0) {
      const currentSkillLevel = skillLevels[apostle.id] || 1;
      const isExcludingSelf = bestSkill.excludeSelf ?? false;

      if (!isExcludingSelf) {
        totalReduction += bestReduction;
      }

      details.push({
        apostleName: apostle.name,
        skillName: bestSkill.name,
        skillType: bestSkill.level === 'low' ? '저학년' : '고학년',
        skillLevel: currentSkillLevel,
        reduction: bestReduction,
        appliesTo: isExcludingSelf ? '자신만' : '다수 적용',
      });
    }
  }

  // 최대 75%로 제한
  totalReduction = Math.min(totalReduction, 75);

  return { totalReduction, details };
}

export default DamageReductionDisplay;
