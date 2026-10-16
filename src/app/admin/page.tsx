export default function AdminPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[#0B0D10] px-6 py-16">
      <div className="w-full max-w-xl rounded-[2rem] border border-[#29313B] bg-[#151A21] p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.4)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
          Admin
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#F3F5F7]">
          Axivon Admin Panel
        </h1>
        <p className="mt-3 text-base text-[#A7B0BC]">
          Access the dashboard and management tools from the admin navigation.
        </p>
      </div>
    </main>
  );
}
