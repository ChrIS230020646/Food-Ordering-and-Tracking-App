package com.mustudy.reactweb_backend.services;

import com.mustudy.reactweb_backend.models.*;
import com.mustudy.reactweb_backend.dto.*;
import com.mustudy.reactweb_backend.repositories.MenuItemsRepository;
import com.mustudy.reactweb_backend.repositories.OrderItemsRepository;
import com.mustudy.reactweb_backend.repositories.OrderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemsRepository orderItemsRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private MenuItemsRepository menuItemsRepository;

    @Transactional
    public Orders createOrderFromCart(Integer custid, Integer restid, Integer addressid, String shippingAddress,
            String remark) {

        List<CartService.CartItem> cartItems = cartService.getCartItems(custid.toString());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("購物車冇嘢，無法創建訂單");
        }

        // 2. 計算總金額（從數據庫獲取最新價格，避免購物車價格被篡改）
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartService.CartItem cartItem : cartItems) {
            // 從數據庫獲取菜單項的最新價格
            MenuItems menuItem = menuItemsRepository.findById(cartItem.getItemId())
                    .orElseThrow(() -> new RuntimeException("商品不存在: " + cartItem.getItemId()));

            BigDecimal itemTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        Orders order = new Orders();
        order.setCustid(custid);
        order.setRestid(restid);
        order.setAddressid(addressid);
        order.setShippingAddress(shippingAddress);
        order.setRemark(remark);
        order.setTotalAmount(totalAmount);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setStatus(Orders.OrderStatus.pending);
        order.setCreatedTime(new Timestamp(System.currentTimeMillis()));

        Orders savedOrder = orderRepository.save(order);

        List<OrderItems> orderItemsList = cartItems.stream().map(cartItem -> {
            OrderItems orderItem = new OrderItems();
            orderItem.setOrderid(savedOrder.getOrderid());
            orderItem.setItemId(cartItem.getItemId());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getPrice());
            orderItem.setCreatedTime(new Timestamp(System.currentTimeMillis()));
            return orderItem;
        }).collect(Collectors.toList());

        orderItemsRepository.saveAll(orderItemsList);

        cartService.clearCart(custid.toString());

        return savedOrder;
    }

    public List<Orders> getOrdersByCustomer(Integer custid) {
        return orderRepository.findByCustid(custid);
    }

    public Orders getOrderWithItems(Integer orderid) {
        Orders order = orderRepository.findById(orderid)
                .orElseThrow(() -> new RuntimeException("訂單不存在"));

        List<OrderItems> orderItems = orderItemsRepository.findByOrderid(orderid);

        orderItems.forEach(orderItem -> {
            MenuItems menuItem = menuItemsRepository.findById(orderItem.getItemId()).orElse(null);
            if (menuItem != null) {
                orderItem.setItemName(menuItem.getItemName());
            }
        });

        return order;
    }

    public Orders updateOrderStatus(Integer orderid, Orders.OrderStatus newStatus) {
        Orders order = orderRepository.findById(orderid)
                .orElseThrow(() -> new RuntimeException("訂單不存在"));

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    public Orders cancelOrder(Integer orderid) {
        return updateOrderStatus(orderid, Orders.OrderStatus.cancelled);
    }

    // 獲取訂單狀態歷史（demo）
    public List<Map<String, Object>> getOrderStatusHistory(Integer orderid) {
        Orders order = orderRepository.findById(orderid)
                .orElseThrow(() -> new RuntimeException("訂單不存在"));

        List<Map<String, Object>> history = new ArrayList<>();

        history.add(createStatusRecord("訂單已創建", order.getCreatedTime()));

        if (order.getStatus().ordinal() >= Orders.OrderStatus.preparing.ordinal()) {
            history.add(createStatusRecord("餐廳已接單",
                    new Timestamp(order.getCreatedTime().getTime() + 5 * 1000)));
        }

        if (order.getStatus().ordinal() >= Orders.OrderStatus.ready.ordinal()) {
            history.add(createStatusRecord("餐廳准備中",
                    new Timestamp(order.getCreatedTime().getTime() + 10 * 1000)));
        }

        if (order.getStatus().ordinal() >= Orders.OrderStatus.out_for_delivery.ordinal()) {
            history.add(createStatusRecord("外賣員已接單",
                    new Timestamp(order.getCreatedTime().getTime() + 15 * 1000)));
            history.add(createStatusRecord("正在配送中",
                    new Timestamp(order.getCreatedTime().getTime() + 20 * 1000)));
        }

        if (order.getStatus().ordinal() >= Orders.OrderStatus.delivered.ordinal()) {
            history.add(createStatusRecord("訂單已完成",
                    new Timestamp(order.getCreatedTime().getTime() + 25 * 1000)));
        }

        return history;
    }

    private Map<String, Object> createStatusRecord(String status, Timestamp timestamp) {
        Map<String, Object> record = new HashMap<>();
        record.put("status", status);
        record.put("timestamp", timestamp);
        record.put("description", getStatusDescription(status));
        return record;
    }

    private String getStatusDescription(String status) {
        switch (status) {
            case "訂單已創建":
                return "您的訂單已經成功創建，等待餐廳確認";
            case "餐廳已接單":
                return "餐廳已接單";
            case "餐廳准備中":
                return "餐廳准備中";
            case "外賣員已接單":
                return "外賣員已接單";
            case "正在配送中":
                return "外賣員正在配送";
            case "訂單已完成":
                return "訂單已完成，感謝您的使用";
            default:
                return "訂單狀態更新";
        }
    }

    // 獲取可用的訂單，呢part專for外賣員
    public List<Orders> getAvailableOrders() {
        // 獲取所有狀態為"ready"的訂單
        return orderRepository.findByDeliverManIdIsNullAndStatusIn(
                Arrays.asList(Orders.OrderStatus.ready));
    }

    // 接單
    @Transactional
    public Orders acceptOrder(Integer orderid, Integer deliveryManId) {
        Orders order = orderRepository.findById(orderid)
                .orElseThrow(() -> new RuntimeException("訂單不存在"));

        if (order.getDeliverManId() != null) {
            throw new RuntimeException("訂單已被其他外賣員接單");
        }

        if (order.getStatus() != Orders.OrderStatus.ready) {
            throw new RuntimeException("訂單狀態不允許接單");
        }

        order.setDeliverManId(deliveryManId);
        order.setStatus(Orders.OrderStatus.out_for_delivery);
        order.setStartDeliverTime(new Timestamp(System.currentTimeMillis()));

        return orderRepository.save(order);
    }

    // 完成
    @Transactional
    public Orders completeOrder(Integer orderid) {
        Orders order = orderRepository.findById(orderid)
                .orElseThrow(() -> new RuntimeException("訂單不存在"));

        if (order.getStatus() != Orders.OrderStatus.out_for_delivery) {
            throw new RuntimeException("訂單狀態不允許完成");
        }

        order.setStatus(Orders.OrderStatus.delivered);
        order.setEndDeliverTime(new Timestamp(System.currentTimeMillis()));

        return orderRepository.save(order);
    }

    // 餐廳接單
    @Transactional
    public Orders markOrderAsReady(Integer orderid) {
        Orders order = orderRepository.findById(orderid)
                .orElseThrow(() -> new RuntimeException("訂單不存在"));

        if (order.getStatus() != Orders.OrderStatus.preparing) {
            throw new RuntimeException("訂單狀態不允許標記為準備完成");
        }

        order.setStatus(Orders.OrderStatus.ready);
        return orderRepository.save(order);
    }

    // get外賣員
    public List<Orders> getOrdersByDeliveryMan(Integer deliveryManId) {
        return orderRepository.findByDeliverManId(deliveryManId);
    }

    private OrderResponse convertToOrderResponse(Orders order) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderid());
        response.setStatus(order.getStatus().name());
        response.setTotalAmount(order.getTotalAmount());
        response.setDiscountAmount(order.getDiscountAmount());
        response.setRemark(order.getRemark());
        response.setCreatedTime(order.getCreatedTime());
        response.setShippingAddress(order.getShippingAddress());

        if (order.getCustomer() != null) {
            response.setCustomerName(order.getCustomer().getCustname());
        }
        if (order.getRestaurant() != null) {
            response.setRestaurantName(order.getRestaurant().getRestname());
        }

        return response;
    }

    private OrderItemResponse convertToOrderItemResponse(OrderItems orderItem) {
        OrderItemResponse response = new OrderItemResponse();
        response.setItemId(orderItem.getItemId());
        response.setQuantity(orderItem.getQuantity());
        response.setPrice(orderItem.getPrice());

        if (orderItem.getMenuItem() != null) {
            response.setItemName(orderItem.getMenuItem().getItemName());
        } else {
            MenuItems menuItem = menuItemsRepository.findById(orderItem.getItemId()).orElse(null);
            if (menuItem != null) {
                response.setItemName(menuItem.getItemName());
            }
        }

        return response;
    }

    public List<OrderResponse> getOrdersByCustomerDTO(Integer custid) {
        List<Orders> orders = getOrdersByCustomer(custid);
        return orders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    public OrderDetailResponse getOrderDetailDTO(Integer orderid) {
        Orders order = getOrderWithItems(orderid);
        OrderResponse orderResponse = convertToOrderResponse(order);

        List<OrderItems> orderItems = orderItemsRepository.findByOrderid(orderid);
        List<OrderItemResponse> orderItemResponses = orderItems.stream()
                .map(this::convertToOrderItemResponse)
                .collect(Collectors.toList());
        orderResponse.setOrderItems(orderItemResponses);

        List<Map<String, Object>> history = getOrderStatusHistory(orderid);

        OrderDetailResponse response = new OrderDetailResponse();
        response.setSuccess(true);
        response.setMessage("成功");
        response.setOrder(orderResponse);
        response.setHistory(history);
        return response;
    }

    @Transactional
    public OrderResponse createOrderFromCartDTO(CreateOrderRequest request) {
        Orders order = createOrderFromCart(
                request.getCustid(),
                request.getRestid(),
                request.getAddressid(),
                request.getShippingAddress(),
                request.getRemark());
        return convertToOrderResponse(order);
    }
}