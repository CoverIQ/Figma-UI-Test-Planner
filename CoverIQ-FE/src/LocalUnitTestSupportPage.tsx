export default function LocalUnitTestSupportPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Local Unit Test Support</h1>
      <div className="w-full max-w-2xl aspect-video mb-8">
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/CWwHSRvzGNg?autoplay=1&loop=1&playlist=CWwHSRvzGNg"
          title="Local Unit Test Support Demo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg shadow-lg w-full h-full"
        ></iframe>
      </div>
      <a
        href="https://github.com/CoverIQ/Local-Unit-Test-Support"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow"
      >
        Available on GitHub
      </a>
    </div>
  );
} 