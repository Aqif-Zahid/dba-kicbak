export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-4">Sorry, we couldn't complete your authentication. Please try again.</p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Return Home
        </a>
      </div>
    </div>
  )
}
