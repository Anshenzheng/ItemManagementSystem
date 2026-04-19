package com.ims.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderRequest {
    private String customerName;
    private String customerPhone;
    private String remark;
    private List<OrderItemRequest> items;
    
    @Data
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
        private BigDecimal price;
    }
}