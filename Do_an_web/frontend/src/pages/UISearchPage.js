import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import '../assets/css/UIMainPage.css';

const UISearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('query');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:5000/api/products/search?q=${query}`);
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error("Lỗi tìm kiếm:", err);
            } finally {
                setLoading(false);
            }
        };

        if (query) fetchSearchResults();
    }, [query]);

    // HÀM XỬ LÝ "MUA NGAY" (Tương tự trang chủ)
    const handleAddToCart = async (product) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const productId = product.id.trim();

        if (user && user.id) {
            try {
                await fetch('http://localhost:5000/api/cart/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, productId: productId, quantity: 1 })
                });
                alert(`Đã thêm ${product.name} vào giỏ hàng!`);
            } catch (err) { console.error(err); }
        } else {
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
            <Header initialSearchTerm={query} />
            <div className="content-layout" style={{ marginTop: '20px' }}>
                <main className="product-section" style={{ width: '100%' }}>
                    <div className="section-header">
                        <h2>Kết quả tìm kiếm cho: "{query}"</h2>
                    </div>

                    {loading ? (
                        <p>Đang tìm kiếm...</p>
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
                            )) : (
                                <p>Không tìm thấy sản phẩm nào khớp với "{query}".</p>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UISearchPage;