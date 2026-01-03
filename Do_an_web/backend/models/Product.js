// backend/models/Product.js
class Product {
    constructor(id = null, name = null, sell_price = 0, quantityInStock = 0,
        newest_import_price = 0, description = null, image_url = null) {
        this.id = id;
        this.name = name;
        this.sell_price = sell_price;
        this.quantityInStock = quantityInStock;
        this.newest_import_price = newest_import_price;
        this.description = description;
        this.image_url = image_url;
    }

    // Các hàm set() để gán các giá trị mới
    setName(name) { this.name = name; }
    setPrice(price) { this.sell_price = price; }
    setQuantity(qty) { this.quantityInStock = qty; }
    setDescription(desc) { this.description = desc; }
    setImage(url) { this.image_url = url; }
}

module.exports = Product;