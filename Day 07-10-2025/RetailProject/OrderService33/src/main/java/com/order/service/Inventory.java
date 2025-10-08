package com.order.service;

import java.util.*;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import com.order.TestOrder;

@Service
public class Inventory {
	
	private final List<String> message = new ArrayList<>();
	
	
	@KafkaListener(topics = "${topic.Inventory}", groupId = "Inventory_group")
	public void consumer(String m) {
		System.out.println("Recieved order:" +m);
		message.add(m);
	}
	
	public List<String> getMessage(){
		return message;
	}
}
