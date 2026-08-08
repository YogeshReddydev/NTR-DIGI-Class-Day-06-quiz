import React, { useRef, useState } from 'react';
import { Award, Download, X, FileText, Shield, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QuizAttempt } from '../types';
import { INSTITUTE_NAME, QUIZ_DAY, QUIZ_TOPIC_ENGLISH, LEVEL_INFO } from '../data/quizData';
import { Logo } from './Logo';

interface CertificateModalProps {
  attempt: QuizAttempt;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ attempt, onClose }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const levelInfo = LEVEL_INFO[attempt.level];
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Helper to capture certificate element safely across desktop and mobile devices
  const generateCanvas = async () => {
    if (!certificateRef.current) throw new Error('Certificate element not found');

    return await html2canvas(certificateRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: false, // Must be false to prevent canvas tainting
      backgroundColor: '#0f172a',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1200,
      windowHeight: 900,
      onclone: (clonedDoc) => {
        // Strip heavy blur filters that cause html2canvas processing failures
        const blurs = clonedDoc.querySelectorAll('.blur-3xl, .blur-2xl, .blur-xl, .backdrop-blur-md');
        blurs.forEach((el) => {
          (el as HTMLElement).style.filter = 'none';
          (el as HTMLElement).style.backdropFilter = 'none';
        });

        // Fix CSS text-transparent / bg-clip-text issues in cloned DOM for html2canvas
        const transparentElements = clonedDoc.querySelectorAll('.text-transparent');
        transparentElements.forEach((el) => {
          (el as HTMLElement).style.color = '#fcd34d'; // amber-300 fallback
          (el as HTMLElement).style.webkitBackgroundClip = 'unset';
          (el as HTMLElement).style.backgroundClip = 'unset';
          (el as HTMLElement).style.backgroundImage = 'none';
        });

        // Ensure proper dimensions without outer transformations
        const certCard = clonedDoc.querySelector('[data-certificate-card]') as HTMLElement;
        if (certCard) {
          certCard.style.transform = 'none';
          certCard.style.margin = '0 auto';
        }
      }
    });
  };

  // Download certificate as a PDF document
  const handleDownloadPDF = async () => {
    setDownloadError(null);
    setDownloadSuccess(null);
    setIsDownloadingPDF(true);

    try {
      const canvas = await generateCanvas();
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Create landscape PDF matching A4 standard dimensions (297mm x 210mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      const cleanCandidateName = (attempt.fullName || 'Candidate').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `NTR_Digi_Class_Certificate_${cleanCandidateName}_Level${attempt.level}.pdf`;

      // jsPDF built-in save triggers native browser download reliably across mobile & desktop
      pdf.save(fileName);
      setDownloadSuccess('PDF Certificate downloaded successfully!');
    } catch (err: any) {
      console.error('Certificate PDF export error:', err);
      setDownloadError(err?.message || 'Unable to generate PDF certificate. Please try downloading as PNG.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // Download certificate as a high-resolution PNG image
  const handleDownloadImage = async () => {
    setDownloadError(null);
    setDownloadSuccess(null);
    setIsDownloadingImage(true);

    try {
      const canvas = await generateCanvas();
      const cleanCandidateName = (attempt.fullName || 'Candidate').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `NTR_Digi_Class_Certificate_${cleanCandidateName}_Level${attempt.level}.png`;

      // Generate PNG data URL directly
      const dataUrl = canvas.toDataURL('image/png', 1.0);

      // Trigger browser-level download via anchor element
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 1000);

      setDownloadSuccess('PNG Certificate image downloaded successfully!');
    } catch (err: any) {
      console.error('Certificate PNG export error:', err);
      setDownloadError(err?.message || 'Unable to generate PNG image. Please try downloading as PDF.');
    } finally {
      setIsDownloadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="certificateTitle">
      
      {/* Outer Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto relative">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950 gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" aria-hidden="true" />
            <h3 id="certificateTitle" className="text-base font-bold text-white">
              Official Level {attempt.level} Certificate Preview
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF || isDownloadingImage}
              aria-label="Download official certificate as PDF file"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black shadow-lg transition-all cursor-pointer disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>{isDownloadingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            {/* PNG Image Download Button */}
            <button
              onClick={handleDownloadImage}
              disabled={isDownloadingPDF || isDownloadingImage}
              aria-label="Download certificate image as PNG"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>{isDownloadingImage ? 'Generating PNG...' : 'Download PNG'}</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close certificate modal"
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              title="Close Certificate"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {downloadSuccess && (
          <div role="status" className="mx-4 sm:mx-8 mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{downloadSuccess}</span>
            </span>
            <button onClick={() => setDownloadSuccess(null)} className="text-emerald-400 hover:text-white text-xs underline ml-2">
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert if Download fails */}
        {downloadError && (
          <div role="alert" className="mx-4 sm:mx-8 mt-4 p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center justify-between">
            <span>{downloadError}</span>
            <button onClick={() => setDownloadError(null)} className="text-slate-400 hover:text-white text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Certificate Template Card */}
        <div className="p-4 sm:p-8 overflow-x-auto">
          <div
            ref={certificateRef}
            data-certificate-card="true"
            className="w-[800px] h-[580px] mx-auto bg-slate-950 text-white rounded-3xl p-8 border-8 border-double border-amber-500/60 relative flex flex-col justify-between shadow-2xl overflow-hidden select-none"
            style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
            }}
          >
            {/* Certificate Background Elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none">
              <Logo size="2xl" layout="badge-only" className="w-96 h-96" />
            </div>

            {/* Certificate Header */}
            <div className="text-center space-y-1 relative flex flex-col items-center">
              <div className="mb-1">
                <Logo size="lg" layout="badge-only" />
              </div>

              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="h-0.5 w-12 bg-amber-500/60" />
                <span className="text-amber-400 font-extrabold text-xs uppercase tracking-[0.25em]">
                  {INSTITUTE_NAME} OFFICIAL CERTIFICATE
                </span>
                <span className="h-0.5 w-12 bg-amber-500/60" />
              </div>

              <h1 className="text-3xl font-black text-amber-300 uppercase tracking-wider">
                Certificate of Achievement
              </h1>

              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                {attempt.quizDay || QUIZ_DAY} LIVE QUIZ — SOCIAL METHODOLOGY
              </p>
            </div>

            {/* Candidate Name Section */}
            <div className="text-center space-y-3 relative my-2">
              <p className="text-xs text-slate-300 italic font-medium">
                This certificate is proudly presented to
              </p>

              <div className="inline-block relative">
                <h2 className="text-3xl sm:text-4xl font-black text-amber-300 tracking-wide border-b-2 border-amber-500/40 pb-2 px-8">
                  {attempt.fullName}
                </h2>
              </div>

              <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed pt-2">
                for successfully completing the live examination on <strong className="text-amber-300">{attempt.topic || QUIZ_TOPIC_ENGLISH}</strong> conducted by {INSTITUTE_NAME} for {attempt.examPreparation} preparation.
              </p>
            </div>

            {/* Examination Details Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 grid grid-cols-4 gap-2 text-center relative">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Quiz Day</span>
                <span className="text-sm font-black text-amber-400">{attempt.quizDay}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Level</span>
                <span className="text-sm font-black text-white">Level {attempt.level} ({levelInfo.subtitle.split('&')[0]})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Score Achieved</span>
                <span className="text-sm font-black text-emerald-400">{attempt.score} / {attempt.totalQuestions} ({attempt.percentage}%)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                <span className="text-sm font-black text-emerald-400">QUALIFIED</span>
              </div>
            </div>

            {/* Footer Signatures, Verification & Stamp */}
            <div className="flex items-end justify-between pt-4 border-t border-slate-800 relative text-xs text-slate-400">
              <div>
                <p className="font-bold text-slate-300">Issued Date & Time:</p>
                <p className="text-[11px] font-mono text-amber-300">{attempt.completionDate} at {attempt.completionTime}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Cert ID: {attempt.certificateId}</p>
              </div>

              {/* Official Seal Badge */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-300 p-0.5 shadow-lg flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center text-center p-1 border border-amber-300/40">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <span className="text-[8px] font-black text-amber-300 uppercase tracking-tighter mt-0.5">VERIFIED</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-serif italic text-base text-amber-400 font-bold">
                  NTR Digi Class
                </div>
                <p className="font-bold text-slate-300 text-[11px]">Authorized Examination Board</p>
                <p className="text-[10px] text-slate-400">youtube.com/@NtrDigiclass</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

