package com.ims.repository;

import com.ims.entity.SaleOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleOrderRepository extends JpaRepository<SaleOrder, Long> {
    List<SaleOrder> findByCreateTimeBetweenOrderByCreateTimeDesc(LocalDateTime start, LocalDateTime end);
    List<SaleOrder> findAllByOrderByCreateTimeDesc();
}