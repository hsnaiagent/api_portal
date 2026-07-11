import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FilterSelectOption = { value: string; label: string };

type FilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: FilterSelectOption[];
  className?: string;
};

/** Single-select filter dropdown with an "all" empty option. */
export function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  className,
}: FilterSelectProps) {
  return (
    <Select
      value={value || 'all'}
      onValueChange={(v) => onChange(!v || v === 'all' ? '' : v)}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
