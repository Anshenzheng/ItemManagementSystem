package com.ims.controller;

import com.ims.dto.ApiResponse;
import com.ims.entity.Product;
import com.ims.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:4200")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @GetMapping
    public ApiResponse<List<Product>> getAllProducts() {
        return ApiResponse.success(productService.findAll());
    }
    
    @GetMapping("/{id}")
    public ApiResponse<Product> getProductById(@PathVariable Long id) {
        return productService.findById(id)
            .map(ApiResponse::success)
            .orElse(ApiResponse.error("商品不存在"));
    }
    
    @PostMapping
    public ApiResponse<Product> createProduct(@RequestBody Product product) {
        Product saved = productService.save(product);
        return ApiResponse.success(saved, "商品创建成功");
    }
    
    @PutMapping("/{id}")
    public ApiResponse<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return productService.findById(id)
            .map(existing -> {
                product.setId(id);
                product.setCreateTime(existing.getCreateTime());
                Product updated = productService.save(product);
                return ApiResponse.success(updated, "商品更新成功");
            })
            .orElse(ApiResponse.error("商品不存在"));
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        if (productService.findById(id).isPresent()) {
            productService.deleteById(id);
            return ApiResponse.success(null, "商品删除成功");
        }
        return ApiResponse.error("商品不存在");
    }
    
    @GetMapping("/search")
    public ApiResponse<List<Product>> searchProducts(@RequestParam String name) {
        return ApiResponse.success(productService.searchByName(name));
    }
    
    @GetMapping("/low-stock")
    public ApiResponse<List<Product>> getLowStockProducts() {
        return ApiResponse.success(productService.findLowStockProducts());
    }
}