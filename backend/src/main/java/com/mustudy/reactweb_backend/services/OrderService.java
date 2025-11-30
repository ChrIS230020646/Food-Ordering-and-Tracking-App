package com.mustudy.reactweb_backend.services;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mustudy.reactweb_backend.dto.CreateOrderRequest;
import com.mustudy.reactweb_backend.dto.OrderDTO;
import com.mustudy.reactweb_backend.dto.OrderItemDTO;
import com.mustudy.reactweb_backend.models.Order;
import com.mustudy.reactweb_backend.models.OrderItem;
import com.mustudy.reactweb_backend.repositories.CustomerRepository;
import com.mustudy.reactweb_backend.repositories.DeliveryStaffRepository;
import com.mustudy.reactweb_backend.repositories.MenuItemRepository;
import com.mustudy.reactweb_backend.repositories.OrderItemRepository;
import com.mustudy.reactweb_backend.repositories.OrderRepository;
import com.mustudy.reactweb_backend.repositories.RestaurantRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private DeliveryStaffRepository deliveryStaffRepository;

    @Autowired
    private JwtService jwtService;

    @Transactional
    public OrderDTO createOrder(String token, CreateOrderRequest request) {
        // Get customer ID from token
        Integer custid = getCustomerIdFromToken(token);
        if (custid == null) {
            throw new RuntimeException("Invalid token or not a customer token");
        }

        // Create order
        Order order = new Order();
        order.setCustid(custid);
        order.setRestid(request.getRestid());
        order.setAddressid(request.getAddressid());
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus(Order.OrderStatus.pending);
        order.setRemark(request.getRemark());
        order.setCreatedTime(new Timestamp(System.currentTimeMillis()));

        // Calculate total amount
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            BigDecimal itemPrice = BigDecimal.valueOf(itemReq.getPrice());
            BigDecimal quantity = BigDecimal.valueOf(itemReq.getQuantity());
            totalAmount = totalAmount.add(itemPrice.multiply(quantity));
        }
        order.setTotalAmount(totalAmount);

        // Save order
        order = orderRepository.save(order);
        
        // Debug: Log total amount
        System.out.println("Order created with totalAmount: " + order.getTotalAmount());

        // Create order items
        List<OrderItem> orderItems = new ArrayList<>();
        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderid(order.getOrderid());
            orderItem.setItemId(itemReq.getItemId());
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPrice(BigDecimal.valueOf(itemReq.getPrice()));
            orderItems.add(orderItem);
        }
        orderItemRepository.saveAll(orderItems);

        return convertToDTO(order);
    }

    public List<OrderDTO> getCustomerOrders(String token) {
        Integer custid = getCustomerIdFromToken(token);
        if (custid == null) {
            throw new RuntimeException("Invalid token or not a customer token");
        }

        // Get orders sorted by created time descending (newest first)
        List<Order> orders = orderRepository.findByCustidOrderByCreatedTimeDesc(custid);
        System.out.println("getCustomerOrders - Customer ID: " + custid + ", Found " + orders.size() + " orders");
        for (Order order : orders) {
            System.out.println("  Order ID: " + order.getOrderid() + ", Status: " + order.getStatus() + ", TotalAmount: " + order.getTotalAmount() + ", Restaurant: " + order.getRestid() + ", Created: " + order.getCreatedTime());
        }
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getPendingOrdersForDelivery() {
        List<Order> orders = orderRepository.findByStatusAndDeliverManIdIsNull(Order.OrderStatus.pending);
        System.out.println("getPendingOrdersForDelivery - Found " + orders.size() + " pending orders");
        for (Order order : orders) {
            System.out.println("  Order ID: " + order.getOrderid() + ", Status: " + order.getStatus() + ", TotalAmount: " + order.getTotalAmount());
        }
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getDeliveryStaffOrders(String token) {
        Integer staffId = jwtService.getStaffIdFromToken(token);
        if (staffId == null) {
            throw new RuntimeException("Invalid token or not a delivery staff token");
        }

        List<Order> orders = orderRepository.findByDeliverManId(staffId);
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getOrderHistory(String token) {
        Integer custid = getCustomerIdFromToken(token);
        if (custid == null) {
            throw new RuntimeException("Invalid token or not a customer token");
        }

        // Get all delivered orders for this customer, sorted by created time descending (newest first)
        List<Order> orders = orderRepository.findByCustidAndStatusOrderByCreatedTimeDesc(custid, Order.OrderStatus.delivered);
        System.out.println("getOrderHistory - Customer ID: " + custid + ", Found " + orders.size() + " delivered orders");
        for (Order order : orders) {
            System.out.println("  Order ID: " + order.getOrderid() + ", Status: " + order.getStatus() + ", TotalAmount: " + order.getTotalAmount() + ", Created: " + order.getCreatedTime());
        }
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO acceptOrder(String token, Integer orderId) {
        Integer staffId = jwtService.getStaffIdFromToken(token);
        if (staffId == null) {
            throw new RuntimeException("Invalid token or not a delivery staff token");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getDeliverManId() != null) {
            throw new RuntimeException("Order already accepted by another delivery staff");
        }

        order.setDeliverManId(staffId);
        order.setStatus(Order.OrderStatus.delivering);
        order.setStartDeliverTime(new Timestamp(System.currentTimeMillis()));

        order = orderRepository.save(order);
        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Integer orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        try {
            order.setStatus(Order.OrderStatus.valueOf(status));
            if (status.equals("delivered")) {
                order.setEndDeliverTime(new Timestamp(System.currentTimeMillis()));
            }
            order = orderRepository.save(order);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }

        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO cancelOrder(String token, Integer orderId) {
        // Check if token is from delivery staff
        Integer staffId = jwtService.getStaffIdFromToken(token);
        
        if (staffId == null) {
            throw new RuntimeException("Invalid token or not a delivery staff token");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify that the order is assigned to this delivery staff
        if (order.getDeliverManId() == null || !order.getDeliverManId().equals(staffId)) {
            throw new RuntimeException("You can only cancel orders assigned to you");
        }

        // Check if order can be cancelled (only delivering orders can be cancelled by delivery staff)
        if (order.getStatus() == Order.OrderStatus.delivered || 
            order.getStatus() == Order.OrderStatus.cancelled) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }

        // Release the order back to pending status so other delivery staff can accept it
        // Remove delivery staff assignment and reset delivery times
        order.setStatus(Order.OrderStatus.pending);
        order.setDeliverManId(null);
        order.setStartDeliverTime(null);
        order.setEndDeliverTime(null);
        order = orderRepository.save(order);

        return convertToDTO(order);
    }

    private Integer getCustomerIdFromToken(String token) {
        try {
            var claims = jwtService.parseToken(token);
            String role = claims.get("role", String.class);
            if ("customer".equals(role)) {
                String subject = claims.getSubject();
                return Integer.parseInt(subject);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setOrderid(order.getOrderid());
        dto.setCustid(order.getCustid());
        dto.setRestid(order.getRestid());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setDeliverManId(order.getDeliverManId());
        dto.setStartDeliverTime(order.getStartDeliverTime());
        dto.setEndDeliverTime(order.getEndDeliverTime());
        dto.setStatus(order.getStatus().name());
        dto.setRemark(order.getRemark());
        
        // Ensure totalAmount is set - if null or zero, calculate from items
        BigDecimal totalAmount = order.getTotalAmount();
        if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) == 0) {
            // Calculate from order items if totalAmount is missing or zero
            List<OrderItem> orderItems = orderItemRepository.findByOrderid(order.getOrderid());
            totalAmount = BigDecimal.ZERO;
            for (OrderItem item : orderItems) {
                BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                totalAmount = totalAmount.add(itemTotal);
            }
            // Update order if totalAmount was missing
            if (order.getTotalAmount() == null || order.getTotalAmount().compareTo(BigDecimal.ZERO) == 0) {
                order.setTotalAmount(totalAmount);
                orderRepository.save(order);
            }
        }
        dto.setTotalAmount(totalAmount);
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setCreatedTime(order.getCreatedTime());

        // Get restaurant name
        if (order.getRestid() != null) {
            restaurantRepository.findById(order.getRestid())
                    .ifPresent(rest -> dto.setRestaurantName(rest.getRestname()));
        }

        // Get delivery staff info
        if (order.getDeliverManId() != null) {
            deliveryStaffRepository.findById(order.getDeliverManId())
                    .ifPresent(staff -> {
                        dto.setDeliveryStaffName(staff.getName());
                        dto.setDeliveryStaffPhone(staff.getPhone());
                    });
        }

        // Get order items
        List<OrderItem> orderItems = orderItemRepository.findByOrderid(order.getOrderid());
        List<OrderItemDTO> itemDTOs = new ArrayList<>();
        for (OrderItem item : orderItems) {
            OrderItemDTO itemDTO = new OrderItemDTO();
            itemDTO.setItemId(item.getItemId());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setPrice(item.getPrice());
            itemDTO.setSubtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));

            // Get menu item details
            menuItemRepository.findById(item.getItemId())
                    .ifPresent(menuItem -> {
                        itemDTO.setItemName(menuItem.getItemName());
                        itemDTO.setDescription(menuItem.getDescription());
                    });

            itemDTOs.add(itemDTO);
        }
        dto.setItems(itemDTOs);

        // Calculate estimated delivery time
        if (order.getCreatedTime() != null) {
            LocalDateTime createdTime = order.getCreatedTime().toLocalDateTime();
            LocalDateTime estimatedStart = createdTime.plusMinutes(20);
            LocalDateTime estimatedEnd = createdTime.plusMinutes(30);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
            dto.setEstimatedDeliveryTime(estimatedStart.format(formatter) + " - " + estimatedEnd.format(formatter));
        }

        return dto;
    }
}

