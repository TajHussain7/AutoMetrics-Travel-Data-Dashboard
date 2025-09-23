interface HeaderProps {
  title: string;
  breadcrumb: string;
}

export default function Header({ title, breadcrumb }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <nav className="text-sm text-slate-500 mt-1">
            <span>{breadcrumb}</span>
          </nav>
        </div>
      </div>
    </header>
  );
}
