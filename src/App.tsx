import PartySimulator from './components/party/PartySimulator';
import { useDataLoader } from './hooks/useDataLoader';
import Layout from './components/layout/Layout';

function App() {
  const { apostles, skills, asides, spells, isLoading, error } = useDataLoader();

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
    <Layout>
      <PartySimulator apostles={apostles} skillsData={skills} asidesData={asides} />
    </Layout>
  );
}

export default App;
