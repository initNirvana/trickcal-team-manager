import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Ssgoi, SsgoiTransition } from '@ssgoi/react';
import { film } from '@ssgoi/react/view-transitions';
import { useDataLoader } from './hooks/useDataLoader';
import Layout from './components/layout/Layout';
import DeckSimulator from './components/party/DeckSimulator';
import DeckRecommender from './components/builder/DeckRecommender';

function App() {
  const { apostles, skills, asides, spells, isLoading, error } = useDataLoader();

  const ssgoiConfig = {
    transitions: [{ from: '/', to: '/builder', transition: film(), symmetric: true }],
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-800 text-white">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p>데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-800 text-white">
        <div className="text-center">
          <p className="text-red-500">⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (apostles.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-800 text-white">
        <p>사도 데이터를 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 덱 시뮬레이터 */}
        <Route
          path="/"
          element={
            <Ssgoi config={ssgoiConfig}>
              <Layout>
                <SsgoiTransition id="/">
                  <DeckSimulator apostles={apostles} skillsData={skills} asidesData={asides} />
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
              <div style={{ position: 'relative', minHeight: '100vh' }}>
                <Layout>
                  <SsgoiTransition id="/builder">
                    <DeckRecommender apostles={apostles} />
                  </SsgoiTransition>
                </Layout>
              </div>
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
                  <a href="/" className="mt-4 inline-block text-blue-500 hover:text-blue-400">
                    홈으로 돌아가기
                  </a>
                </div>
              </div>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
