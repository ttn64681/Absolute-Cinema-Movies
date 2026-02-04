interface FiltersDateProps {
  text: string;
  value: { month: string; day: string; year: string };
  onChange: (v: { month: string; day: string; year: string }) => void;
}

export default function FiltersDate({ text, value, onChange }: FiltersDateProps) {
  const months: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const setPart = (part: 'month' | 'day' | 'year', val: string) => {
    onChange({ ...value, [part]: val });
  };

  return (
    <div className="flex flex-col gap-y-1">
      <h3 className="text-xl font-bold font-afacad">{text}</h3>
      <div className="flex flex-row gap-2">
        {/* May look into using a date picker from flowbite-react or similar library */}
        {/* https://flowbite.com/docs/components/datepicker/ */}
        {/* <label
                className="flex flex-row w-full p-2 border-3 border-acm-pink bg-black/20 rounded-lg outline-0 text-white/60 font-medium basis-1/3"                
            >
                <select
                    className="appearance-none "
                    defaultValue={currentDate.getMonth() + 1}
                    aria-label="Month"
                    onChange={(e) => setPart("month", e.target.value)}
                >
                    {months.map((month, i) => (
                    <option key={i} value={i + 1}>{month}</option>
                    ))}
                </select>
                <ChevronDownIcon />
            </label> */}
        {/* Month dropdown */}
        <select
          className="appearance-none w-full p-2 border-2 border-acm-pink bg-black/20 rounded-lg outline-0 text-white/60 font-medium basis-1/3 cursor-pointer"
          value={value.month}
          aria-label="Month"
          onChange={(e) => setPart('month', e.target.value)}
        >
          <option value="" disabled>
            Month
          </option>
          {months.map((month, i) => (
            <option key={i} value={i + 1}>
              {month}
            </option>
          ))}
        </select>

        {/* Day dropdown */}
        <select
          className="appearance-none w-full p-2 border-2 border-acm-pink bg-black/20 rounded-lg outline-0 text-white/60 font-medium basis-1/6 cursor-pointer"
          value={value.day}
          aria-label="Day"
          onChange={(e) => setPart('day', e.target.value)}
        >
          <option value="" disabled>
            Day
          </option>
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>

        {/* Year dropdown */}
        <select
          className="appearance-none w-full p-2 border-2 border-acm-pink bg-black/20 rounded-lg outline-0 text-white/60 font-medium basis-1/4 cursor-pointer"
          value={value.year}
          aria-label="Year"
          onChange={(e) => setPart('year', e.target.value)}
        >
          <option value="" disabled>
            Year
          </option>
          {Array.from({ length: 6 }, (_, i) => (
            <option key={i} value={2021 + i}>
              {2021 + i}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
