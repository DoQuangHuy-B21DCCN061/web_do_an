import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import '../assets/css/UIMainPage.css';

const UIMainPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState({ min: null, max: null, label: 'Tất cả' });
    const [loading, setLoading] = useState(true);

    const priceRanges = [
        { label: 'Tất cả', min: null, max: null },
        { label: 'Dưới 100k', min: 0, max: 100000 },
        { label: '100k - 500k', min: 100000, max: 500000 },
        { label: '500k - 1 triệu', min: 500000, max: 1000000 },
        { label: '1 triệu - 2 triệu', min: 1000000, max: 2000000 },
        { label: 'Trên 2 triệu', min: 2000000, max: null },
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/categories?page=1&limit=1000');
            const data = await response.json();
            // API trả về { categories: [...], total: ... }
            if (data.categories && Array.isArray(data.categories)) {
                setCategories(data.categories);
            } else if (Array.isArray(data)) {
                // Fallback: nếu API trả về mảng trực tiếp (tương thích ngược)
                setCategories(data);
            } else {
                setCategories([]);
            }
        } catch (error) { console.error("Lỗi:", error); }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let url = new URL('http://localhost:5000/api/products');
            // Thêm pagination để lấy tất cả sản phẩm
            url.searchParams.append('page', '1');
            url.searchParams.append('limit', '1000');
            if (selectedCategory) url.searchParams.append('categoryId', selectedCategory);
            if (selectedPrice.min !== null) url.searchParams.append('minPrice', selectedPrice.min);
            if (selectedPrice.max !== null) url.searchParams.append('maxPrice', selectedPrice.max);

            const response = await fetch(url);
            const data = await response.json();
            // API trả về { products: [...], total: ... }
            if (data.products && Array.isArray(data.products)) {
                setProducts(data.products);
            } else if (Array.isArray(data)) {
                // Fallback: nếu API trả về mảng trực tiếp (tương thích ngược)
                setProducts(data);
            } else {
                setProducts([]);
            }
        } catch (error) { console.error("Lỗi:", error); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, selectedPrice]);

    // HÀM XỬ LÝ "MUA NGAY"
    const handleAddToCart = async (product) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const productId = product.id.trim();

        if (user && user.id) {
            // Trường hợp khách đã đăng nhập
            try {
                await fetch('http://localhost:5000/api/cart/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        productId: productId,
                        quantity: 1
                    })
                });
                alert(`Đã thêm ${product.name} vào giỏ hàng!`);
            } catch (err) { console.error(err); }
        } else {
            // Trường hợp khách vãng lai
            let cart = JSON.parse(localStorage.getItem('temp_cart')) || [];
            const index = cart.findIndex(item => item.id === productId);
            if (index > -1) {
                cart[index].quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name: product.name,
                    price: product.sell_price,
                    quantity: 1,
                    image: product.image_url
                });
            }
            localStorage.setItem('temp_cart', JSON.stringify(cart));
            alert(`Đã thêm ${product.name} vào giỏ hàng tạm thời!`);
        }
    };

    return (
        <div className="main-container">
            <Header onResetFilter={() => setSelectedCategory(null)} />

            <div className="category-bar">
                <div
                    className={`category-item ${selectedCategory === null ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    🌟 Tất cả
                </div>
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className={`category-item ${selectedCategory === cat.id.trim() ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id.trim())}
                    >
                        📦 {cat.name}
                    </div>
                ))}
            </div>

            <div className="content-layout">
                <aside className="sidebar">
                    <h3>Bộ lọc</h3>
                    <div className="filter-group">
                        <p style={{ fontWeight: 'bold' }}>Khoảng giá</p>
                        {priceRanges.map((range, index) => (
                            <label key={index} className="filter-label">
                                <input
                                    type="radio"
                                    name="price-filter"
                                    checked={selectedPrice.label === range.label}
                                    onChange={() => setSelectedPrice(range)}
                                /> {range.label}
                            </label>
                        ))}
                    </div>
                </aside>

                <main className="product-section">
                    <div className="section-header">
                        <h2>
                            {selectedCategory
                                ? categories.find(c => c.id.trim() === selectedCategory)?.name
                                : "Sản phẩm nổi bật"}
                        </h2>
                    </div>

                    {loading ? (
                        <p>Đang tải dữ liệu...</p>
                    ) : (
                        <div className="product-grid">
                            {products.length > 0 ? products.map(product => (
                                <div key={product.id} className="product-card">
                                    <Link to={`/product/${product.id.trim()}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="product-img-wrapper">
                                            <img src={product.image_url || 'https://via.placeholder.com/150'} alt={product.name} />
                                        </div>
                                        <p className="p-name">{product.name}</p>
                                    </Link>
                                    <p className="p-price">
                                        {new Intl.NumberFormat('vi-VN').format(product.sell_price)} đ
                                    </p>
                                    <button className="buy-now" onClick={() => handleAddToCart(product)}>Mua ngay</button>
                                </div>
                            )) : <p>Không có sản phẩm nào phù hợp.</p>}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UIMainPage;