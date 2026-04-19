package com.ims.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "code", length = 50)
    private String code;
    
    @Column(name = "category", length = 50)
    private String category;
    
    @Column(name = "unit", length = 20)
    private String unit;
    
    @Column(name = "purchase_price", precision = 10, scale = 2)
    private BigDecimal purchasePrice;
    
    @Column(name = "sale_price", precision = 10, scale = 2)
    private BigDecimal salePrice;
    
    @Column(name = "stock", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer stock = 0;
    
    @Column(name = "min_stock", columnDefinition = "INT DEFAULT 10")
    private Integer minStock = 10;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "create_time")
    private LocalDateTime createTime;
    
    @Column(name = "update_time")
    private LocalDateTime updateTime;
    
    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
}