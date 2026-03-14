import { useEffect, useState } from 'react';

/**
 * Toast — slide-in notification from the right side
 * Props:
 *   message  : string
 *   type     : 'success' | 'error' | 'info'
 *   onClose  : fn
 *   duration : ms (default 10000)
 */
const ICONS = {
  success: <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  error:   <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  info:    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" /></svg>,
};
const BORDER = { success: 'border-green-500/60',  error: 'border-red-500/60',   info: 'border-yellow-500/60' };
const ICON_C = { success: 'text-green-400',        error: 'text-red-400',        info: 'text-yellow-400'      };
const BAR    = { success: 'bg-green-500',          error: 'bg-red-500',          info: 'bg-yellow-500'        };

const Toast = ({ message, type = 'success', onClose, duration = 10000 }) => {
  const [visible,  setVisible]  = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const step = (50 / duration) * 100;
    const id = setInterval(() => setProgress(p => Math.max(0, p - step)), 50);
    return () => clearInterval(id);
  }, [duration]);

  useEffect(() => {
    const t = setTimeout(handleClose, duration);
    return () => clearTimeout(t);
  }, [duration]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-80 rounded-2xl border bg-gray-900 shadow-2xl overflow-hidden
      transition-all duration-300 ease-out
      ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      ${BORDER[type]}`}>
      <div className="h-1 bg-gray-800">
        <div className={`h-full ${BAR[type]}`} style={{ width: `${progress}%`, transition: 'width 50ms linear' }} />
      </div>
      <div className="flex items-start gap-3 px-4 py-3">
        <span className={`mt-0.5 ${ICON_C[type]}`}>{ICONS[type]}</span>
        <p className="flex-1 text-sm font-semibold text-white leading-snug">{message}</p>
        <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors text-base leading-none mt-0.5">✕</button>
      </div>
    </div>
  );
};

export default Toast;