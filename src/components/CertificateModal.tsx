import React, { useRef, useState } from 'react';
import { Award, Download, Printer, X, FileText, Shield } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QuizAttempt } from '../types';
import { INSTITUTE_NAME, QUIZ_DAY, QUIZ_TOPIC_ENGLISH, QUIZ_TOPIC_TELUGU, LEVEL_INFO } from '../data/quizData';
import { Logo } from './Logo';

interface CertificateModalProps {
  attempt: QuizAttempt;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ attempt, onClose }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const levelInfo = LEVEL_INFO[attempt.level];

  // Download certificate strictly as PDF document (no questions or extra UI)
  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsDownloadingPDF(true);

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, // High DPI for crisp vector-like text
        useCORS: true,
        backgroundColor: '#0f172a',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');

      // Create landscape PDF matching A4 standard dimensions
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`NTR_Digi_Class_Certificate_${attempt.fullName.replace(/\s+/g, '_')}_Level${attempt.level}.pdf`);
    } catch (err) {
      console.error('Certificate PDF export error:', err);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // Download certificate as PNG image
  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;
    setIsDownloadingImage(true);

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#0f172a',
        logging: false
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `NTR_Digi_Class_Certificate_${attempt.fullName.replace(/\s+/g, '_')}_Level${attempt.level}.png`;
      link.click();
    } catch (err) {
      console.error('Certificate canvas export error:', err);
    } finally {
      setIsDownloadingImage(false);
    }
  };

  // Browser print mode
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static" role="dialog" aria-modal="true" aria-labelledby="certificateTitle">
      
      {/* Outer Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto relative print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950 gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" aria-hidden="true" />
            <h3 id="certificateTitle" className="text-base font-bold text-white">
              Official Level {attempt.level} Certificate Preview
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Primary PDF Download Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF || isDownloadingImage}
              aria-label="Download official certificate as PDF file"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black shadow-lg transition-all cursor-pointer disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>{isDownloadingPDF ? 'Generating PDF...' : 'Download Certificate (PDF)'}</span>
            </button>

            {/* PNG Image Download */}
            <button
              onClick={handleDownloadImage}
              disabled={isDownloadingPDF || isDownloadingImage}
              aria-label="Download certificate image as PNG"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>{isDownloadingImage ? 'Generating Image...' : 'PNG Image'}</span>
            </button>

            {/* Print button */}
            <button
              onClick={handlePrint}
              aria-label="Print certificate or save via print dialog"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Print</span>
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

        {/* Printable Certificate Template Card */}
        <div className="p-4 sm:p-8 overflow-x-auto">
          <div
            ref={certificateRef}
            className="w-[800px] h-[580px] mx-auto bg-slate-950 text-white rounded-3xl p-8 border-8 border-double border-amber-500/60 relative flex flex-col justify-between shadow-2xl overflow-hidden select-none print:w-full print:h-auto print:border-amber-600 print:text-black print:bg-white"
            style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
            }}
          >
            {/* Certificate Ornate Corners & Background Watermark */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />
            
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

              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 uppercase tracking-wider print:text-amber-700">
                Certificate of Achievement
              </h1>

              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                {QUIZ_DAY} LIVE QUIZ — SOCIAL METHODOLOGY
              </p>
            </div>

            {/* Candidate Name Section */}
            <div className="text-center space-y-3 relative my-2">
              <p className="text-xs text-slate-300 italic font-medium">
                This certificate is proudly presented to
              </p>

              <div className="inline-block relative">
                <h2 className="text-3xl sm:text-4xl font-black text-amber-300 tracking-wide border-b-2 border-amber-500/40 pb-2 px-8 print:text-slate-900">
                  {attempt.fullName}
                </h2>
              </div>

              <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed pt-2">
                for successfully completing the live examination on <strong className="text-amber-300">{QUIZ_TOPIC_ENGLISH} ({QUIZ_TOPIC_TELUGU})</strong> conducted by {INSTITUTE_NAME} for {attempt.examPreparation} preparation.
              </p>
            </div>

            {/* Examination Details Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 grid grid-cols-4 gap-2 text-center relative print:bg-slate-100 print:border-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Quiz Day</span>
                <span className="text-sm font-black text-amber-400 print:text-amber-700">{attempt.quizDay}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Level</span>
                <span className="text-sm font-black text-white print:text-slate-900">Level {attempt.level} ({levelInfo.subtitle.split('&')[0]})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Score Achieved</span>
                <span className="text-sm font-black text-emerald-400 print:text-emerald-700">{attempt.score} / {attempt.totalQuestions} ({attempt.percentage}%)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                <span className="text-sm font-black text-emerald-400 print:text-emerald-700">QUALIFIED</span>
              </div>
            </div>

            {/* Footer Signatures, Verification & Stamp */}
            <div className="flex items-end justify-between pt-4 border-t border-slate-800 relative text-xs text-slate-400 print:border-slate-300">
              <div>
                <p className="font-bold text-slate-300 print:text-slate-700">Issued Date & Time:</p>
                <p className="text-[11px] font-mono text-amber-300 print:text-slate-900">{attempt.completionDate} at {attempt.completionTime}</p>
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
                <div className="font-serif italic text-base text-amber-400 font-bold print:text-amber-800">
                  NTR Digi Class
                </div>
                <p className="font-bold text-slate-300 text-[11px] print:text-slate-700">Authorized Examination Board</p>
                <p className="text-[10px] text-slate-400">youtube.com/@NtrDigiclass</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
