package com.ims.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "sale_order_item")
public class SaleOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private SaleOrder order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "product_name", length = 100, nullable = false)
    private String productName;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Column(name = "price", precision = 10, scale = 2, nullable = false)
    private BigDecimal price;
    
    @Column(name = "amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;
}