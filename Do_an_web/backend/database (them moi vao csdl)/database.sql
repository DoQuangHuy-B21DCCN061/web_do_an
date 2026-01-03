cấu trúc db như sau -- 1. Tạo Database

CREATE db_do_an;

GO

USE db_do_an;

GO



-- 2. Bảng tbl_users

CREATE TABLE tbl_users (

    id CHAR(10) PRIMARY KEY,

    username CHAR(50) NOT NULL,

    password_hash CHAR(256) NOT NULL,

    role NVARCHAR(100),

    name NVARCHAR(50),

    phone CHAR(12),

    email CHAR(100),

    address NVARCHAR(250),

    points INT DEFAULT 0,

    status BIT DEFAULT 1

);



-- 3. Bảng tbl_products

CREATE TABLE tbl_products (

    id CHAR(50) PRIMARY KEY,

    name NVARCHAR(100) NOT NULL,

    sell_price FLOAT,

    quantityInStock INT,

    newest_import_price FLOAT,

    description NVARCHAR(MAX),

    image_url VARCHAR(255)

);



-- 4. Bảng tbl_categories

CREATE TABLE tbl_categories (

    id CHAR(10) PRIMARY KEY,

    name NVARCHAR(50) NOT NULL

);



-- 5. Bảng tbl_suppliers

CREATE TABLE tbl_suppliers (

    id CHAR(10) PRIMARY KEY,

    name NVARCHAR(100) NOT NULL,

    phone CHAR(50),

    email CHAR(100),

    address NVARCHAR(250)

);



-- 6. Bảng tbl_orders

CREATE TABLE tbl_orders (

    id CHAR(10) PRIMARY KEY,

    order_date DATE,

    used_points INT,

    receiver_name NVARCHAR(30),

    receiver_address NVARCHAR(100),

    receiver_phone CHAR(12),

    payment_method NVARCHAR(11),

    status NVARCHAR(30),

    userid CHAR(10),

    CONSTRAINT FK_Orders_Users FOREIGN KEY (userid) REFERENCES tbl_users(id)

);



-- 7. Bảng tbl_bills

CREATE TABLE tbl_bills (

    id CHAR(10) PRIMARY KEY,

    bill_date DATE,

    total_amount INT,

    total_price FLOAT,

    usersid CHAR(10),

    ordersid CHAR(10),

    CONSTRAINT FK_Bills_Users FOREIGN KEY (usersid) REFERENCES tbl_users(id),

    CONSTRAINT FK_Bills_Orders FOREIGN KEY (ordersid) REFERENCES tbl_orders(id)

);



-- 8. Bảng tbl_carts

CREATE TABLE tbl_carts (

    id CHAR(10) PRIMARY KEY,

    usersid CHAR(10),

    CONSTRAINT FK_Carts_Users FOREIGN KEY (usersid) REFERENCES tbl_users(id)

);



-- 9. Bảng tbl_cartitems

CREATE TABLE tbl_cartitems (

    id CHAR(10) PRIMARY KEY,

    quantity INT,

    total_price FLOAT,

    productsid CHAR(50),

    cartsid CHAR(10),

    CONSTRAINT FK_CartItems_Products FOREIGN KEY (productsid) REFERENCES tbl_products(id),

    CONSTRAINT FK_CartItems_Carts FOREIGN KEY (cartsid) REFERENCES tbl_carts(id)

);



-- 10. Bảng tbl_orderdetails

CREATE TABLE tbl_orderdetails (

    id CHAR(10) PRIMARY KEY,

    quantity INT,

    price FLOAT,

    productsid CHAR(50),

    ordersid CHAR(10),

    CONSTRAINT FK_OrderDetails_Products FOREIGN KEY (productsid) REFERENCES tbl_products(id),

    CONSTRAINT FK_OrderDetails_Orders FOREIGN KEY (ordersid) REFERENCES tbl_orders(id)

);



-- 11. Bảng tbl_productreviews

CREATE TABLE tbl_productreviews (

    id CHAR(10) PRIMARY KEY,

    rating INT,

    comment NVARCHAR(1000),

    created_at DATE,

    productsid CHAR(50),

    usersid CHAR(10),

    tbl_orderdetailsid CHAR(10),
CONSTRAINT FK_Reviews_Products FOREIGN KEY (productsid) REFERENCES tbl_products(id),

    CONSTRAINT FK_Reviews_Users FOREIGN KEY (usersid) REFERENCES tbl_users(id),

    CONSTRAINT FK_Reviews_OrderDetails FOREIGN KEY (tbl_orderdetailsid) REFERENCES tbl_orderdetails(id)

);



-- 12. Bảng tbl_product_categories (Bảng trung gian n-n)

CREATE TABLE tbl_product_categories (

    id CHAR(10) PRIMARY KEY,

    tbl_categoriesid CHAR(10),

    tbl_productsid CHAR(50),

    CONSTRAINT FK_ProdCat_Categories FOREIGN KEY (tbl_categoriesid) REFERENCES tbl_categories(id),

    CONSTRAINT FK_ProdCat_Products FOREIGN KEY (tbl_productsid) REFERENCES tbl_products(id)

);



-- 13. Bảng tbl_import_products

CREATE TABLE tbl_import_products (

    id CHAR(10) PRIMARY KEY,

    import_date DATE,

    import_price FLOAT,

    quantity INT,

    tbl_suppliersid CHAR(10),

    tbl_productsid CHAR(50),

    CONSTRAINT FK_Import_Suppliers FOREIGN KEY (tbl_suppliersid) REFERENCES tbl_suppliers(id),

    CONSTRAINT FK_Import_Products FOREIGN KEY (tbl_productsid) REFERENCES tbl_products(id)

);