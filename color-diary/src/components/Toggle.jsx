function Toggle({ checked, onChange, size = 'sm' }) {
  const md = size === 'md';
  return (
    <button
      onClick={onChange}
      className={`${md ? 'w-11 h-6' : 'w-10 h-5'} rounded-full transition-colors cursor-pointer relative ${
        checked ? 'bg-[var(--accent)]' : 'bg-[var(--toggle-off)]'
      }`}
    >
      <div
        className={`${md ? 'w-5 h-5' : 'w-4 h-4'} rounded-full bg-[var(--bg-app)] absolute top-0.5 transition-transform ${
          md ? 'shadow-sm' : ''
        } ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

export default Toggle;
