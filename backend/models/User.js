class User {
    constructor(id = null, username = null, role = null, name = null, phone = null, address = null, password_hash = null) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.password_hash = password_hash;
    }

    setName(name) { this.name = name; }
    setPosition(role) { this.role = role; }
    setPhone(phone) { this.phone = phone; }    // Đã bổ sung
    setAddress(address) { this.address = address; } // Đã bổ sung
    setPassword(password) { this.password_hash = password; }
}

module.exports = User;