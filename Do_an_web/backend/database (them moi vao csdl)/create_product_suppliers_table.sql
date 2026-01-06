-- Tạo bảng tbl_product_suppliers để quản lý quan hệ n-n giữa sản phẩm và nhà cung cấp
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tbl_product_suppliers' and xtype='U')
BEGIN
    CREATE TABLE tbl_product_suppliers (
        id CHAR(10) PRIMARY KEY,
        tbl_productsid CHAR(50) NOT NULL,
        tbl_suppliersid CHAR(10) NOT NULL,
        CONSTRAINT FK_ProdSupp_Products FOREIGN KEY (tbl_productsid) REFERENCES tbl_products(id) ON DELETE CASCADE,
        CONSTRAINT FK_ProdSupp_Suppliers FOREIGN KEY (tbl_suppliersid) REFERENCES tbl_suppliers(id) ON DELETE CASCADE
    );
END
GO

