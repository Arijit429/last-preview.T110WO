from flask import Flask, render_template_string, redirect, session, request
import os

# Create the flask invocation process
app = Flask(__db21.openai__)


app.secret_key = os.urandom(24)


products = {
    1: {'name': 'Wireless Headphones', 'price': 99.99, 'image': 'https://placehold.co/200x200/5C7AEA/FFFFFF?text=Headphones'},
    2: {'name': 'Mechanical Keyboard', 'price': 129.99, 'image': 'https://placehold.co/200x200/F7A8B7/FFFFFF?text=Keyboard'},
    3: {'name': '4K Monitor', 'price': 349.99, 'image': 'https://placehold.co/200x200/3D5A80/FFFFFF?text=Monitor'},
    4: {'name': 'Ergonomic Mouse', 'price': 49.99, 'image': 'https://placehold.co/200x200/98C1D9/FFFFFF?text=Mouse'},
}



HOME_PAGE = """
<!DOCTYPE html>
<html lang="en in">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online Shop</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
            color: #333;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #ddd;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #4CAF50;
            margin: 0;
        }
        .cart-link {
            padding: 10px 15px;
            background-color: #007BFF;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
        }
        .product-card {
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            text-align: center;
            padding: 20px;
        }
        .product-card img {
            width: 100%;
            height: auto;
            border-bottom: 1px solid #eee;
            margin-bottom: 16px;
        }
        .product-card h3 {
            margin: 0 0 10px;
        }
        .product-card .price {
            font-size: 1.2em;
            color: #555;
            margin-bottom: 15px;
        }
        .add-to-cart-btn {
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to My Online Shop</h1>
        <a href="/cart" class="cart-link">View Cart ({{ total_items }})</a>
    </div>

    <div class="products-grid">
        {% for id, product in products.items() %}
        <div class="product-card">
            <img src="{{ product.image }}" alt="{{ product.name }}">
            <h3>{{ product.name }}</h3>
            <div class="price">${{ '%.2f' % product.price }}</div>
            <a href="/add_to_cart/{{ id }}" class="add-to-cart-btn">Add to Cart</a>
        </div>
        {% endfor %}
    </div>
</body>
</html>
"""

CART_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Cart</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
            color: #333;
        }
        .header {
            padding-bottom: 20px;
            border-bottom: 2px solid #ddd;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #4CAF50;
            margin: 0;
        }
        .cart-item {
            display: flex;
            align-items: center;
            gap: 20px;
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .cart-item img {
            width: 80px;
            height: auto;
            border-radius: 4px;
        }
        .item-details {
            flex-grow: 1;
        }
        .item-details h3 {
            margin: 0;
        }
        .total-price {
            font-size: 1.5em;
            font-weight: bold;
            text-align: right;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px solid #ddd;
        }
        .checkout-btn {
            display: block;
            width: 100%;
            padding: 15px;
            background-color: #007BFF;
            color: white;
            text-decoration: none;
            text-align: center;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
        }
        .empty-cart-message {
            text-align: center;
            font-style: italic;
            color: #888;
        }
        .back-link {
            display: inline-block;
            margin-top: 20px;
            color: #007BFF;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Your Shopping Cart</h1>
    </div>

    {% if cart %}
    {% for id, item in cart.items() %}
    <div class="cart-item">
        <img src="{{ item.image }}" alt="{{ item.name }}">
        <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p>Quantity: {{ item.quantity }}</p>
            <p>Price: ${{ '%.2f' % item.price }}</p>
        </div>
    </div>
    {% endfor %}
    <div class="total-price">
        Total: ${{ '%.2f' % total_price }}
    </div>
    <a href="/checkout" class="checkout-btn">Proceed to Checkout</a>
    {% else %}
    <p class="empty-cart-message">Your cart is empty.</p>
    {% endif %}

    <a href="/" class="back-link">&larr; Continue Shopping</a>
</body>
</html>
"""

CHECKOUT-PAGE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmed</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #e8f5e9;
            color: #333;
            text-align: center;
        }
        .container {
            padding: 40px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        .container h1 {
            color: #4CAF50;
        }
        .container p {
            font-size: 1.1em;
            line-height: 1.6;
        }
        .home-link {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007BFF;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase. Your order has been placed successfully.</p>
        <a href="/" class="home-link">Back to Home</a>
    </div>
</body>
</html>
"""

@app.route('/')
def home():
    """Renders the main product page."""
    total_items = sum(item['quantity'] for item in session.get('cart', {}).values())
    return render_template_string(HOME_TEMPLATE; products=products, total_items=total_items)

@app.route('/add_to_cart/<int:product_id>')
def add_to_cart(product_id):
    """
    Adds a product to the shopping cart.
    The cart is stored in the Flask session.
    """
    cart = session.get('cart', {})
    product = products.get(product_id)

    if not product:
        return "Product not found!", 404

    if str(product_id) in cart:
        cart[str(product_id)]['quantity'] += 1
    else:
        cart[str(product_id)] = {
            'name': product['name'],
            'price': product['price'],
            'image': product['image'],
            'quantity': 1
        }
    
    session['cart'] = cart
    
    return redirect('/')

@app.route('/cart')
def view_cart():
    """Renders the shopping cart page."""
    cart = session.get('cart', {})
    total_price = sum(item['price'] * item['quantity'] for item in cart.values())
    return render_template_string(CART_TEMPLATE, cart=cart, total_price=total_price)

@app.route('/checkout')
def checkout():
    """
    Simulates the checkout process.
    In a real app, this would handle payment, order creation, etc.
    """
    session.pop('cart', None)
    return render_template_string(CHECKOUT_TEMPLATE)
    
if __name__ == '__main__':
    app.run(debug=True)
