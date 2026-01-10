import { useEffect, useRef, useCallback } from 'react';
import Shepherd from 'shepherd.js';
import type { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

const HAS_SEEN_KEY = 'hasSeenMainTour';

export const useTour = () => {
  const tourRef = useRef<Tour | null>(null);

  const getOrCreateTour = () => {
    if (tourRef.current) return tourRef.current;

    // 인스턴스 생성
    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'shadow-xl bg-white rounded-xl p-4 w-[200px] border border-gray-100',
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
      useModalOverlay: true,
    });

    tourRef.current = tour;

    // 스텝 추가
    tour.addSteps([
      {
        id: 'intro',
        title: '환영합니다!',
        text: '보유 사도 분석기 사용법을 알려드릴까요?',
        buttons: [
          {
            text: '괜찮아요',
            classes: 'text-gray-500 text-sm mr-4',

            action: () => {
              localStorage.setItem('hasSeenMainTour', 'true');
              tour.cancel();
            },
          },
          {
            text: '좋아요',
            classes:
              'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold',
            action: () => {
              tour.next();
            },
          },
        ],
      },
      {
        id: 'preset-guide',
        title: '많이 사용되는 조합',
        text: '각 성격별로 추천되는 조합이에요',
        attachTo: { element: '#preset-combination-section', on: 'bottom' },
        buttons: [
          {
            text: '괜찮아요',
            classes: 'text-gray-500 text-sm mr-4',

            action: () => {
              localStorage.setItem('hasSeenMainTour', 'true');
              tour.cancel();
            },
          },
          {
            text: '좋아요',
            classes:
              'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold',
            action: () => {
              tour.next();
            },
          },
        ],
      },
      {
        id: 'preset-personality-guide',
        title: '성격 아이콘 필터',
        text: '각 성격 아이콘(필터)을 선택해서 성격별 9/4/2 조합을 확인 할 수 있습니다.',
        attachTo: { element: '#preset-personality-section', on: 'bottom' },
        buttons: [
          {
            text: '괜찮아요',
            classes: 'text-gray-500 text-sm mr-4',

            action: () => {
              localStorage.setItem('hasSeenMainTour', 'true');
              tour.cancel();
            },
          },
          {
            text: '좋아요',
            classes:
              'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold',
            action: () => {
              tour.next();
            },
          },
        ],
      },
      {
        id: 'aside-guide',
        title: '어사이드 투자 여부',
        text: `
        <div class="space-y-3 text-sm text-left">
          <div class="flex items-start gap-2">
            <div>
              <b class="text-red-600">필수</b>
              <div class="text-xs text-gray-500">아이콘에 애니메이션이 적용되어 있어요. <br/> 어사이드 2성이 되어야 제 성능이 나오거나, 큰 차이가 나는 경우를 의미해요. </div>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <div>
              <b class="text-amber-500">권장 </b>
              <div class="text-xs text-gray-500">투자시 효과가 좋은 사도입니다. 여유가 되실 때 올려주세요.</div>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <div>
              <b class="text-gray-500">없음</b>
              <div class="text-xs text-gray-500">명함만 있어도 1인분 하는 사도들입니다.</div>
            </div>
          </div>
        </div>
        `,
        attachTo: { element: '#preset-combination-section', on: 'bottom' },
        buttons: [
          {
            text: '다음',
            classes:
              'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold',
            action: () => {
              tour.next();
            },
          },
        ],
      },
      {
        id: 'select-my-apostles',
        title: '보유 사도 선택',
        text: '보유 중인 사도를 선택하세요. <b class="text-green-600">[전체 선택]</b>을 눌러도 됩니다.<br/>(시연을 위해 전체선택으로 진행할게요!)',
        attachTo: { element: '#my-apostle-list-container', on: 'left' },
        buttons: [
          {
            text: '다음',
            action: () => {
              const selectAllBtn = document.querySelector(
                '#btn-apostle-select-all',
              ) as HTMLButtonElement;
              if (selectAllBtn) {
                selectAllBtn.click();
              }

              setTimeout(() => {
                tour.next();
              }, 100);
            },
          },
        ],
      },
      {
        id: 'recommendation-result',
        title: '추천 덱 완성!',
        text: '선택한 사도들로 만들 수 있는 <b>추천 조합</b>이 여기에 나타납니다.<br/>선택하신 보유 사도는 로컬에 저장되니 새로고침해도 유지됩니다!',
        attachTo: { element: '#recommendation-section', on: 'top' },
        scrollTo: { behavior: 'smooth', block: 'start' },
        buttons: [
          {
            text: '완료',
            action: () => {
              localStorage.setItem('hasSeenMainTour', 'true');
              tour.complete();
            },
          },
        ],
      },
    ]);

    tourRef.current = tour;
    return tour;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (localStorage.getItem(HAS_SEEN_KEY)) return;

    const tour = getOrCreateTour();

    if (!tour.isActive()) {
      tour.start();
    }

    return () => {
      if (tour.isActive()) {
        tour.complete();
      }
    };
  }, []);

  const startTour = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HAS_SEEN_KEY);
    }
    const tour = getOrCreateTour();

    if (tour.isActive()) return;

    tour.start();
  }, []);

  return { startTour };
};
