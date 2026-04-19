package com.ims.controller;

import com.ims.dto.ApiResponse;
import com.ims.dto.CreateOrderRequest;
import com.ims.entity.SaleOrder;
import com.ims.service.SaleOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class SaleOrderController {
    
    @Autowired
    private SaleOrderService saleOrderService;
    
    @GetMapping
    public ApiResponse<List<SaleOrder>> getAllOrders() {
        return ApiResponse.success(saleOrderService.findAll());
    }
    
    @GetMapping("/range")
    public ApiResponse<List<SaleOrder>> getOrdersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ApiResponse.success(saleOrderService.findByDateRange(start, end));
    }
    
    @PostMapping
    public ApiResponse<SaleOrder> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            SaleOrder order = saleOrderService.createOrder(request);
            return ApiResponse.success(order, "订单创建成功");
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}