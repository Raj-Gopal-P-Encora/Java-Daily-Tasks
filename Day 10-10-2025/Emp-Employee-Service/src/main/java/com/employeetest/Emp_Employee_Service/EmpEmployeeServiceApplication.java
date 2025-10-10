package com.employeetest.Emp_Employee_Service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication(scanBasePackages = "com.employeetest.controller")
public class EmpEmployeeServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(EmpEmployeeServiceApplication.class, args);
	}
	
	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

}
