import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useDataLoader } from '@/hooks/useDataLoader';
import { Apostle, Personality, Position } from '@/types/apostle';
import { getEffectiveBaseScore } from '@/utils/builder/deckRecommendationUtils';
import { analyzeSynergies } from '@/utils/deckAnalysisUtils';
import { PERSONALITIES } from '../components/SimpleBuilder/constants';

export const useSimpleBuilder = () => {
  const { apostles } = useDataLoader();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentTab, setCurrentTab] = useState<Personality>('Gloomy');
  const [placedApostles, setPlacedApostles] = useState<(Apostle | null)[]>(Array(9).fill(null));

  const getBestApostleScore = useCallback((a: Apostle) => {
    const positions = Array.isArray(a.position) ? a.position : [a.position];
    const scores = positions.map((pos) =>
      getEffectiveBaseScore(a, 6, pos as Position, { deckSize: 6 }, 2),
    );
    return Math.max(...scores, getEffectiveBaseScore(a, 6, undefined, { deckSize: 6 }, 2));
  }, []);

  const topApostlesByPersona = useMemo(() => {
    const map: Partial<Record<Personality, Apostle[]>> = {};
    PERSONALITIES.forEach((p) => {
      map[p] = apostles
        .filter((a) => a.persona === p && a.engName !== 'Uros')
        .sort((a, b) => getBestApostleScore(b) - getBestApostleScore(a))
        .slice(0, 6);
    });
    return map;
  }, [apostles, getBestApostleScore]);

  const handleRemove = useCallback((index: number) => {
    setPlacedApostles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  const handlePlace = useCallback(
    (apostle: Apostle, index: number) => {
      const colIdx = index % 3;
      const pos = colIdx === 0 ? 'back' : colIdx === 1 ? 'mid' : 'front';
      const allowed = Array.isArray(apostle.position)
        ? apostle.position.includes(pos as Position)
        : apostle.position === pos;

      if (!allowed) {
        toast.error(
          `${apostle.name} 사도는 ${pos === 'back' ? '후열' : pos === 'mid' ? '중열' : '전열'}에 배치할 수 없습니다!`,
        );
        return;
      }

      const currentCount = placedApostles.filter((a) => a !== null).length;
      const isNew = !placedApostles.some((a) => a?.id === apostle.id);
      const isTargetEmpty = placedApostles[index] === null;

      if (isNew && isTargetEmpty && currentCount >= 6) {
        toast.error('사도는 최대 6명까지 배치할 수 있어요!');
        return;
      }

      setPlacedApostles((prev) => {
        const next = [...prev];
        if (next[index]?.id === apostle.id) {
          next[index] = null;
        } else {
          const existingIdx = next.findIndex((a) => a?.id === apostle.id);
          if (existingIdx !== -1) next[existingIdx] = null;
          next[index] = apostle;
        }
        return next;
      });
    },
    [placedApostles],
  );

  const onApostleSelect = useCallback(
    (apostle: Apostle) => {
      const existingIdx = placedApostles.findIndex((a) => a?.id === apostle.id);
      if (existingIdx !== -1) {
        handleRemove(existingIdx);
        return;
      }

      const preferredPos = (
        Array.isArray(apostle.position) ? apostle.position[0] : apostle.position
      ) as Position;
      const colIdx = preferredPos === 'back' ? 0 : preferredPos === 'mid' ? 1 : 2;
      const targetIndices = [colIdx, colIdx + 3, colIdx + 6];

      for (const idx of targetIndices) {
        if (!placedApostles[idx]) {
          handlePlace(apostle, idx);
          return;
        }
      }
      toast.error(
        `${preferredPos === 'back' ? '후열' : preferredPos === 'mid' ? '중열' : '전열'}에 빈 자리가 없습니다!`,
      );
    },
    [placedApostles, handlePlace, handleRemove],
  );

  const balanceReport = useMemo(() => {
    const currentApostles = placedApostles.filter((a): a is Apostle => a !== null);
    if (currentApostles.length === 0) return null;

    const hasTanker = currentApostles.some((a) => a.role.main === 'Tanker');
    const hasHealer = currentApostles.some((a) => a.role.trait?.includes('Heal'));

    const alerts = [];
    if (!hasTanker)
      alerts.push({ type: 'error', msg: '탱커가 없어요! 파티가 쉽게 무너질 수 있어요.' });
    if (!hasHealer)
      alerts.push({
        type: 'warning',
        msg: '힐러가 없어요! 유지력이 부족해 3별 클리어가 어려울 수 있어요.',
      });

    // 각 라인별 전열 부재 체크
    const lanes = [
      { back: 0, mid: 1, front: 2 },
      { back: 3, mid: 4, front: 5 },
      { back: 6, mid: 7, front: 8 },
    ];

    const hasExposedLane = lanes.some((lane) => {
      const hasBack = placedApostles[lane.back] !== null;
      const hasMid = placedApostles[lane.mid] !== null;
      const hasFront = placedApostles[lane.front] !== null;

      return (hasBack || hasMid) && !hasFront;
    });

    if (hasExposedLane) {
      alerts.push({
        type: 'warning',
        msg: '전열에 사도가 없는 라인이 있어요! 해당 라인의 사도가 위험할 수 있어요.',
      });
    }

    const hasLoneFrontLane = lanes.some((lane) => {
      const hasBack = placedApostles[lane.back] !== null;
      const hasMid = placedApostles[lane.mid] !== null;
      const hasFront = placedApostles[lane.front] !== null;

      return hasFront && !hasBack && !hasMid;
    });

    if (hasLoneFrontLane) {
      alerts.push({ type: 'warning', msg: '혼자 배치된 전열 사도가 있어요!' });
    }

    return alerts;
  }, [placedApostles]);

  const synergies = useMemo(() => {
    const currentApostles = placedApostles.filter((a): a is Apostle => a !== null);
    return analyzeSynergies(currentApostles);
  }, [placedApostles]);

  const nextStep = useCallback(() => setCurrentStep((prev) => prev + 1), []);
  const prevStep = useCallback(() => setCurrentStep((prev) => prev - 1), []);

  return {
    currentStep,
    setCurrentStep,
    currentTab,
    setCurrentTab,
    placedApostles,
    topApostlesByPersona,
    handleRemove,
    onApostleSelect,
    balanceReport,
    synergies,
    nextStep,
    prevStep,
  };
};
