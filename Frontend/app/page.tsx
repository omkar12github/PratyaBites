export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-orange-600">
            PratyaBites
          </h1>
          <p className="text-xs text-gray-500">
            Pratya&apos;s Promise, Every Bite.
          </p>
        </div>

        <div className="hidden gap-8 md:flex">
          <a href="#" className="hover:text-orange-600">Home</a>
          <a href="#" className="hover:text-orange-600">Menu</a>
          <a href="#" className="hover:text-orange-600">Offers</a>
          <a href="#" className="hover:text-orange-600">About</a>
          <a href="#" className="hover:text-orange-600">Contact</a>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-gray-700">🛒 Cart</button>
          <button className="rounded-full bg-orange-600 px-5 py-2 text-white hover:bg-orange-700">
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-orange-50 px-8 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">

          <div>
            <p className="mb-4 font-semibold uppercase tracking-widest text-orange-600">
              🌱 100% Pure Vegetarian
            </p>

            <h2 className="text-5xl font-extrabold leading-tight md:text-6xl">
              Fresh Food.
              <br />
              <span className="text-orange-600">Happy Bites.</span>
            </h2>

            <p className="mt-6 max-w-lg text-lg text-gray-600">
              Delicious vegetarian fast food prepared fresh and delivered
              straight to your doorstep.
            </p>

            <div className="mt-8 flex gap-4">
              <button className="rounded-full bg-orange-600 px-7 py-3 font-semibold text-white hover:bg-orange-700">
                Order Now
              </button>

              <button className="rounded-full border border-orange-600 px-7 py-3 font-semibold text-orange-600 hover:bg-orange-100">
                Explore Menu
              </button>
            </div>
          </div>

          <div className="flex h-80 items-center justify-center rounded-3xl bg-orange-200 text-8xl">
            🍔 🍕
          </div>

        </div>
      </section>

      {/* Categories */}
      <section className="px-8 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold">
            Explore Our Menu
          </h2>

          <p className="mt-2 text-center text-gray-500">
            Something delicious for every craving.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-8">

            {[
              ["🍕", "Pizza"],
              ["🍔", "Burgers"],
              ["🥪", "Sandwich"],
              ["🍝", "Pasta"],
              ["🥟", "Momos"],
              ["🍟", "Fries"],
              ["🌯", "Wraps"],
              ["🥤", "Drinks"],
            ].map(([icon, name]) => (
              <div
                key={name}
                className="cursor-pointer rounded-2xl border p-5 text-center transition hover:-translate-y-1 hover:border-orange-500 hover:shadow-md"
              >
                <div className="text-4xl">{icon}</div>
                <p className="mt-3 font-semibold">{name}</p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Specials */}
      <section className="bg-gray-50 px-8 py-16">
        <div className="mx-auto max-w-7xl">

          <div className="flex items-end justify-between">
            <div>
              <p className="font-semibold text-orange-600">
                ⭐ Our Favorites
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                PratyaBites Specials
              </h2>
            </div>

            <button className="hidden font-semibold text-orange-600 md:block">
              View Full Menu →
            </button>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {[
              ["🍕", "Paneer Tikka Pizza", "₹229"],
              ["🍔", "Paneer Burger", "₹149"],
              ["🍝", "White Sauce Pasta", "₹179"],
              ["🥟", "Cheese Momos", "₹159"],
            ].map(([image, name, price]) => (
              <div
                key={name}
                className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-48 items-center justify-center bg-orange-100 text-7xl">
                  {image}
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{name}</h3>
                    <span className="font-bold text-orange-600">
                      {price}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Freshly prepared and delicious.
                  </p>

                  <button className="mt-5 w-full rounded-xl bg-orange-600 py-2.5 font-semibold text-white hover:bg-orange-700">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-8 py-16">
        <div className="mx-auto max-w-7xl">

          <h2 className="text-center text-3xl font-bold">
            Why Choose PratyaBites?
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-4">

            {[
              ["🌱", "100% Pure Veg", "Every dish is completely vegetarian."],
              ["🥬", "Fresh Ingredients", "Fresh ingredients prepared with care."],
              ["🚀", "Fast Delivery", "Hot and fresh food delivered quickly."],
              ["❤️", "Made With Care", "Quality and taste in every bite."],
            ].map(([icon, title, description]) => (
              <div
                key={title}
                className="rounded-2xl border p-7 text-center"
              >
                <div className="text-4xl">{icon}</div>
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {description}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 px-8 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">

          <div>
            <h2 className="text-2xl font-bold text-orange-500">
              PratyaBites
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              Pratya&apos;s Promise, Every Bite.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Quick Links</h3>
            <div className="mt-4 space-y-2 text-sm text-gray-400">
              <p>Home</p>
              <p>Menu</p>
              <p>Offers</p>
              <p>About Us</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Support</h3>
            <div className="mt-4 space-y-2 text-sm text-gray-400">
              <p>Contact Us</p>
              <p>FAQ</p>
              <p>Privacy Policy</p>
              <p>Terms & Conditions</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Follow Us</h3>
            <div className="mt-4 space-y-2 text-sm text-gray-400">
              <p>Instagram</p>
              <p>Facebook</p>
              <p>WhatsApp</p>
            </div>
          </div>

        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © 2026 PratyaBites. All rights reserved.
        </div>
      </footer>

    </main>
  );
}