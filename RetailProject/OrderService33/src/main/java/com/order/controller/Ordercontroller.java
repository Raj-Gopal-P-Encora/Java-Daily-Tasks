package com.order.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.order.service.Inventory;

@RestController
@RequestMapping("/api/orders")
public class Ordercontroller {
	
	private final Inventory inventory;
	 
	public Ordercontroller(Inventory inventory) {
		super();
		this.inventory = inventory;
	}
	
	@GetMapping
	public List<String> getReceivedOrders(){
		return inventory.getMessage();
	}

}
