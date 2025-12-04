import Image from 'next/image';

interface GenreProps {
  text: string;
  imageUrl?: string;
}

// Static image mapping for genres (will be changed)
const getGenreImage = (genre: string): string => {
  const genreImages: { [key: string]: string } = {
    Action: '/poster_godzilla.jpg',
    Adventure: '/poster_godzilla.jpg',
    Comedy: '/cinema_seats.jpg',
    Crime: '/poster_oldboy.jpg',
    Family: '/cinema_seats.jpg',
    Fantasy: '/poster_godzilla.jpg',
    Horror: '/poster_oldboy.jpg',
    Mystery: '/poster_oldboy.jpg',
    Romance: '/cinema_seats.jpg',
    'Sci-Fi': '/poster_godzilla.jpg',
    Thriller: '/poster_oldboy.jpg',
  };

  return genreImages[genre] || '/TheBatmanPoster.jpg';
};

export default function Genre({ text, imageUrl }: GenreProps) {
  const imageSrc = imageUrl || getGenreImage(text);

  return (
    <a href={`/movies?genres=${encodeURIComponent(text)}`}>
      <button
        className="relative w-64 h-32 border-2 border-white/60 hover:border-acm-pink text-white overflow-hidden rounded-lg duration-200 group hover:cursor-pointer transition-all hover:scale-105"
        title={text}
        type="button"
      >
        <Image
          src={imageSrc}
          alt={`${text} genre`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black group-hover:bg-black/60" />
        <div className="absolute inset-0 flex items-center justify-center z-10 group-hover:scale-102 transition-all">
          <div className="backdrop-blur-md bg-white/20 group-hover:bg-acm-pink/20 px-4 py-2 rounded-lg transition-colors duration-200">
            <h3 className="text-xl font-bold text-white group-hover:text-acm-pink drop-shadow-lg transition-colors duration-200">{text}</h3>
          </div>
        </div>
      </button>
    </a>
  );
}
