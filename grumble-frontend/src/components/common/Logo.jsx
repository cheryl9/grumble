export default function Logo({ size = 'lg' }) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`${sizes[size]} font-bold text-primary text-center mb-8`}>
      🍔 Grumble
    </div>
  );
}