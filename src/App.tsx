import React, { useState, useEffect } from 'react';
import PartySimulator from './components/party/PartySimulator';
import type { Apostle } from './types/apostle';
import apostlesData from './data/apostles.json';
import skillsData from './data/skills.json';
import asidesData from './data/asides.json';
import Layout from './components/layout/Layout';

function App() {
  const [apostles, setApostles] = useState<Apostle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      if (apostlesData && apostlesData.apostles) {
        setApostles(apostlesData.apostles as Apostle[]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('사도 데이터 로딩 실패:', error);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-800 text-white">
        로딩 중...
      </div>
    );
  }

  if (apostles.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-800 text-white">
        사도 데이터를 불러올 수 없습니다
      </div>
    );
  }

  return (
    <Layout>
      <PartySimulator apostles={apostles} skillsData={skillsData} asidesData={asidesData} />
    </Layout>
  );
}

export default App;
