export default function AdminPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[#f8f5f1] px-6 py-16">
      <div className="w-full max-w-xl rounded-[2rem] border border-[#eadbc9] bg-white p-8 text-center shadow-[0_18px_50px_rgba(17,24,39,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a3d1d]">
          Admin
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-900">
          Axivon Admin Panel
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Access the dashboard and management tools from the admin navigation.
        </p>
      </div>
    </main>
  );
}
