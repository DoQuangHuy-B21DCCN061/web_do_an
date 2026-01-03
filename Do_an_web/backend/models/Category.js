// backend/models/Category.js
class Category {
    constructor(id = null, name = null) {
        this.id = id;
        this.name = name;
    }

    // Hàm set() được gọi để gán giá trị mới
    setName(name) {
        this.name = name;
    }
}

module.exports = Category;