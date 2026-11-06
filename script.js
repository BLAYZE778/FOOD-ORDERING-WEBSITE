// ---------- data ----------
const FREE_ABOVE = 499;
const DELIVERY_FEE = 30;

const menu = [
  { id: "sandwich", name: "Sandwich",       price: 100, cat: "Mains",    icon: "🥪", desc: "Toasted, loaded with veggies and cheese." },
  { id: "burger",   name: "Burger",         price: 180, cat: "Mains",    icon: "🍔", desc: "Crispy patty, fresh lettuce and house sauce." },
  { id: "pizza",    name: "Margherita Pizza", price: 249, cat: "Mains",  icon: "🍕", desc: "Stretchy mozzarella on a thin base." },
  { id: "pasta",    name: "White Sauce Pasta", price: 199, cat: "Mains", icon: "🍝", desc: "Creamy, garlicky and ready in minutes." },
  { id: "fries",    name: "French Fries",   price: 180, cat: "Sides",    icon: "🍟", desc: "Golden and salted just right." },
  { id: "icecream", name: "Ice Cream",      price: 150, cat: "Desserts", icon: "🍨", desc: "Two scoops of vanilla or chocolate." },
  { id: "brownie",  name: "Chocolate Brownie", price: 99, cat: "Desserts", icon: "🍫", desc: "Warm, fudgy and a little gooey." },
  { id: "coffee",   name: "Cold Coffee",    price: 120, cat: "Drinks",   icon: "🥤", desc: "Thick, chilled and lightly sweet." }
];

let cart = {};   // { itemId: quantity }
try { cart = JSON.parse(localStorage.getItem("yw_cart")) || {}; } catch (e) { cart = {}; }

// ---------- helpers ----------
const $ = (id) => document.getElementById(id);
const rupee = (n) => "₹" + n;

function totals() {
  let subtotal = 0;
  for (const id in cart) {
    const item = menu.find((m) => m.id === id);
    if (item) subtotal += item.price * cart[id];
  }
  const delivery = subtotal === 0 ? 0 : subtotal > FREE_ABOVE ? 0 : DELIVERY_FEE;
  return { subtotal, delivery, total: subtotal + delivery };
}

function save() {
  try { localStorage.setItem("yw_cart", JSON.stringify(cart)); } catch (e) {}
}

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

// ---------- menu ----------
function renderMenu(cat = "all") {
  const list = cat === "all" ? menu : menu.filter((m) => m.cat === cat);
  $("menuGrid").innerHTML = list.map((m) => `
    <article class="card">
      <div class="pic"><span>${m.icon}</span></div>
      <h3>${m.name}</h3>
      <p class="desc">${m.desc}</p>
      <div class="bottom">
        <span class="price">${rupee(m.price)}</span>
        <button class="add" data-id="${m.id}">Add to cart</button>
      </div>
    </article>`).join("");
}

$("filters").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  renderMenu(chip.dataset.cat);
});

$("menuGrid").addEventListener("click", (e) => {
  const btn = e.target.closest(".add");
  if (!btn) return;
  const id = btn.dataset.id;
  cart[id] = (cart[id] || 0) + 1;
  const item = menu.find((m) => m.id === id);
  toast(item.name + " added to cart");
  const cb = $("openCart");
  cb.classList.remove("bump");
  void cb.offsetWidth;
  cb.classList.add("bump");
  updateCart();
});

// ---------- cart ----------
function updateCart() {
  save();
  const { subtotal, delivery, total } = totals();
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  $("cartCount").textContent = count;

  const box = $("cartItems");
  if (count === 0) {
    box.innerHTML = '<p class="empty">Your cart is empty. Add something tasty from the menu.</p>';
  } else {
    box.innerHTML = Object.keys(cart).map((id) => {
      const m = menu.find((x) => x.id === id);
      return `
        <div class="item">
          <div class="ic">${m.icon}</div>
          <div><b>${m.name}</b><small>${rupee(m.price)} each</small></div>
          <div class="qty">
            <button data-act="minus" data-id="${id}" aria-label="Remove one">−</button>
            <span>${cart[id]}</span>
            <button data-act="plus" data-id="${id}" aria-label="Add one">+</button>
          </div>
        </div>`;
    }).join("");
  }

  $("dSub").textContent = rupee(subtotal);
  $("dDel").textContent = delivery === 0 && subtotal > 0 ? "Free" : rupee(delivery);
  $("dTot").textContent = rupee(total);

  // free delivery progress
  const pct = Math.min(100, (subtotal / (FREE_ABOVE + 1)) * 100);
  $("bar").style.width = pct + "%";
  if (subtotal === 0) {
    $("progressText").textContent = "Spend over ₹" + FREE_ABOVE + " for free delivery.";
  } else if (subtotal > FREE_ABOVE) {
    $("progressText").textContent = "You unlocked free delivery!";
  } else {
    $("progressText").textContent = "Add " + rupee(FREE_ABOVE + 1 - subtotal) + " more for free delivery.";
  }

  // checkout summary
  $("summaryBox").innerHTML = count === 0
    ? "<p>Your cart is empty. Add items from the menu first.</p>"
    : Object.keys(cart).map((id) => {
        const m = menu.find((x) => x.id === id);
        return `<div class="row"><span>${m.icon} ${m.name} × ${cart[id]}</span><span>${rupee(m.price * cart[id])}</span></div>`;
      }).join("") +
      `<div class="row"><span>Delivery</span><span>${delivery === 0 ? "Free" : rupee(delivery)}</span></div>
       <div class="row total"><span>Total</span><span>${rupee(total)}</span></div>`;
}

$("cartItems").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const id = b.dataset.id;
  if (b.dataset.act === "plus") cart[id]++;
  if (b.dataset.act === "minus") {
    cart[id]--;
    if (cart[id] <= 0) delete cart[id];
  }
  updateCart();
});

// drawer open/close
function openDrawer(open) {
  $("drawer").classList.toggle("open", open);
  $("overlay").classList.toggle("show", open);
}
$("openCart").onclick = () => openDrawer(true);
$("closeCart").onclick = () => openDrawer(false);
$("overlay").onclick = () => openDrawer(false);
$("toCheckout").onclick = () => openDrawer(false);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { openDrawer(false); $("modal").classList.remove("show"); }
});

// ---------- checkout ----------
function setError(inputId, msg) {
  const field = $(inputId).closest(".field");
  field.classList.toggle("bad", !!msg);
  field.querySelector(".err").textContent = msg;
  return !msg;
}

$("orderForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("name").value.trim();
  const phone = $("phone").value.trim();
  const address = $("address").value.trim();

  let ok = true;
  ok = setError("name", name ? "" : "Enter your name.") && ok;
  ok = setError("phone", /^\d{10}$/.test(phone) ? "" : "Enter a 10 digit phone number.") && ok;
  ok = setError("address", address.length >= 8 ? "" : "Enter your full delivery address.") && ok;

  if (Object.keys(cart).length === 0) {
    toast("Your cart is empty.");
    ok = false;
  }
  if (!ok) return;

  const pay = document.querySelector('input[name="pay"]:checked').value;
  const { total } = totals();
  $("modalText").textContent =
    "Thanks " + name + "! Your order of " + rupee(total) + " (" + pay + ") will reach " + address + " in about 30 minutes.";
  $("modal").classList.add("show");

  cart = {};
  $("orderForm").reset();
  updateCart();
});

$("closeModal").onclick = () => $("modal").classList.remove("show");
$("modal").addEventListener("click", (e) => {
  if (e.target === $("modal")) $("modal").classList.remove("show");
});

// ---------- start ----------
renderMenu();
updateCart();