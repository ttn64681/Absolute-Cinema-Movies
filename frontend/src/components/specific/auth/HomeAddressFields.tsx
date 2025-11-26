'use client';

interface HomeAddressFieldsProps {
  homeAddress: string;
  homeCity: string;
  homeState: string;
  homeZip: string;
  homeCountry: string;
  onAddressChange: (field: string, value: string) => void;
}

export default function HomeAddressFields({
  homeAddress,
  homeCity,
  homeState,
  homeZip,
  homeCountry,
  onAddressChange,
}: HomeAddressFieldsProps) {
  return (
    <div className="pt-4 border-t border-white/10">
      <h3 className="text-white font-semibold mb-4">Home Address (Optional)</h3>

      <div className="space-y-4">
        {/* Street Address */}
        <div>
          <label htmlFor="homeAddress" className="block text-white text-sm mb-2">
            Street Address
          </label>
          <input
            type="text"
            id="homeAddress"
            value={homeAddress}
            onChange={(e) => onAddressChange('homeAddress', e.target.value)}
            placeholder="Input text"
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
          />
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="homeCity" className="block text-white text-sm mb-2">
              City
            </label>
            <input
              type="text"
              id="homeCity"
              value={homeCity}
              onChange={(e) => onAddressChange('homeCity', e.target.value)}
              placeholder="Input text"
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="homeState" className="block text-white text-sm mb-2">
              State
            </label>
            <input
              type="text"
              id="homeState"
              value={homeState}
              onChange={(e) => onAddressChange('homeState', e.target.value)}
              placeholder="Input text"
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="homeZip" className="block text-white text-sm mb-2">
              ZIP
            </label>
            <input
              type="text"
              id="homeZip"
              value={homeZip}
              onChange={(e) => onAddressChange('homeZip', e.target.value)}
              placeholder="Input text"
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label htmlFor="homeCountry" className="block text-white text-sm mb-2">
            Country
          </label>
          <input
            type="text"
            id="homeCountry"
            value={homeCountry}
            onChange={(e) => onAddressChange('homeCountry', e.target.value)}
            placeholder="Input text"
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

