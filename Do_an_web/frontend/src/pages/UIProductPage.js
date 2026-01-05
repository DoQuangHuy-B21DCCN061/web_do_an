import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FiShoppingCart, FiStar, FiCheckCircle, FiAward, FiChevronRight } from 'react-icons/fi';
import '../assets/css/UIProductPage.css';

const UIProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const formatVND = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const fetchProductDetail = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`);
            const data = await response.json();
            setProduct(data);
        } catch (err) {
            console.error("Lỗi lấy chi tiết sản phẩm:", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProductDetail();
    }, [fetchProductDetail]);

    const handleAddToCart = async () => {
        const user = JSON.parse(localStorage.getItem('user'));

        if (user && user.id) {
            // Lưu vào Database cho khách đã đăng nhập
            await fetch('http://localhost:5000/api/cart/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    productId: product.id,
                    quantity: 1
                })
            });
        } else {
            // Lưu vào localStorage cho khách vãng lai
            let cart = JSON.parse(localStorage.getItem('temp_cart')) || [];
            const index = cart.findIndex(item => item.id === product.id);
            if (index > -1) {
                cart[index].quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.sell_price,
                    quantity: 1,
                    image: product.image_url
                });
            }
            localStorage.setItem('temp_cart', JSON.stringify(cart));
        }
        alert("Đã thêm sản phẩm vào giỏ hàng!");
    };

    if (loading) return <div className="loading-screen">Đang tải chi tiết sản phẩm...</div>;
    if (!product) return <div className="error-screen">Không tìm thấy sản phẩm.</div>;

    return (
        <div className="product-page-container">
            <Header />

            <div className="product-detail-content">
                {/* Phần trên: Hình ảnh và Thông tin mua hàng */}
                <div className="product-top-section">
                    <div className="product-image-viewer">
                        <img 
                            src={product.image_url ? `http://localhost:5000${product.image_url}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='} 
                            alt={product.name}
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                            }}
                        />
                    </div>

                    <div className="product-purchase-info">
                        <h1 className="product-title">{product.name}</h1>
                        <p className="product-meta">Kho: {product.quantityInStock} sản phẩm</p>
                        <h2 className="product-price-large">{formatVND(product.sell_price)}</h2>

                        <button className="add-to-cart-big" onClick={handleAddToCart}>
                            <FiShoppingCart /> Thêm vào giỏ hàng
                        </button>

                        <div className="product-badges">
                            <div className="badge-item">
                                <FiAward className="badge-icon gold" />
                                <span>Sản phẩm bán chạy nhất</span>
                                <FiChevronRight className="arrow-link" />
                            </div>
                            <div className="badge-item">
                                <FiCheckCircle className="badge-icon green" />
                                <span>Đảm bảo hài lòng 100%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phần dưới: Đánh giá khách hàng */}
                <div className="product-reviews-section">
                    <h3>Đánh giá từ khách hàng</h3>
                    <div className="reviews-summary">
                        <div className="rating-average">
                            <span className="avg-num">4.5</span>
                            <div className="stars">
                                <FiStar className="star-filled" /><FiStar className="star-filled" />
                                <FiStar className="star-filled" /><FiStar className="star-filled" />
                                <FiStar />
                            </div>
                            <p>(5391 đánh giá)</p>
                        </div>

                        <div className="rating-bars">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="bar-row">
                                    <span>{star} <FiStar /></span>
                                    <div className="progress-bg">
                                        <div className="progress-fill" style={{ width: `${star * 18}%` }}></div>
                                    </div>
                                    <span className="count">4.28K</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="individual-reviews">
                        <div className="review-card">
                            <div className="review-header">
                                <div className="stars-small">
                                    <FiStar /><FiStar /><FiStar /><FiStar /><FiStar />
                                </div>
                                <strong>Sự kết hợp hoàn hảo!!</strong>
                            </div>
                            <p className="review-text">
                                Sản phẩm rất tốt, bé nhà mình rất thích. Giao hàng nhanh và đóng gói cẩn thận.
                                Sẽ tiếp tục ủng hộ shop trong tương lai!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UIProductPage;