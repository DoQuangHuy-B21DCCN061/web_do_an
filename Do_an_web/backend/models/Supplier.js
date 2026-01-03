// backend/models/Supplier.js
class Supplier {
    constructor(id = null, name = null, phone = null, address = null, email = null) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.email = email;
    }

    // Các hàm set() được gọi để gán các giá trị mới
    setName(name) { this.name = name; }
    setPhone(phone) { this.phone = phone; }
    setAddress(address) { this.address = address; }
    setEmail(email) { this.email = email; }
}

module.exports = Supplier;