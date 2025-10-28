export default function CheckoutSuccess() {
  return (
    <main className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold">Thank you for your purchase</h1>
      <p className="text-gray-700 mt-4">Your PayPal payment was successful. You will receive an email confirmation shortly.</p>
      <p className="mt-6"><a className="text-blue-600 underline" href="/shop">Continue shopping</a></p>
    </main>
  )
}

