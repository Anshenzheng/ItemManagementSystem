package com.ims.repository;

import com.ims.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStockLessThanEqual(Integer minStock);
    List<Product> findByNameContainingIgnoreCase(String name);
    boolean existsByCode(String code);
}