import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ResultsContainer from './components/ResultsContainer';

export const metadata = {
  title: 'Assessment Review & Answer Mapping - VedaAI',
  description: 'Side-by-side assessment review with interactive answer sheet bounding box mapping and AI grading.',
};

export default function ResultsPage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen bg-gradient-to-br from-[#EAEAEA] to-[#D5D5D5] p-3 lg:p-[12px] gap-3 lg:gap-[12px] overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden min-h-full lg:h-full gap-3 lg:gap-[12px]">
        <Header />
        <ResultsContainer />
      </main>
    </div>
  );
}
