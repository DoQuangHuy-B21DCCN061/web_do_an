class Order {
    constructor(id = null, order_date = null, used_points = 0, receiver_name = null,
        receiver_address = null, receiver_phone = null, payment_method = null,
        status = 'Đang xử lý', usersid = null) {
        this.id = id;
        this.order_date = order_date;
        this.used_points = used_points;
        this.receiver_name = receiver_name;
        this.receiver_address = receiver_address;
        this.receiver_phone = receiver_phone;
        this.payment_method = payment_method;
        this.status = status;
        this.usersid = usersid;
    }

    setReceiverName(name) { this.receiver_name = name; }
    setReceiverAddress(addr) { this.receiver_address = addr; }
    setReceiverPhone(phone) { this.receiver_phone = phone; }
    setStatus(status) { this.status = status; }
}

module.exports = Order;