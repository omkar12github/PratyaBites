const categories = [
  "All",
  "Pizza",
  "Burgers",
  "Sandwiches",
  "Wraps",
  "Pasta",
  "Momos",
  "Fries",
  "Beverages",
];

const foods = [
  {
    emoji: "🍕",
    name: "Margherita Pizza",
    category: "Pizza",
    price: 149,
    description: "Classic cheese pizza with fresh toppings.",
    special: false,
  },
  {
    emoji: "🍕",
    name: "Farm Fresh Pizza",
    category: "Pizza",
    price: 199,
    description: "Loaded with fresh vegetables and cheese.",
    special: false,
  },
  {
    emoji: "🍕",
    name: "Paneer Tikka Pizza",
    category: "Pizza",
    price: 229,
    description: "Delicious paneer tikka with cheese.",
    special: true,
  },
  {
    emoji: "🍔",
    name: "Classic Veg Burger",
    category: "Burgers",
    price: 99,
    description: "Crispy vegetarian patty with fresh vegetables.",
    special: false,
  },
  {
    emoji: "🍔",
    name: "Cheese Burger",
    category: "Burgers",
    price: 119,
    description: "Classic veg burger with melted cheese.",
    special: false,
  },
  {
    emoji: "🍔",
    name: "Paneer Burger",
    category: "Burgers",
    price: 149,
    description: "Crispy paneer patty with fresh vegetables.",
    special: true,
  },
  {
    emoji: "🍝",
    name: "White Sauce Pasta",
    category: "Pasta",
    price: 179,
    description: "Creamy pasta prepared with white sauce.",
    special: true,
  },
  {
    emoji: "🍝",
    name: "Red Sauce Pasta",
    category: "Pasta",
    price: 169,
    description: "Pasta tossed in a delicious tomato sauce.",
    special: false,
  },
  {
    emoji: "🥟",
    name: "Steamed Veg Momos",
    category: "Momos",
    price: 119,
    description: "Soft steamed momos with fresh vegetable filling.",
    special: false,
  },
  {
    emoji: "🥟",
    name: "Cheese Momos",
    category: "Momos",
    price: 159,
    description: "Delicious momos filled with cheese.",
    special: true,
  },
  {
    emoji: "🍟",
    name: "Classic Fries",
    category: "Fries",
    price: 89,
    description: "Crispy golden potato fries.",
    special: false,
  },
  {
    emoji: "🍟",
    name: "Peri Peri Fries",
    category: "Fries",
    price: 109,
    description: "Crispy fries with spicy peri peri seasoning.",
    special: false,
  },
];

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* Navbar */}
      <nav className="flex items-center justify-between bg-white px-8 py-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-orange-600">
            PratyaBites
          </h1>
          <p className="text-xs text-gray-500">
            Pratya&apos;s Promise, Every Bite.
          </p>
        </div>

        <div className="hidden gap-8 md:flex">
          <a href="/" className="hover:text-orange-600">
            Home
          </a>

          <a href="/menu" className="font-semibold text-orange-600">
            Menu
          </a>

          <a href="#" className="hover:text-orange-600">
            Offers
          </a>

          <a href="#" className="hover:text-orange-600">
            About
          </a>

          <a href="#" className="hover:text-orange-600">
            Contact
          </a>
        </div>

        <div className="flex items-center gap-4">
          <button>🛒 Cart</button>

          <button className="rounded-full bg-orange-600 px-5 py-2 text-white">
            Login
          </button>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-orange-50 px-8 py-16 text-center">
        <p className="font-semibold text-orange-600">
          🌱 100% Pure Vegetarian
        </p>

        <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">
          Our Menu
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-gray-600">
          Fresh, delicious vegetarian fast food made with care.
        </p>
      </section>

      {/* Categories */}
      <section className="px-8 py-8">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto pb-2">
          {categories.map((category, index) => (
            <button
              key={category}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 font-medium ${
                index === 0
                  ? "bg-orange-600 text-white"
                  : "bg-white text-gray-700 shadow-sm hover:bg-orange-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Food */}
      <section className="px-8 pb-20">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <h2 className="text-2xl font-bold">
              All Items
            </h2>

            <p className="text-sm text-gray-500">
              Choose your favourite food.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {foods.map((food) => (
              <div
                key={food.name}
                className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                {/* Food Image Placeholder */}
                <div className="relative flex h-48 items-center justify-center bg-orange-100 text-7xl">
                  {food.emoji}

                  {food.special && (
                    <span className="absolute left-3 top-3 rounded-full bg-orange-600 px-3 py-1 text-xs font-semibold text-white">
                      ⭐ Special
                    </span>
                  )}
                </div>

                {/* Food Information */}
                <div className="p-5">

                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold">
                      {food.name}
                    </h3>

                    <span className="font-bold text-orange-600">
                      ₹{food.price}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    {food.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm">
                      ⭐ 4.8
                    </span>

                    <button className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
                      Add to Cart
                    </button>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 px-8 py-10 text-center text-white">
        <h2 className="text-2xl font-bold text-orange-500">
          PratyaBites
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Pratya&apos;s Promise, Every Bite.
        </p>

        <p className="mt-6 text-sm text-gray-500">
          © 2026 PratyaBites. All rights reserved.
        </p>
      </footer>

    </main>
  );
}