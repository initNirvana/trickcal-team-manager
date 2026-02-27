import { Ssgoi, SsgoiTransition } from '@ssgoi/react';
import { fade, slide } from '@ssgoi/react/view-transitions';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { useCloudSync } from './hooks/useCloudSync';
import { useDataLoader } from './hooks/useDataLoader';
import { getNetworkIconPath } from './utils/apostleImages';

const DeckSimulator = lazy(() => import('./components/party/DeckSimulator'));
const DeckRecommender = lazy(() => import('./components/builder/DeckRecommender'));
const Settings = lazy(() => import('./pages/Settings'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const SimpleBuilder = lazy(() => import('./components/SimpleBuilder/SimpleBuilder'));

const ssgoiConfig = {
  experimentalPreserveScroll: true,
  defaultTransition: fade(),
  transitions: [
    { from: '/*', to: '/*', transition: slide({ direction: 'left' }), symmetric: true },
  ],
};

function LoadingScreen({ message = '데이터 로딩 중...' }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-black">
      <div className="text-center">
        <img src={getNetworkIconPath()} alt="로딩 중" className="mb-4 h-16 w-16" />
        <p>{message}</p>
      </div>
    </div>
  );
}

function App() {
  // TODO: spells 추가
  const { apostles, skills, asides, artifacts, isLoading, error } = useDataLoader();

  // 전역 클라우드 동기화 활성화
  useCloudSync();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <div className="text-center">
          <p className="text-red-500">⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (apostles.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <p>사도 데이터를 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Ssgoi config={ssgoiConfig}>
        <Suspense fallback={<LoadingScreen message="페이지 로딩 중..." />}>
          <Routes>
            {/* 덱 시뮬레이터 */}
            <Route
              path="/"
              element={
                <Layout>
                  <SsgoiTransition id="/">
                    <DeckSimulator
                      apostles={apostles}
                      skillsData={skills.skills}
                      asidesData={asides.asides}
                      artifactsData={artifacts.artifacts}
                    />
                  </SsgoiTransition>
                </Layout>
              }
            />

            {/* 보유 사도 분석기 */}
            <Route
              path="/builder"
              element={
                <Layout>
                  <div style={{ position: 'relative', minHeight: '150vh' }}>
                    <SsgoiTransition id="/builder">
                      <DeckRecommender />
                    </SsgoiTransition>
                  </div>
                </Layout>
              }
            />

            {/* 간단 조합기 */}
            <Route
              path="/tutorial"
              element={
                <Layout>
                  <div style={{ position: 'relative', minHeight: '150vh' }}>
                    <SsgoiTransition id="/tutorial">
                      <SimpleBuilder />
                    </SsgoiTransition>
                  </div>
                </Layout>
              }
            />

            {/* 404 페이지 (선택사항) */}
            <Route
              path="*"
              element={
                <Layout>
                  <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                      <h1 className="mb-4 text-4xl font-bold">404</h1>
                      <p className="text-gray-400">페이지를 찾을 수 없습니다</p>
                      <Link to="/" className="mt-4 inline-block text-blue-500 hover:text-blue-400">
                        홈으로 돌아가기
                      </Link>
                    </div>
                  </div>
                </Layout>
              }
            />
            {/* 설정 페이지 */}
            <Route
              path="/settings"
              element={
                <Layout>
                  <SsgoiTransition id="/settings">
                    <Settings />
                  </SsgoiTransition>
                </Layout>
              }
            />
            {/* 개인정보 처리방침 */}
            <Route
              path="/privacy"
              element={
                <Layout>
                  <SsgoiTransition id="/privacy">
                    <PrivacyPolicy />
                  </SsgoiTransition>
                </Layout>
              }
            />
          </Routes>
        </Suspense>
      </Ssgoi>
    </BrowserRouter>
  );
}

export default App;
