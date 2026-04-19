package com.ims.service;

import com.ims.entity.Product;
import com.ims.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    public List<Product> findAll() {
        return productRepository.findAll();
    }
    
    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }
    
    public Product save(Product product) {
        if (product.getStock() == null) {
            product.setStock(0);
        }
        if (product.getMinStock() == null) {
            product.setMinStock(10);
        }
        return productRepository.save(product);
    }
    
    public void deleteById(Long id) {
        productRepository.deleteById(id);
    }
    
    public List<Product> findLowStockProducts() {
        return productRepository.findByStockLessThanEqual(10);
    }
    
    public List<Product> searchByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }
    
    public void updateStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("商品不存在"));
        product.setStock(product.getStock() + quantity);
        productRepository.save(product);
    }
    
    public boolean existsByCode(String code) {
        return productRepository.existsByCode(code);
    }
}