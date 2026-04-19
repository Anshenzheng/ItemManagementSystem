package com.ims.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "sale_order")
public class SaleOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_no", nullable = false, length = 50, unique = true)
    private String orderNo;
    
    @Column(name = "customer_name", length = 100)
    private String customerName;
    
    @Column(name = "customer_phone", length = 20)
    private String customerPhone;
    
    @Column(name = "total_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalAmount;
    
    @Column(name = "remark", length = 500)
    private String remark;
    
    @Column(name = "create_time")
    private LocalDateTime createTime;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleOrderItem> items = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
    }
    
    public void addItem(SaleOrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}