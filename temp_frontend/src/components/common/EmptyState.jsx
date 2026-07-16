export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      {Icon && (
        <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mb-4">
          <Icon size={30} />
        </div>
      )}
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle && <p className="text-ig-dim mt-1 max-w-xs">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
