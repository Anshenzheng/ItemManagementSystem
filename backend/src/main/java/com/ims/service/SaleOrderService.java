package com.ims.service;

import com.ims.dto.CreateOrderRequest;
import com.ims.entity.Product;
import com.ims.entity.SaleOrder;
import com.ims.entity.SaleOrderItem;
import com.ims.repository.ProductRepository;
import com.ims.repository.SaleOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class SaleOrderService {
    
    @Autowired
    private SaleOrderRepository saleOrderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    public List<SaleOrder> findAll() {
        return saleOrderRepository.findAllByOrderByCreateTimeDesc();
    }
    
    public List<SaleOrder> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return saleOrderRepository.findByCreateTimeBetweenOrderByCreateTimeDesc(start, end);
    }
    
    public SaleOrder createOrder(CreateOrderRequest request) {
        SaleOrder order = new SaleOrder();
        order.setOrderNo(generateOrderNo());
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setRemark(request.getRemark());
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("商品不存在: " + itemRequest.getProductId()));
            
            if (product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("库存不足: " + product.getName());
            }
            
            SaleOrderItem item = new SaleOrderItem();
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setQuantity(itemRequest.getQuantity());
            item.setPrice(itemRequest.getPrice() != null ? itemRequest.getPrice() : product.getSalePrice());
            item.setAmount(item.getPrice().multiply(new BigDecimal(item.getQuantity())));
            
            order.addItem(item);
            totalAmount = totalAmount.add(item.getAmount());
            
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
        }
        
        order.setTotalAmount(totalAmount);
        return saleOrderRepository.save(order);
    }
    
    private String generateOrderNo() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String datePart = LocalDate.now().format(formatter);
        String randomPart = String.format("%06d", (int) (Math.random() * 1000000));
        return "SO" + datePart + randomPart;
    }
}