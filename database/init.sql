-- 进销存管理系统数据库初始化脚本
-- 创建数据库和表结构

-- 创建数据库
CREATE DATABASE IF NOT EXISTS item_management 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE item_management;

-- 商品表
CREATE TABLE IF NOT EXISTS product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '商品名称',
    code VARCHAR(50) COMMENT '商品编码',
    category VARCHAR(50) COMMENT '商品分类',
    unit VARCHAR(20) DEFAULT '个' COMMENT '单位',
    purchase_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '进货价',
    sale_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '销售价',
    stock INT DEFAULT 0 COMMENT '库存数量',
    min_stock INT DEFAULT 10 COMMENT '最低库存预警线',
    description VARCHAR(500) COMMENT '商品描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_code (code),
    KEY idx_name (name),
    KEY idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 销售订单表
CREATE TABLE IF NOT EXISTS sale_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL COMMENT '订单编号',
    customer_name VARCHAR(100) COMMENT '客户姓名',
    customer_phone VARCHAR(20) COMMENT '客户电话',
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '订单总金额',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_order_no (order_no),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售订单表';

-- 销售订单明细表
CREATE TABLE IF NOT EXISTS sale_order_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL COMMENT '订单ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    product_name VARCHAR(100) NOT NULL COMMENT '商品名称',
    quantity INT NOT NULL COMMENT '购买数量',
    price DECIMAL(10,2) NOT NULL COMMENT '销售单价',
    amount DECIMAL(12,2) NOT NULL COMMENT '小计金额',
    KEY idx_order_id (order_id),
    KEY idx_product_id (product_id),
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES sale_order(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES product(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售订单明细表';

-- 插入示例数据
-- 示例商品数据
INSERT INTO product (name, code, category, unit, purchase_price, sale_price, stock, min_stock, description) VALUES
('可口可乐 330ml', 'CC001', '饮料', '罐', 2.50, 3.50, 50, 10, '罐装可口可乐饮料'),
('农夫山泉 550ml', 'FS001', '饮料', '瓶', 1.50, 2.00, 120, 20, '瓶装农夫山泉矿泉水'),
('康师傅红烧牛肉面', 'KS001', '方便面', '袋', 3.00, 4.50, 8, 10, '康师傅经典红烧牛肉面'),
('奥利奥饼干 97g', 'AL001', '零食', '盒', 8.00, 12.00, 15, 5, '奥利奥原味夹心饼干'),
('飘柔洗发水 400ml', 'PR001', '洗护', '瓶', 25.00, 39.90, 5, 8, '飘柔日常护理洗发水'),
('六神花露水 195ml', 'LS001', '洗护', '瓶', 12.00, 18.50, 3, 5, '六神经典花露水'),
('得力中性笔 0.5mm', 'DL001', '文具', '支', 1.20, 2.00, 200, 50, '得力黑色中性笔'),
('晨光笔记本 A5', 'CG001', '文具', '本', 3.50, 6.00, 3, 10, '晨光A5记事本');

-- 示例订单数据
-- 订单1
INSERT INTO sale_order (order_no, customer_name, customer_phone, total_amount, remark, create_time) VALUES
('SO20260419000001', '张三', '13800138000', 14.00, '老客户优惠', DATE_SUB(NOW(), INTERVAL 2 HOUR));

SET @order_id = LAST_INSERT_ID();

INSERT INTO sale_order_item (order_id, product_id, product_name, quantity, price, amount) VALUES
(@order_id, 1, '可口可乐 330ml', 2, 3.50, 7.00),
(@order_id, 2, '农夫山泉 550ml', 3, 2.00, 6.00),
(@order_id, 4, '奥利奥饼干 97g', 1, 12.00, 12.00);

-- 更新订单总金额（实际业务中会正确计算）
UPDATE sale_order SET total_amount = 25.00 WHERE id = @order_id;

-- 订单2
INSERT INTO sale_order (order_no, customer_name, customer_phone, total_amount, remark, create_time) VALUES
('SO20260419000002', '李四', '13900139000', 6.00, '', DATE_SUB(NOW(), INTERVAL 1 HOUR));

SET @order_id = LAST_INSERT_ID();

INSERT INTO sale_order_item (order_id, product_id, product_name, quantity, price, amount) VALUES
(@order_id, 3, '康师傅红烧牛肉面', 2, 4.50, 9.00),
(@order_id, 2, '农夫山泉 550ml', 1, 2.00, 2.00);

UPDATE sale_order SET total_amount = 11.00 WHERE id = @order_id;