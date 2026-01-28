import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Ssgoi, SsgoiTransition } from '@ssgoi/react';
import { film } from '@ssgoi/react/view-transitions';
import { getNetworkIconPath } from './utils/apostleImages';
import { useDataLoader } from './hooks/useDataLoader';
import { useCloudSync } from './hooks/useCloudSync';
import Layout from './components/layout/Layout';
import DeckSimulator from './components/party/DeckSimulator';
import DeckRecommender from './components/builder/DeckRecommender';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { Toaster } from 'react-hot-toast';

const ssgoiConfig = {
  transitions: [{ from: '/', to: '/builder', transition: film(), symmetric: true }],
};

function App() {
  // TODO: spells 추가
  const { apostles, skills, asides, isLoading, error } = useDataLoader();

  // 전역 클라우드 동기화 활성화
  useCloudSync();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <div className="text-center">
          <img src={getNetworkIconPath()} alt="로딩 중" className="mb-4 h-16 w-16" />
          <p>데이터 로딩 중...</p>
        </div>
      </div>
    );
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
      <Routes>
        {/* 덱 시뮬레이터 */}
        <Route
          path="/"
          element={
            <Ssgoi config={ssgoiConfig}>
              <Layout>
                <SsgoiTransition id="/">
                  <DeckSimulator
                    apostles={apostles}
                    skillsData={skills.skills}
                    asidesData={asides.asides}
                  />
                </SsgoiTransition>
              </Layout>
            </Ssgoi>
          }
        />

        {/* 보유 사도 분석기 */}
        <Route
          path="/builder"
          element={
            <Ssgoi config={ssgoiConfig}>
              <Layout>
                <div style={{ position: 'relative', minHeight: '150vh' }}>
                  <SsgoiTransition id="/builder">
                    <DeckRecommender apostles={apostles} />
                  </SsgoiTransition>
                </div>
              </Layout>
            </Ssgoi>
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
              <Settings />
            </Layout>
          }
        />
        {/* 개인정보 처리방침 */}
        <Route
          path="/privacy"
          element={
            <Layout>
              <PrivacyPolicy />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
