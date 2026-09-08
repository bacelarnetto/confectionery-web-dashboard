interface RadioToggleOption {
  value: string
  label: string
  disabled?: boolean
}

interface RadioToggleProps {
  name: string
  value: string
  onChange: (value: string) => void
  options: RadioToggleOption[]
}

export default function RadioToggle({ name, value, onChange, options }: RadioToggleProps) {
  return (
    <div className="flex items-center gap-4">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`inline-flex items-center gap-1.5 text-sm ${
            opt.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            disabled={opt.disabled}
            onChange={() => onChange(opt.value)}
            className="text-amber-500 focus:ring-amber-400"
          />
          {opt.label}
        </label>
      ))}
    </div>
  )
}
