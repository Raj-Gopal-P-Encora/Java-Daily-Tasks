package com.ordertest.controller;

import org.springframework.web.bind.annotation.*;

import com.ordertest.model.Order;

@RestController
@RequestMapping("/order")
public class OrderController {
	
	@GetMapping("/{id}")
	public Order getOrderById(@PathVariable("id") int id) {
		return new Order(id,"Laptop",20000.0);
	}

}
