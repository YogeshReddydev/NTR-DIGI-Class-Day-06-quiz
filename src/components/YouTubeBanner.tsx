import React from 'react';
import { Youtube, ExternalLink, Sparkles, Bell } from 'lucide-react';
import { INSTITUTE_NAME, YOUTUBE_URL } from '../data/quizData';

export const YouTubeBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl glass-card border border-red-500/30 p-5 sm:p-6 shadow-xl my-6">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-2xl text-red-500 flex-shrink-0 backdrop-blur-md">
            <Youtube className="w-8 h-8 fill-red-600 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20 backdrop-blur-md">
                Official YouTube Channel
              </span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Learn More with {INSTITUTE_NAME}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              "Subscribe to our YouTube channel for TET & DSC preparation, Social Methodology revision classes, live quizzes, and educational content."
            </p>
          </div>
        </div>

        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Subscribe on NTR Digi Class YouTube Channel (opens in new tab)"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-400 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-red-600/40 border border-red-400/30 transition-all hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <Bell className="w-4 h-4 animate-bounce" aria-hidden="true" />
          <span>Subscribe on YouTube</span>
          <ExternalLink className="w-4 h-4 opacity-80" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
};
