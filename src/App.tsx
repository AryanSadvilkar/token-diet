import React, { useState } from 'react';
import { NavView, CompressionRecord, SessionStats } from './types';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './components/views/OverviewView';
import { LiveDemoView } from './components/views/LiveDemoView';
import { CompareView } from './components/views/CompareView';
import { DetailsView } from './components/views/DetailsView';
import { Menu, X, Zap } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<NavView>('overview');
  const [sessionRecords, setSessionRecords] = useState<CompressionRecord[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Compute live session stats from records
  const totalCompressions = sessionRecords.length;
  const totalTokensSaved = sessionRecords.reduce((sum, r) => sum + r.tokensSaved, 0);
  const totalRawTokens = sessionRecords.reduce((sum, r) => sum + r.rawTokens, 0);
  const totalCompressedTokens = sessionRecords.reduce((sum, r) => sum + r.compressedTokens, 0);

  const avgRatioNum = totalCompressedTokens > 0 ? totalRawTokens / totalCompressedTokens : 1.0;
  const avgCompressionRatio = totalCompressions > 0 ? `${avgRatioNum.toFixed(1)}x` : '0.0x';

  const avgPercentNum = totalRawTokens > 0 ? Math.round((totalTokensSaved / totalRawTokens) * 100) : 0;
  const avgPercentSaved = totalCompressions > 0 ? `${avgPercentNum}%` : '0%';

  const sessionStats: SessionStats = {
    totalCompressions,
    totalTokensSaved,
    totalRawTokens,
    totalCompressedTokens,
    avgCompressionRatio,
    avgPercentSaved,
  };

  const handleRecordCompression = (newRecord: CompressionRecord) => {
    setSessionRecords((prev) => [newRecord, ...prev]);
  };

  const handleNavigate = (view: NavView) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
    const contentPanel = document.getElementById('main-content-panel');
    if (contentPanel) {
      contentPanel.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0A0A0F] text-[#F5F5F7] dot-grid overflow-hidden flex flex-col md:flex-row relative selection:bg-[#6EE7B7]/30 selection:text-[#6EE7B7]">
      {/* Background Noise Texture */}
      <div className="noise-overlay" />

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#14141C] border-b border-[#2A2A38] z-40 shrink-0">
        <div
          onClick={() => handleNavigate('overview')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-[#1C1C26] border border-[#2A2A38] flex items-center justify-center text-[#6EE7B7]">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-[#F5F5F7]">TokenDiet</span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-[#1C1C26] border border-[#2A2A38] text-[#9494A6] hover:text-[#F5F5F7] cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar (Fixed on Desktop ~240px, Drawer on Mobile) */}
      <div
        className={`fixed md:relative top-0 left-0 h-full z-50 md:z-30 transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          totalTokensSaved={totalTokensSaved}
          totalCompressions={totalCompressions}
        />
      </div>

      {/* Right Content Panel (Scrolls internally) */}
      <main
        id="main-content-panel"
        className="flex-1 h-[calc(100vh-53px)] md:h-screen overflow-y-auto bg-[#0A0A0F]/90 p-4 sm:p-8 lg:p-10 custom-scrollbar"
      >
        <div className="max-w-6xl mx-auto pb-16">
          {activeView === 'overview' && (
            <OverviewView stats={sessionStats} onNavigate={handleNavigate} />
          )}

          {activeView === 'demo' && (
            <LiveDemoView onRecordCompression={handleRecordCompression} />
          )}

          {activeView === 'compare' && (
            <CompareView stats={sessionStats} onNavigate={handleNavigate} />
          )}

          {activeView === 'details' && <DetailsView />}
        </div>
      </main>
    </div>
  );
}
