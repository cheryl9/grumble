export default function Input({ 
  label, 
  type = 'text',
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false
}) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        required={required}
      />
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}