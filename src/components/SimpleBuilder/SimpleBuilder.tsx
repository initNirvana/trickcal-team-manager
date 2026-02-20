import { PresetCombinationSection } from '@/components/builder/Preset/PresetCombinationSection';
import { ApostleCell } from '@/components/common/ApostleCell';
import SynergyDisplay from '@/components/party/Analysis/SynergyDisplay';
import { useSimpleBuilder } from '@/hooks/useSimpleBuilder';
import { Apostle } from '@/types/apostle';
import { ApostleSelectionStep } from './ApostleSelectionStep';
import { POSITION_MAP, STEPS } from './constants';
import { PersonalitySelectionStep } from './PersonalitySelectionStep';

interface GridColumnProps {
  label: string;
  indices: readonly number[];
  colorClass: string;
  placedApostles: (Apostle | null)[];
  onRemove: (idx: number) => void;
}

const GridColumn = ({ label, indices, colorClass, placedApostles, onRemove }: GridColumnProps) => (
  <div className="flex flex-col gap-1">
    <div
      className={`${colorClass} rounded-t-xl py-1 text-center text-xs font-bold shadow-sm sm:text-sm`}
    >
      {label}
    </div>
    <div className="flex flex-col gap-1">
      {indices.map((idx) => (
        <ApostleCell key={idx} index={idx} apostle={placedApostles[idx]} onClick={onRemove} />
      ))}
    </div>
  </div>
);

const SimpleBuilder = () => {
  const {
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
  } = useSimpleBuilder();

  return (
    <div className="container mx-auto max-w-5xl p-4 pb-24">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold">간단 조합기</h1>
        <p className="text-sm opacity-70">덱을 만드는 방법을 알아보아요</p>
      </div>

      <div className="card bg-base-100 border-base-200 mb-8 border p-4 shadow-sm">
        <ul className="steps">
          {STEPS.map((step) => (
            <li
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`step cursor-pointer text-xs sm:text-sm ${
                currentStep >= step.id ? 'step-primary font-bold' : 'opacity-50'
              }`}
              data-content={currentStep > step.id ? '✓' : step.id}
              style={{ zIndex: STEPS.length - step.id }}
            >
              {step.label}
            </li>
          ))}
        </ul>
        <div className="mt-4 text-center">
          <p className="text-primary text-xs font-medium tracking-widest uppercase">
            {STEPS[currentStep - 1].desc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        <div className="space-y-4 transition-all duration-500 md:col-span-7">
          <div className="bg-base-200 border-base-300 relative flex justify-center overflow-hidden rounded-3xl border-2 p-2 shadow-inner sm:p-6">
            <div className="grid w-full max-w-md grid-cols-3 gap-2">
              <GridColumn
                label={POSITION_MAP.back.label}
                indices={POSITION_MAP.back.indices}
                colorClass={POSITION_MAP.back.colorClass}
                placedApostles={placedApostles}
                onRemove={handleRemove}
              />
              <GridColumn
                label={POSITION_MAP.mid.label}
                indices={POSITION_MAP.mid.indices}
                colorClass={POSITION_MAP.mid.colorClass}
                placedApostles={placedApostles}
                onRemove={handleRemove}
              />
              <GridColumn
                label={POSITION_MAP.front.label}
                indices={POSITION_MAP.front.indices}
                colorClass={POSITION_MAP.front.colorClass}
                placedApostles={placedApostles}
                onRemove={handleRemove}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:col-span-5">
          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <PersonalitySelectionStep
                currentTab={currentTab}
                onTabChange={setCurrentTab}
                stepNumber={currentStep}
              />
            )}

            {currentStep === 2 && <PresetCombinationSection />}

            {currentStep === 3 && (
              <>
                {balanceReport && balanceReport.length > 0 && (
                  <div className="mt-4 mb-4 flex flex-col gap-2">
                    {balanceReport.map((alert, idx) => (
                      <div
                        key={idx}
                        className={`alert ${alert.type === 'error' ? 'alert-error' : 'alert-warning'} py-2 shadow-lg`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 shrink-0 stroke-current"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <span className="text-sm">{alert.msg}</span>
                      </div>
                    ))}
                  </div>
                )}
                <ApostleSelectionStep
                  currentTab={currentTab}
                  onTabChange={setCurrentTab}
                  topApostlesByPersona={topApostlesByPersona}
                  placedApostles={placedApostles}
                  onApostleSelect={onApostleSelect}
                  stepNumber={currentStep}
                  stepTitle="사도 직접 배치해보기"
                />

                <div className="card bg-base-100 border-base-300 mt-4 border-2 p-4 shadow-xl">
                  <SynergyDisplay synergies={synergies} />
                </div>
              </>
            )}
          </div>

          <div className="mt-auto flex gap-2">
            <button className="btn flex-1" disabled={currentStep === 1} onClick={prevStep}>
              이전
            </button>
            {currentStep < 3 ? (
              <button className="btn btn-primary flex-1" onClick={nextStep}>
                다음 단계
              </button>
            ) : (
              <button />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleBuilder;
