
var prices = {
    none: 0,
    sandwich: 100,
    burger: 180,
    fries: 180,
    icecream: 150
};

var names = {
    sandwich: "Sandwich",
    burger: "Burger",
    fries: "French Fries",
    icecream: "Ice Cream"
};

function calculate() {
    var food = document.getElementById("foodItem").value;
    var qty = document.getElementById("quantity").value;

    var subtotal = prices[food] * qty;
    var delivery = 0;

    if (subtotal == 0) {
        delivery = 0;
    } else if (subtotal > 499) {
        delivery = 0;   // free delivery
    } else {
        delivery = 30;
    }

    var total = subtotal + delivery;

    document.getElementById("subtotal").innerHTML = subtotal;
    document.getElementById("delivery").innerHTML = delivery;
    document.getElementById("total").innerHTML = total;
}

function placeOrder() {
    var name = document.getElementById("customerName").value;
    var phone = document.getElementById("phone").value;
    var address = document.getElementById("address").value;
    var food = document.getElementById("foodItem").value;
    var qty = document.getElementById("quantity").value;
    var total = document.getElementById("total").innerHTML;

    if (name == "" || phone == "" || address == "") {
        alert("Please fill all your details!");
        return;
    }

    if (food == "none") {
        alert("Please select a food item!");
        return;
    }

    if (phone.length != 10) {
        alert("Phone number should be 10 digits");
        return;
    }

    document.getElementById("message").innerHTML =
        "Thank you " + name + "! Your order of " + qty + " x " + names[food] +
        " is confirmed. Total = Rs." + total + ". It will reach " + address + " soon.";
}