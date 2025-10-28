export default function CheckoutCancel() {
  return (
    <main className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold">Payment canceled</h1>
      <p className="text-gray-700 mt-4">Your PayPal checkout was canceled. You can try again or contact support if needed.</p>
      <p className="mt-6"><a className="text-blue-600 underline" href="/shop">Back to shop</a></p>
    </main>
  )
}

