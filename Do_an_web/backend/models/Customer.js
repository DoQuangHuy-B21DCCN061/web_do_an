// backend/models/Customer.js
class Customer {
    constructor(id = null, username = null, name = null, phone = null,
        email = null, address = null, points = 0, status = 1) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.points = points;
        this.status = status; // Trạng thái tài khoản
    }

    setName(name) { this.name = name; }
    setPhone(phone) { this.phone = phone; }
    setEmail(email) { this.email = email; }
    setAddress(address) { this.address = address; }
    setPoints(points) { this.points = points; }
    setStatus(status) { this.status = status; } // Gán giá trị trạng thái mới
}
module.exports = Customer;