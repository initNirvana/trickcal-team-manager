import React, { useMemo } from "react";
import type { Apostle } from "../../types/apostle";
import {
  Accordion,
  AccordionPanel,
  AccordionContent,
  AccordionTitle,
  Badge,
  Tooltip,
} from "flowbite-react";

interface DamageReductionDisplayProps {
  apostles: Apostle[];
  skillsData?: any;
  skillLevels?: Record<string, number>;
}

interface BreakdownDetail {
  apostleName: string;
  skillName: string;
  skillType: string;
  skillLevel: number;
  reduction: number;
  appliesTo: string;
}

interface BreakdownResult {
  totalReduction: number;
  details: BreakdownDetail[];
}

export const DamageReductionDisplay: React.FC<DamageReductionDisplayProps> = ({
  apostles,
  skillsData,
  skillLevels = {},
}) => {
  const breakdown = useMemo(
    () => calculateDamageReduction(apostles, skillsData, skillLevels),
    [apostles, skillsData, skillLevels]
  );

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
          <div className="flex items-center justify-between w-full pr-2">
            <span className="font-semibold text-sm">
              받는 피해량 감소 현황 (스킬)
            </span>
          </div>
        </AccordionTitle>

        {/* Accordion Body */}
        <AccordionContent>
          {breakdown.details.length > 0 ? (
            <div className="space-y-3">
              {/* 헤더 */}
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <p className="text-xs font-bold text-gray-700">
                  스킬 구성 ({breakdown.details.length}개)
                </p>
                <p className="text-xs text-gray-500">개별 감소량</p>
              </div>

              {/* 스킬 리스트 */}
              {breakdown.details.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                >
                  {/* 좌측: 사도명 + 범위 */}
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-900">
                      {item.apostleName} {item.skillType}
                    </p>
                    <p className="text-xs text-gray-500">
                      범위: {item.appliesTo}
                    </p>
                  </div>

                  {/* 우측: 감소량 */}
                  <Badge color="info" size="sm">
                    {item.reduction}%
                  </Badge>
                </div>
              ))}

              {/* 총합 표시 (선택사항) */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <p className="text-sm font-bold text-gray-900">총 감소량</p>
                <Tooltip content="최대 75%">
                  <Badge
                    color={
                      breakdown.totalReduction >= 60 ? "success" : "warning"
                    }
                  >
                    {breakdown.totalReduction}%
                  </Badge>
                </Tooltip>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                파티에 받는 피해량 감소 효과가 없습니다.
              </p>
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
  skillLevels: Record<string, number>
): BreakdownResult {
  const details: BreakdownDetail[] = [];
  let totalReduction = 0;

  if (!skillsData?.skills) {
    return { totalReduction: 0, details: [] };
  }

  for (const apostle of apostles) {
    const apostaSkills = skillsData.skills.filter(
      (s: any) => s.apostleId === apostle.id
    );

    let bestSkill = null;
    let bestReduction = 0;

    for (const skill of apostaSkills) {
      if (!skill.incomingReduction || skill.incomingReduction.length === 0)
        continue;

      const currentLevel = skillLevels[apostle.id] || 1;
      const reductionData = skill.incomingReduction.find(
        (d: any) => d.level === currentLevel
      );

      if (reductionData && reductionData.value > bestReduction) {
        bestReduction = reductionData.value;
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
        skillType: bestSkill.level === "low" ? "저학년" : "고학년",
        skillLevel: currentSkillLevel,
        reduction: bestReduction,
        appliesTo: isExcludingSelf ? "자신만" : "다수 적용",
      });
    }
  }

  totalReduction = Math.min(totalReduction, 75);

  return { totalReduction, details };
}

export default DamageReductionDisplay;
