import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ImagePlus, X, ChevronLeft } from 'lucide-react';
import Modal from '../common/Modal';
import { Spinner } from '../common/Loader';
import { createPostRequest } from '../../api/posts';

const MAX_FILES = 10;
const MAX_SIZE = 50 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'video/mp4', 'video/quicktime'];

export default function CreatePostModal({ open, onClose, onCreated }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [postType, setPostType] = useState('post');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('select'); // select | details
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const reset = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setFiles([]);
    setPreviews([]);
    setCaption('');
    setLocation('');
    setPostType('post');
    setStep('select');
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFiles = (fileList) => {
    const picked = Array.from(fileList).slice(0, MAX_FILES);
    const valid = [];
    for (const f of picked) {
      if (!ACCEPTED.includes(f.type)) {
        toast.error(`Unsupported file type: ${f.name}`);
        continue;
      }
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name} is larger than 50MB`);
        continue;
      }
      valid.push(f);
    }
    if (valid.length === 0) return;
    setFiles(valid);
    setPreviews(
      valid.map((f) => ({
        url: URL.createObjectURL(f),
        isVideo: f.type.startsWith('video/'),
      }))
    );
    setStep('details');
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setSubmitting(true);
    try {
      const res = await createPostRequest(files, { caption, location, postType });
      toast.success('Post shared!');
      onCreated?.(res.data.post);
      handleClose();
      navigate(`/p/${res.data.post._id}`);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} className="max-w-2xl bg-ig-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden" showClose={step === 'select'}>
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3.5 bg-white/[0.01]">
        {step === 'details' ? (
          <button onClick={() => setStep('select')} className="text-white/70 hover:text-white transition-colors">
            <ChevronLeft size={22} />
          </button>
        ) : (
          <div className="w-6" />
        )}
        <h2 className="font-semibold text-white">Create new post</h2>
        {step === 'details' ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="text-ig-blue hover:text-blue-400 font-semibold text-sm disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            {submitting && <Spinner size={14} />}
            Share
          </button>
        ) : (
          <div className="w-6" />
        )}
      </div>

      {step === 'select' && (
        <div className="flex flex-col items-center justify-center py-20 px-8 gap-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white mb-2">
            <ImagePlus size={36} strokeWidth={1.5} />
          </div>
          <p className="text-lg font-medium text-white">Drag photos and videos here</p>
          <div className="flex gap-4 items-center bg-white/5 px-4 py-2 rounded-xl border border-white/5 mb-2">
            <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer hover:text-white">
              <input
                type="radio"
                name="postType"
                checked={postType === 'post'}
                onChange={() => setPostType('post')}
                className="accent-ig-blue"
              />
              Post
            </label>
            <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer hover:text-white">
              <input
                type="radio"
                name="postType"
                checked={postType === 'reel'}
                onChange={() => setPostType('reel')}
                className="accent-ig-blue"
              />
              Reel
            </label>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="bg-ig-blue hover:bg-blue-600 active:scale-95 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200"
          >
            Select from computer
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
          />
        </div>
      )}

      {step === 'details' && (
        <div className="flex flex-col sm:flex-row max-h-[70vh] divide-y sm:divide-y-0 sm:divide-x divide-white/5">
          <div className="sm:w-1/2 bg-black flex items-center justify-center relative">
            <div className="flex overflow-x-auto no-scrollbar w-full h-64 sm:h-96">
              {previews.map((p, i) => (
                <div key={i} className="w-full h-full shrink-0 flex items-center justify-center relative bg-black">
                  {p.isVideo ? (
                    <video src={p.url} className="max-h-full max-w-full" controls />
                  ) : (
                    <img src={p.url} className="max-h-full max-w-full object-contain" alt={`upload-${i}`} />
                  )}
                  <button
                    onClick={() => {
                      const nf = files.filter((_, idx) => idx !== i);
                      const np = previews.filter((_, idx) => idx !== i);
                      setFiles(nf);
                      setPreviews(np);
                      if (nf.length === 0) setStep('select');
                    }}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white rounded-full p-1.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="sm:w-1/2 p-5 flex flex-col gap-4 overflow-y-auto bg-ig-surface/20">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 2200))}
              placeholder="Write a caption..."
              rows={5}
              className="bg-transparent outline-none resize-none text-sm placeholder:text-ig-dim border-b border-white/5 pb-2 text-white leading-relaxed"
            />
            <p className="text-xs text-ig-dim text-right -mt-3">{caption.length}/2,200</p>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value.slice(0, 100))}
              placeholder="Add location"
              className="bg-transparent outline-none text-sm placeholder:text-ig-dim border-b border-white/5 pb-2 text-white"
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
