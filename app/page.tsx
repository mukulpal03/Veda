import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UploadSection from './components/UploadSection';

export default function Home() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen bg-gradient-to-br from-[#EAEAEA] to-[#D5D5D5] p-4 lg:p-[12px] gap-4 lg:gap-[12px] overflow-auto font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-auto min-h-full lg:h-full gap-4 lg:gap-[12px]">
        <Header />
        <UploadSection />
      </main>
    </div>
  );
}
