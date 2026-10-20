export default function SplashScreen({ onRegister, onLogin }: { onRegister: () => void; onLogin: () => void }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl top-0 -left-32 pointer-events-none" />
      <div className="relative max-w-xl text-center py-10">
        <p className="text-cyan-300 font-semibold tracking-widest text-sm mb-5">THE CHALLENGE STARTS HERE</p>
        <h1 className="text-7xl sm:text-8xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-purple-400 to-pink-400">FINAL<br />EXAM</h1>
        <img src="https://d64gsuwffb70l.cloudfront.net/6829088702a251ce52390b4c_1768321680007_eefa5b93.jpg" alt="Principal Powers" className="w-28 h-28 object-cover rounded-full border-4 border-cyan-400 mx-auto my-8 shadow-lg shadow-cyan-400/20" />
        <h2 className="text-2xl sm:text-3xl text-white font-bold mb-4">Ready to prove yourself?</h2>
        <p className="text-slate-300 mb-8 max-w-sm mx-auto">Put your knowledge to the test. Register for an adult tester account and take on the challenge.</p>
        <div className="space-y-3 max-w-sm mx-auto">
          <button onClick={onRegister} className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-full shadow-lg shadow-purple-500/30 hover:brightness-110 transition">TEST THE SOFTWARE</button>
          <button onClick={onLogin} className="w-full py-3 px-6 border border-slate-500 rounded-full text-white font-semibold hover:bg-white/10 transition">LOG IN</button>
        </div>
        <p className="text-slate-400 text-sm mt-5">For testers aged 18 and over.</p>
      </div>
    </main>
  );
}
