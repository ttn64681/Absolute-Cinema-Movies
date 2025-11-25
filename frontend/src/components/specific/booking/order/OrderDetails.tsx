import { useMemo } from 'react';

interface Ticket {
  name: string;
  price: number;
  quantity: number;
}

interface Movie {
  title: string;
  showDate: string;
  rating: string;
  imageUrl?: string;
}

const fallbackMovie: Movie = {
  title: 'Godzilla',
  showDate: 'Sat · Oct 1',
  rating: 'PG-13',
};

const placeholderTickets: Ticket[] = [
  { name: 'Adult ticket', price: 18.5, quantity: 3 },
  { name: 'Child ticket', price: 12, quantity: 2 },
  { name: 'Senior ticket', price: 10, quantity: 1 },
];

const defaultSeats = 'C4, C5, C6, C7, C8, C9';
const gradientReverse = 'linear-gradient(90deg, #FF5C33 0%, #FF478B 100%)';

export default function OrderDetails({
  movie = fallbackMovie,
  tickets = placeholderTickets,
  seats = defaultSeats,
}: {
  movie?: Movie;
  tickets?: Ticket[];
  seats?: string;
}) {
  const subtotal = useMemo(
    () => tickets.reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0),
    [tickets],
  );

  const tax = subtotal * 0.0875;
  const total = subtotal + tax;

  return (
    <div className="p-[3px] rounded-2xl h-full" style={{ backgroundImage: gradientReverse }}>
      <div className="flex flex-col p-6 bg-black text-white rounded-2xl shadow-md w-full h-full">
        <h2 className="text-2xl font-extrabold mb-4">Order Details</h2>

        <div className="flex items-start mb-4">
          <div className="w-20 h-28 bg-gray-800 rounded-md border border-white flex items-center justify-center flex-shrink-0 overflow-hidden">
            {movie.imageUrl ? (
              <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-[10px] px-2 text-center">Poster pending</span>
            )}
          </div>
          <div className="ml-4">
            <p className="text-sm text-white font-semibold">{movie.title}</p>
            <p className="text-sm text-white/70">{movie.showDate}</p>
            <p className="text-sm text-white/70 mt-1">Rated: {movie.rating}</p>
          </div>
        </div>

        <Divider />

        <div className="mb-4 text-sm">
          <span className="text-white/70">Seats:</span>{' '}
          <span className="font-semibold">{seats}</span>
        </div>

        <Divider />

        <div className="space-y-2 mb-4 text-sm">
          {tickets.map((ticket) => (
            <div key={ticket.name} className="flex justify-between">
              <span>
                {ticket.name} · x{ticket.quantity}
              </span>
              <span>${(ticket.price * ticket.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <Divider />

        <div className="space-y-2 text-sm">
          <Row label="Subtotal" value={subtotal} />
          <Row label="Tax" value={tax} />
          <Divider />
          <Row label="Total" value={total} large />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, large = false }: { label: string; value: number; large?: boolean }) {
  return (
    <div className={`flex justify-between ${large ? 'text-lg font-semibold' : ''}`}>
      <span>{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  );
}

function Divider() {
  return <hr className="border-t border-white/20 my-4" />;
}
