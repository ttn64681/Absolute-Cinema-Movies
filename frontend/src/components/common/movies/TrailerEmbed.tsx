import { IoClose } from 'react-icons/io5';

interface TrailerEmbedProps {
  name: string;
  trailerUrl?: string;
  isClosed: boolean;
  setIsClosed: (value: boolean) => void;
}

export default function TrailerEmbed({ name, trailerUrl, isClosed, setIsClosed }: TrailerEmbedProps) {
  if (isClosed) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Popup Window with Blur */}
      <div className="flex flex-col items-center gap-y-8 w-4/5 h-4/5 relative backdrop-blur-xl rounded-3xl border border-white/20 p-8 z-10">
        <button
          title="Close"
          type="button"
          className="absolute top-5 right-6 z-60 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-2 text-white hover:text-acm-pink duration-200 text-2xl cursor-pointer border border-white/20 hover:border-acm-pink/50"
          onClick={() => setIsClosed(true)}
        >
          <IoClose />
        </button>
        <h1 className="p-2 text-5xl font-bold font-afacad">{name}</h1>
        <iframe
          className="w-full h-full rounded-2xl"
          src={trailerUrl ? trailerUrl.replace('watch?v=', 'embed/') : 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
      {/* Overlay */}
      {/* <div
        className="fixed inset-0 z-0"
        // onClick={onClose}
      >
      </div> */}
    </div>
  );
}
