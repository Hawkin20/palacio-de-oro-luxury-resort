export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-palacio-gold/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-palacio-gold animate-spin" />
      </div>
    </div>
  );
}
